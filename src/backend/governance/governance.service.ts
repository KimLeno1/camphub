import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { db } from '../../db';
import { governanceCases, juryMembers, votes, penalties, users, userReputations, messages, resources } from '../../db/schema';
import { eq, and, sql, desc, or } from 'drizzle-orm';

@Injectable()
export class GovernanceService {
  
  // Helper to resolve all expired cases (> 7 days open)
  async resolveExpiredCases() {
    try {
      const activeCases = await db.select().from(governanceCases).where(eq(governanceCases.status, 'voting'));
      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      for (const c of activeCases) {
        if (now - new Date(c.createdAt).getTime() >= SEVEN_DAYS_MS) {
          await this.resolveCaseByMajority(c.id);
        }
      }
    } catch (error) {
      console.error('Error resolving expired governance cases:', error);
    }
  }

  // Resolve a case by majority vote
  async resolveCaseByMajority(caseId: string) {
    try {
      const caseResult = await db.select().from(governanceCases).where(eq(governanceCases.id, caseId));
      if (!caseResult.length) return;
      const targetCase = caseResult[0];

      if (targetCase.status !== 'voting') return;

      const totalJury = await db.select().from(juryMembers).where(eq(juryMembers.caseId, caseId));
      let actionVotes = 0;
      let noActionVotes = 0;

      for (const member of totalJury) {
        if (member.hasVoted) {
          const voteResult = await db.select().from(votes).where(eq(votes.juryMemberId, member.id));
          if (voteResult.length) {
            const decision = voteResult[0].decision;
            if (decision === 'action') actionVotes++;
            else if (decision === 'no_action') noActionVotes++;
          }
        }
      }

      // Majority carries the vote (if tied or no action > action, dismiss)
      const finalDecision = actionVotes > noActionVotes ? 'action' : 'no_action';

      await db.update(governanceCases)
        .set({ 
          status: 'resolved', 
          decision: finalDecision,
          updatedAt: new Date() 
        })
        .where(eq(governanceCases.id, caseId));

      console.log(`Case ${caseId} resolved by majority vote: ${finalDecision} (Action: ${actionVotes}, No Action: ${noActionVotes})`);

      if (finalDecision === 'action') {
        await this.executePenalties(targetCase);
      }
    } catch (error) {
      console.error(`Failed to resolve case ${caseId} by majority:`, error);
    }
  }

  // 1. REPORT ENGINE & EVIDENCE: Submit report (All users can submit)
  async createCase(
    uid: string, 
    targetType: 'user' | 'message' | 'resource' | 'community', 
    targetId: string, 
    reason: string,
    evidenceUrl?: string,
    evidenceDescription?: string
  ) {
    try {
      // 1. Get Reporter
      const reporterResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!reporterResult.length) throw new NotFoundException('User not found');
      const reporter = reporterResult[0];

      // Check that the reported target exists
      if (targetType === 'user') {
        const targetUser = await db.select().from(users).where(eq(users.id, targetId));
        if (!targetUser.length) throw new NotFoundException('Target user not found');
      } else if (targetType === 'message') {
        const targetMsg = await db.select().from(messages).where(eq(messages.id, targetId));
        if (!targetMsg.length) throw new NotFoundException('Target message not found');
      } else if (targetType === 'resource') {
        const targetRes = await db.select().from(resources).where(eq(resources.id, targetId));
        if (!targetRes.length) throw new NotFoundException('Target resource not found');
      }

      // 2. Create the case directly in 'voting' status, open to ALL users for 7 days
      const newCase = await db.insert(governanceCases).values({
        targetType,
        targetId,
        reporterId: reporter.id,
        reason,
        evidenceUrl: evidenceUrl || null,
        evidenceDescription: evidenceDescription || null,
        status: 'voting',
      }).returning();

      return newCase[0];
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      console.error('Failed to create governance case:', error);
      throw new InternalServerErrorException('Failed to submit report');
    }
  }

  // 2. VOTING: All users can vote on any open case (1 user = 1 equal vote)
  async castVote(uid: string, caseId: string, decision: 'action' | 'no_action' | 'abstain', justification?: string) {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      const user = userResult[0];

      const caseResult = await db.select().from(governanceCases).where(eq(governanceCases.id, caseId));
      if (!caseResult.length) throw new NotFoundException('Case not found');
      const targetCase = caseResult[0];

      if (targetCase.status !== 'voting') {
        throw new BadRequestException('This case is no longer open for voting');
      }

      // Check 7 day voting window limit
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const isExpired = Date.now() - new Date(targetCase.createdAt).getTime() >= SEVEN_DAYS_MS;
      if (isExpired) {
        await this.resolveCaseByMajority(caseId);
        throw new BadRequestException('Voting for this case closed after 7 days.');
      }

      // Find or create jury membership record for this user and case
      const juryResult = await db.select().from(juryMembers)
        .where(
          and(
            eq(juryMembers.caseId, caseId),
            eq(juryMembers.userId, user.id)
          )
        );

      let juryMember;
      if (juryResult.length > 0) {
        juryMember = juryResult[0];
        if (juryMember.hasVoted) {
          throw new BadRequestException('You have already cast your vote for this case');
        }
        await db.update(juryMembers).set({ hasVoted: true }).where(eq(juryMembers.id, juryMember.id));
      } else {
        const newJury = await db.insert(juryMembers).values({
          caseId,
          userId: user.id,
          hasVoted: true,
        }).returning();
        juryMember = newJury[0];
      }

      // Record vote with equal weight (1.0 for all users)
      await db.insert(votes).values({
        juryMemberId: juryMember.id,
        decision,
        weight: '1.0',
        justification: justification || null,
      });

      // Increment votes cast count in user reputation stats
      const existingRep = await db.select().from(userReputations).where(eq(userReputations.userId, user.id));
      if (!existingRep.length) {
        await db.insert(userReputations).values({ userId: user.id, points: 100, votesCast: 1 });
      } else {
        await db.update(userReputations).set({ votesCast: sql`${userReputations.votesCast} + 1` }).where(eq(userReputations.userId, user.id));
      }

      // REINSTATEMENT CHECK: If this is a reinstatement petition and vote is 'action'
      let reinstated = false;
      const isReinstatementPetition = targetCase.targetType === 'user' && (targetCase.reason.includes('REINSTATEMENT') || targetCase.reason.includes('reinstatement'));
      
      if (isReinstatementPetition && decision === 'action') {
        // Count total 'action' votes on this petition
        const allJury = await db.select().from(juryMembers).where(eq(juryMembers.caseId, caseId));
        let actionVotes = 0;
        for (const j of allJury) {
          if (j.hasVoted) {
            const v = await db.select().from(votes).where(eq(votes.juryMemberId, j.id));
            if (v.length && v[0].decision === 'action') actionVotes++;
          }
        }

        // Determine required vote threshold used to ban him
        const banCases = await db.select().from(governanceCases).where(
          and(
            eq(governanceCases.targetType, 'user'),
            eq(governanceCases.targetId, targetCase.targetId),
            eq(governanceCases.decision, 'action')
          )
        ).orderBy(desc(governanceCases.updatedAt));

        let requiredVotes = 3;
        if (banCases.length > 0) {
          const originalBanJury = await db.select().from(juryMembers).where(eq(juryMembers.caseId, banCases[0].id));
          let originalActCount = 0;
          for (const j of originalBanJury) {
            if (j.hasVoted) {
              const v = await db.select().from(votes).where(eq(votes.juryMemberId, j.id));
              if (v.length && v[0].decision === 'action') originalActCount++;
            }
          }
          if (originalActCount > 0) requiredVotes = originalActCount;
        }

        if (actionVotes >= requiredVotes) {
          // Immediately reinstate user!
          reinstated = true;
          await db.update(users).set({ status: 'active', updatedAt: new Date() }).where(eq(users.id, targetCase.targetId));
          await db.update(governanceCases).set({ status: 'resolved', decision: 'action', updatedAt: new Date() }).where(eq(governanceCases.id, caseId));
          await db.delete(penalties).where(eq(penalties.userId, targetCase.targetId));
          await this.updateUserReputation(targetCase.targetId, 50);
        }
      }

      return { 
        success: true, 
        reinstated, 
        message: reinstated ? 'Vote cast! Required vote threshold achieved — user has been reinstated.' : 'Vote cast successfully.' 
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) throw error;
      console.error('Failed to cast vote:', error);
      throw new InternalServerErrorException('Failed to cast vote');
    }
  }

  // 3. PENALTY ENGINE & REPUTATION UPDATE
  private async executePenalties(targetCase: any) {
    try {
      let offenderUserId: string | null = null;

      // Identify the offending user ID based on target type
      if (targetCase.targetType === 'user') {
        offenderUserId = targetCase.targetId;
      } else if (targetCase.targetType === 'message') {
        const msg = await db.select().from(messages).where(eq(messages.id, targetCase.targetId));
        if (msg.length) {
          offenderUserId = msg[0].userId;
          // Soft-delete content
          await db.update(messages).set({ deletedAt: new Date() }).where(eq(messages.id, targetCase.targetId));
        }
      } else if (targetCase.targetType === 'resource') {
        const res = await db.select().from(resources).where(eq(resources.id, targetCase.targetId));
        if (res.length) {
          offenderUserId = res[0].uploaderId;
          // Soft-delete resource and flag scan status
          await db.update(resources).set({ deletedAt: new Date(), scanStatus: 'flagged' }).where(eq(resources.id, targetCase.targetId));
        }
      }

      if (offenderUserId) {
        // 1. Add entry in Penalties table
        await db.insert(penalties).values({
          userId: offenderUserId,
          caseId: targetCase.id,
          type: targetCase.targetType === 'user' ? 'suspension' : 'rep_deduction',
          expiresAt: targetCase.targetType === 'user' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        });

        // 2. Suspend user if target is user
        if (targetCase.targetType === 'user') {
          await db.update(users)
            .set({ status: 'suspended', updatedAt: new Date() })
            .where(eq(users.id, offenderUserId));
        }

        // 3. Deduct Reputation Points (-50 reputation points)
        await this.updateUserReputation(offenderUserId, -50);
      }

      // 4. Increment reporter's successful reports count
      const repCheck = await db.select().from(userReputations).where(eq(userReputations.userId, targetCase.reporterId));
      if (!repCheck.length) {
        await db.insert(userReputations).values({ userId: targetCase.reporterId, points: 100, successfulReports: 1 });
      } else {
        await db.update(userReputations)
          .set({ successfulReports: sql`${userReputations.successfulReports} + 1` })
          .where(eq(userReputations.userId, targetCase.reporterId));
      }

    } catch (error) {
      console.error('Failed to execute penalties:', error);
    }
  }

  // Helper to adjust reputation points
  async updateUserReputation(userId: string, pointsChange: number) {
    try {
      const rep = await db.select().from(userReputations).where(eq(userReputations.userId, userId));
      
      if (!rep.length) {
        await db.insert(userReputations).values({
          userId,
          points: Math.max(0, 100 + pointsChange),
        });
      } else {
        const newPoints = Math.max(0, rep[0].points + pointsChange);
        await db.update(userReputations)
          .set({ points: newPoints, updatedAt: new Date() })
          .where(eq(userReputations.userId, userId));
      }
    } catch (error) {
      console.error(`Failed to update reputation for user ${userId}:`, error);
    }
  }

  // 4. APPEALS FLOW: Penalized user can submit an appeal
  async submitAppeal(uid: string, caseId: string, appealReason: string) {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      const user = userResult[0];

      const caseResult = await db.select().from(governanceCases).where(eq(governanceCases.id, caseId));
      if (!caseResult.length) throw new NotFoundException('Case not found');
      const targetCase = caseResult[0];

      if (targetCase.status !== 'resolved' || targetCase.decision !== 'action') {
        throw new BadRequestException('Only resolved cases with active enforcement actions can be appealed.');
      }

      // Verify user appealing is the penalized party
      let isOffender = false;
      if (targetCase.targetType === 'user' && targetCase.targetId === user.id) {
        isOffender = true;
      } else if (targetCase.targetType === 'message') {
        const msg = await db.select().from(messages).where(eq(messages.id, targetCase.targetId));
        if (msg.length && msg[0].userId === user.id) isOffender = true;
      } else if (targetCase.targetType === 'resource') {
        const res = await db.select().from(resources).where(eq(resources.id, targetCase.targetId));
        if (res.length && res[0].uploaderId === user.id) isOffender = true;
      }

      if (!isOffender) {
        throw new ForbiddenException('Only the penalized party can submit an appeal for this decision.');
      }

      await db.update(governanceCases)
        .set({
          status: 'appealed',
          appealReason,
          updatedAt: new Date()
        })
        .where(eq(governanceCases.id, caseId));

      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) throw error;
      console.error('Failed to submit appeal:', error);
      throw new InternalServerErrorException('Failed to submit appeal');
    }
  }

  // Resolve an appeal (Open to community members)
  async resolveAppeal(uid: string, caseId: string, appealDecision: 'upheld' | 'reversed') {
    try {
      const reviewerResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!reviewerResult.length) throw new NotFoundException('User not found');

      const caseResult = await db.select().from(governanceCases).where(eq(governanceCases.id, caseId));
      if (!caseResult.length) throw new NotFoundException('Case not found');
      const targetCase = caseResult[0];

      if (targetCase.status !== 'appealed') {
        throw new BadRequestException('Case is not currently in appealed status.');
      }

      await db.update(governanceCases)
        .set({
          status: 'resolved',
          appealDecision,
          updatedAt: new Date()
        })
        .where(eq(governanceCases.id, caseId));

      if (appealDecision === 'reversed') {
        let offenderUserId: string | null = null;

        if (targetCase.targetType === 'user') {
          offenderUserId = targetCase.targetId;
          await db.update(users).set({ status: 'active' }).where(eq(users.id, offenderUserId));
        } else if (targetCase.targetType === 'message') {
          const msg = await db.select().from(messages).where(eq(messages.id, targetCase.targetId));
          if (msg.length) {
            offenderUserId = msg[0].userId;
            await db.update(messages).set({ deletedAt: null }).where(eq(messages.id, targetCase.targetId));
          }
        } else if (targetCase.targetType === 'resource') {
          const res = await db.select().from(resources).where(eq(resources.id, targetCase.targetId));
          if (res.length) {
            offenderUserId = res[0].uploaderId;
            await db.update(resources).set({ deletedAt: null, scanStatus: 'clean' }).where(eq(resources.id, targetCase.targetId));
          }
        }

        if (offenderUserId) {
          await db.delete(penalties).where(eq(penalties.caseId, targetCase.id));
          await this.updateUserReputation(offenderUserId, 50);
        }

        await db.update(userReputations)
          .set({ successfulReports: sql`GREATEST(0, ${userReputations.successfulReports} - 1)` })
          .where(eq(userReputations.userId, targetCase.reporterId));
      }

      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) throw error;
      console.error('Failed to resolve appeal:', error);
      throw new InternalServerErrorException('Failed to resolve appeal');
    }
  }

  // 5. PUBLIC MODERATION LOG: Fetch all resolved cases
  async getResolvedCases() {
    try {
      await this.resolveExpiredCases();

      const resolved = await db.select({
        id: governanceCases.id,
        targetType: governanceCases.targetType,
        targetId: governanceCases.targetId,
        reason: governanceCases.reason,
        evidenceUrl: governanceCases.evidenceUrl,
        evidenceDescription: governanceCases.evidenceDescription,
        status: governanceCases.status,
        decision: governanceCases.decision,
        appealReason: governanceCases.appealReason,
        appealDecision: governanceCases.appealDecision,
        createdAt: governanceCases.createdAt,
        updatedAt: governanceCases.updatedAt,
        reporter: {
          id: users.id,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        }
      })
      .from(governanceCases)
      .innerJoin(users, eq(governanceCases.reporterId, users.id))
      .where(
        or(
          eq(governanceCases.status, 'resolved'),
          eq(governanceCases.status, 'appealed')
        )
      )
      .orderBy(desc(governanceCases.updatedAt));

      // Compute vote tally details for each resolved case
      const result = [];
      for (const c of resolved) {
        const jury = await db.select().from(juryMembers).where(eq(juryMembers.caseId, c.id));
        let actionVotes = 0;
        let noActionVotes = 0;
        let totalVotes = 0;

        for (const j of jury) {
          if (j.hasVoted) {
            totalVotes++;
            const v = await db.select().from(votes).where(eq(votes.juryMemberId, j.id));
            if (v.length) {
              if (v[0].decision === 'action') actionVotes++;
              else if (v[0].decision === 'no_action') noActionVotes++;
            }
          }
        }

        result.push({
          ...c,
          totalVotes,
          actionVotes,
          noActionVotes,
        });
      }

      return result;
    } catch (error) {
      console.error('Failed to fetch public moderation log:', error);
      throw new InternalServerErrorException('Failed to fetch moderation logs');
    }
  }

  // Get case by ID, including votes and target content
  async getCaseDetails(caseId: string) {
    try {
      await this.resolveExpiredCases();

      const caseResult = await db.select({
        id: governanceCases.id,
        targetType: governanceCases.targetType,
        targetId: governanceCases.targetId,
        reason: governanceCases.reason,
        evidenceUrl: governanceCases.evidenceUrl,
        evidenceDescription: governanceCases.evidenceDescription,
        status: governanceCases.status,
        decision: governanceCases.decision,
        appealReason: governanceCases.appealReason,
        appealDecision: governanceCases.appealDecision,
        createdAt: governanceCases.createdAt,
        updatedAt: governanceCases.updatedAt,
        reporter: {
          id: users.id,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        }
      })
      .from(governanceCases)
      .innerJoin(users, eq(governanceCases.reporterId, users.id))
      .where(eq(governanceCases.id, caseId));

      if (!caseResult.length) throw new NotFoundException('Case not found');
      const targetCase: any = caseResult[0];

      // Fetch target content
      let targetContent: any = null;
      if (targetCase.targetType === 'user') {
        const u = await db.select().from(users).where(eq(users.id, targetCase.targetId));
        if (u.length) {
          targetContent = { id: u[0].id, displayName: u[0].displayName, avatarUrl: u[0].avatarUrl, trustLevel: u[0].trustLevel };
        }
      } else if (targetCase.targetType === 'message') {
        const m = await db.select({
          id: messages.id,
          content: messages.content,
          createdAt: messages.createdAt,
          author: {
            id: users.id,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          }
        })
        .from(messages)
        .innerJoin(users, eq(messages.userId, users.id))
        .where(eq(messages.id, targetCase.targetId));
        if (m.length) targetContent = m[0];
      } else if (targetCase.targetType === 'resource') {
        const r = await db.select({
          id: resources.id,
          title: resources.title,
          fileUrl: resources.fileUrl,
          mimeType: resources.mimeType,
          uploader: {
            id: users.id,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          }
        })
        .from(resources)
        .innerJoin(users, eq(resources.uploaderId, users.id))
        .where(eq(resources.id, targetCase.targetId));
        if (r.length) targetContent = r[0];
      }

      // Fetch votes
      const jury = await db.select({
        id: juryMembers.id,
        userId: juryMembers.userId,
        hasVoted: juryMembers.hasVoted,
        selectedAt: juryMembers.selectedAt,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(juryMembers)
      .innerJoin(users, eq(juryMembers.userId, users.id))
      .where(eq(juryMembers.caseId, caseId));

      const votesList = await db.select()
        .from(votes)
        .innerJoin(juryMembers, eq(votes.juryMemberId, juryMembers.id))
        .where(eq(juryMembers.caseId, caseId));

      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const createdAtTime = new Date(targetCase.createdAt).getTime();
      const expiresAt = new Date(createdAtTime + SEVEN_DAYS_MS).toISOString();

      return {
        ...targetCase,
        expiresAt,
        targetContent,
        jury,
        votes: votesList.map(v => ({
          id: v.votes.id,
          decision: v.votes.decision,
          weight: v.votes.weight,
          justification: v.votes.justification,
          createdAt: v.votes.createdAt,
        }))
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Failed to get case details:', error);
      throw new InternalServerErrorException('Failed to fetch case details');
    }
  }

  // Fetch all active open cases for community voting
  async getJuryDutiesForUser(uid: string) {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      const user = userResult[0];

      // First, auto-resolve any cases open for > 7 days
      await this.resolveExpiredCases();

      const activeCases = await db.select()
        .from(governanceCases)
        .where(eq(governanceCases.status, 'voting'))
        .orderBy(desc(governanceCases.createdAt));

      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

      const result = [];
      for (const c of activeCases) {
        // Check if current user has voted on this case
        const userJury = await db.select().from(juryMembers)
          .where(and(eq(juryMembers.caseId, c.id), eq(juryMembers.userId, user.id)));
        const hasVoted = userJury.length > 0 ? userJury[0].hasVoted : false;

        // Count votes cast
        const allJury = await db.select().from(juryMembers).where(eq(juryMembers.caseId, c.id));
        let actionVotes = 0;
        let noActionVotes = 0;
        let totalVotes = 0;

        for (const j of allJury) {
          if (j.hasVoted) {
            totalVotes++;
            const v = await db.select().from(votes).where(eq(votes.juryMemberId, j.id));
            if (v.length) {
              if (v[0].decision === 'action') actionVotes++;
              else if (v[0].decision === 'no_action') noActionVotes++;
            }
          }
        }

        const createdAtTime = new Date(c.createdAt).getTime();
        const expiresAt = new Date(createdAtTime + SEVEN_DAYS_MS).toISOString();

        result.push({
          id: c.id,
          targetType: c.targetType,
          targetId: c.targetId,
          reason: c.reason,
          evidenceUrl: c.evidenceUrl,
          evidenceDescription: c.evidenceDescription,
          status: c.status,
          createdAt: c.createdAt,
          expiresAt,
          hasVoted,
          totalVotes,
          actionVotes,
          noActionVotes,
        });
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Failed to fetch governance cases:', error);
      throw new InternalServerErrorException('Failed to fetch governance cases');
    }
  }

  // Get user's cases (submitted or received)
  async getMyCases(uid: string) {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      const user = userResult[0];

      await this.resolveExpiredCases();

      return await db.select()
        .from(governanceCases)
        .where(
          or(
            eq(governanceCases.reporterId, user.id),
            and(
              eq(governanceCases.targetType, 'user'),
              eq(governanceCases.targetId, user.id)
            )
          )
        )
        .orderBy(desc(governanceCases.createdAt));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Failed to get user cases:', error);
      throw new InternalServerErrorException('Failed to load user cases');
    }
  }

  // Get all suspended/banned users with reinstatement progress
  async getBannedUsers() {
    try {
      const suspendedUsers = await db.select().from(users).where(or(eq(users.status, 'suspended'), eq(users.status, 'banned')));
      
      const result = [];
      for (const u of suspendedUsers) {
        // Find original ban case
        const banCases = await db.select().from(governanceCases).where(
          and(
            eq(governanceCases.targetType, 'user'),
            eq(governanceCases.targetId, u.id),
            eq(governanceCases.decision, 'action')
          )
        ).orderBy(desc(governanceCases.updatedAt));

        let banVotes = 3; // Default threshold if unknown
        let banReason = 'Violation of Community Code of Conduct';
        let originalBanCaseId = null;

        if (banCases.length > 0) {
          originalBanCaseId = banCases[0].id;
          banReason = banCases[0].reason;
          
          const jury = await db.select().from(juryMembers).where(eq(juryMembers.caseId, originalBanCaseId));
          let actCount = 0;
          for (const j of jury) {
            if (j.hasVoted) {
              const v = await db.select().from(votes).where(eq(votes.juryMemberId, j.id));
              if (v.length && v[0].decision === 'action') actCount++;
            }
          }
          if (actCount > 0) banVotes = actCount;
        }

        // Find active reinstatement petition case
        const petitionCases = await db.select().from(governanceCases).where(
          and(
            eq(governanceCases.targetType, 'user'),
            eq(governanceCases.targetId, u.id),
            eq(governanceCases.status, 'voting')
          )
        ).orderBy(desc(governanceCases.createdAt));

        let activePetition = null;
        if (petitionCases.length > 0) {
          const petition = petitionCases.find(p => p.reason.includes('REINSTATEMENT') || p.reason.includes('reinstatement')) || petitionCases[0];
          
          const jury = await db.select().from(juryMembers).where(eq(juryMembers.caseId, petition.id));
          let petitionActionVotes = 0;
          let petitionTotalVotes = 0;
          for (const j of jury) {
            if (j.hasVoted) {
              petitionTotalVotes++;
              const v = await db.select().from(votes).where(eq(votes.juryMemberId, j.id));
              if (v.length && v[0].decision === 'action') petitionActionVotes++;
            }
          }

          activePetition = {
            id: petition.id,
            reason: petition.reason,
            createdAt: petition.createdAt,
            reinstatementVotes: petitionActionVotes,
            totalVotes: petitionTotalVotes,
            requiredVotes: banVotes,
          };
        }

        result.push({
          id: u.id,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          status: u.status,
          updatedAt: u.updatedAt,
          banReason,
          originalBanCaseId,
          banVotes,
          activePetition
        });
      }

      return result;
    } catch (error) {
      console.error('Failed to fetch banned users:', error);
      throw new InternalServerErrorException('Failed to fetch banned users');
    }
  }

  // Create a reinstatement petition for a banned user
  async createReinstatementPetition(uid: string, bannedUserId: string, reason: string) {
    try {
      const petitionerResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!petitionerResult.length) throw new NotFoundException('Petitioner not found');
      const petitioner = petitionerResult[0];

      const bannedUserResult = await db.select().from(users).where(eq(users.id, bannedUserId));
      if (!bannedUserResult.length) throw new NotFoundException('Banned user not found');
      const bannedUser = bannedUserResult[0];

      if (bannedUser.status === 'active') {
        throw new BadRequestException('User is already active and does not require reinstatement.');
      }

      // Check if active reinstatement petition already exists
      const existingPetition = await db.select().from(governanceCases).where(
        and(
          eq(governanceCases.targetType, 'user'),
          eq(governanceCases.targetId, bannedUserId),
          eq(governanceCases.status, 'voting')
        )
      );

      if (existingPetition.length > 0) {
        throw new BadRequestException('An active reinstatement petition is already open for this user.');
      }

      // Create new petition case
      const petitionCase = await db.insert(governanceCases).values({
        targetType: 'user',
        targetId: bannedUserId,
        reporterId: petitioner.id,
        reason: `[REINSTATEMENT PETITION] ${reason}`,
        status: 'voting'
      }).returning();

      return petitionCase[0];
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      console.error('Failed to petition reinstatement:', error);
      throw new InternalServerErrorException('Failed to submit reinstatement petition');
    }
  }
}

