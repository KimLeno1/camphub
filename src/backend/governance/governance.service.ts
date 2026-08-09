import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { db } from '../../db';
import { governanceCases, juryMembers, votes, penalties, users, userReputations, messages, resources } from '../../db/schema';
import { eq, and, sql, desc, or } from 'drizzle-orm';

@Injectable()
export class GovernanceService {
  
  // 1. REPORT ENGINE & EVIDENCE: Submit report
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

      // 2. Validate Trust Level (must be >= 2 to report)
      if (reporter.trustLevel < 2) {
        throw new ForbiddenException('Trust Level 2 (Member) is required to submit governance reports.');
      }

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

      // 3. Create the case with evidence
      const newCase = await db.insert(governanceCases).values({
        targetType,
        targetId,
        reporterId: reporter.id,
        reason,
        evidenceUrl: evidenceUrl || null,
        evidenceDescription: evidenceDescription || null,
        status: 'gathering_jury',
      }).returning();

      // Trigger jury assignment asynchronously (Message-queue simulation)
      this.assignJury(newCase[0].id).catch(err => console.error('Failed to assign jury async:', err));

      return newCase[0];
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      console.error('Failed to create governance case:', error);
      throw new InternalServerErrorException('Failed to submit report');
    }
  }

  // 2. JUROR SELECTION: Automatically select a random jury for a case
  async assignJury(caseId: string, jurySize: number = 5) {
    try {
      const caseResult = await db.select().from(governanceCases).where(eq(governanceCases.id, caseId));
      if (!caseResult.length) throw new NotFoundException('Case not found');
      
      const targetCase = caseResult[0];

      // Select random eligible users (Trust Level >= 2), excluding reporter and target (if user)
      const excludeIds = [targetCase.reporterId];
      if (targetCase.targetType === 'user') {
        excludeIds.push(targetCase.targetId);
      } else if (targetCase.targetType === 'message') {
        // Exclude the author of the reported message if possible
        const msg = await db.select().from(messages).where(eq(messages.id, targetCase.targetId));
        if (msg.length) excludeIds.push(msg[0].userId);
      } else if (targetCase.targetType === 'resource') {
        // Exclude uploader of the reported resource
        const res = await db.select().from(resources).where(eq(resources.id, targetCase.targetId));
        if (res.length) excludeIds.push(res[0].uploaderId);
      }

      const eligibleJurors = await db.select()
        .from(users)
        .where(
          and(
            sql`${users.trustLevel} >= 2`,
            sql`NOT (${users.id} = ANY(${excludeIds}))`
          )
        )
        .orderBy(sql`RANDOM()`)
        .limit(jurySize);

      if (eligibleJurors.length < jurySize) {
        console.warn(`Not enough eligible jurors for case ${caseId}. Found ${eligibleJurors.length}, need ${jurySize}`);
      }

      // Assign them to the case
      const juryInserts = eligibleJurors.map(juror => ({
        caseId,
        userId: juror.id,
      }));

      if (juryInserts.length > 0) {
        await db.insert(juryMembers).values(juryInserts);
      }

      // Update case status to voting
      await db.update(governanceCases)
        .set({ status: 'voting', updatedAt: new Date() })
        .where(eq(governanceCases.id, caseId));

      return { assigned: juryInserts.length };
    } catch (error) {
      console.error('Failed to assign jury:', error);
      throw new InternalServerErrorException('Jury assignment failed');
    }
  }

  // 3. VOTING: Jurors cast their votes with weighted impact
  async castVote(uid: string, caseId: string, decision: 'action' | 'no_action' | 'abstain', justification?: string) {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      const user = userResult[0];

      // Find jury membership
      const juryResult = await db.select().from(juryMembers)
        .where(
          and(
            eq(juryMembers.caseId, caseId),
            eq(juryMembers.userId, user.id)
          )
        );

      if (!juryResult.length) throw new ForbiddenException('You are not assigned to this jury');
      const juryMember = juryResult[0];

      if (juryMember.hasVoted) {
        throw new BadRequestException('You have already cast your vote for this case');
      }

      // Calculate weight based on trust level
      let weight = '1.0';
      if (user.trustLevel === 3) weight = '1.5';
      if (user.trustLevel >= 4) weight = '2.0';

      // Record vote
      await db.insert(votes).values({
        juryMemberId: juryMember.id,
        decision,
        weight,
        justification,
      });

      // Mark as voted
      await db.update(juryMembers)
        .set({ hasVoted: true })
        .where(eq(juryMembers.id, juryMember.id));

      // Increment votes cast count
      const existingRep = await db.select().from(userReputations).where(eq(userReputations.userId, user.id));
      if (!existingRep.length) {
        await db.insert(userReputations).values({ userId: user.id, points: 100, votesCast: 1 });
      } else {
        await db.update(userReputations).set({ votesCast: sql`${userReputations.votesCast} + 1` }).where(eq(userReputations.userId, user.id));
      }

      // Trigger check for case resolution
      this.checkCaseResolution(caseId).catch(err => console.error('Failed to check resolution async:', err));

      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) throw error;
      console.error('Failed to cast vote:', error);
      throw new InternalServerErrorException('Failed to cast vote');
    }
  }

  // 4. DECISION ENGINE: Automated tallying and case resolution
  async checkCaseResolution(caseId: string) {
    try {
      const caseResult = await db.select().from(governanceCases).where(eq(governanceCases.id, caseId));
      if (!caseResult.length) return;
      const targetCase = caseResult[0];

      if (targetCase.status !== 'voting') return;

      // Get all jury members for this case
      const totalJury = await db.select().from(juryMembers).where(eq(juryMembers.caseId, caseId));
      const votedJury = totalJury.filter(j => j.hasVoted);

      // Resolve early if everyone voted, or if a supermajority is achieved.
      // For this implementation, we resolve when all assigned jury members have voted
      if (votedJury.length > 0 && votedJury.length === totalJury.length) {
        // Tally votes
        let actionWeightSum = 0;
        let noActionWeightSum = 0;

        for (const member of totalJury) {
          const voteResult = await db.select().from(votes).where(eq(votes.juryMemberId, member.id));
          if (voteResult.length) {
            const vote = voteResult[0];
            const weight = parseFloat(vote.weight.toString());
            if (vote.decision === 'action') {
              actionWeightSum += weight;
            } else if (vote.decision === 'no_action') {
              noActionWeightSum += weight;
            }
          }
        }

        const finalDecision = actionWeightSum > noActionWeightSum ? 'action' : 'no_action';

        // Update case status
        await db.update(governanceCases)
          .set({ 
            status: 'resolved', 
            decision: finalDecision,
            updatedAt: new Date() 
          })
          .where(eq(governanceCases.id, caseId));

        console.log(`Case ${caseId} resolved as: ${finalDecision} (Action: ${actionWeightSum}, No Action: ${noActionWeightSum})`);

        // Execute Penalties or Rewards
        if (finalDecision === 'action') {
          await this.executePenalties(targetCase);
        } else {
          // If the case is closed as 'no action', report is unsuccessful, but we reward jurors with completion points
          console.log(`Case ${caseId} closed with No Action. No penalty applied.`);
        }
      }
    } catch (error) {
      console.error('Error during case resolution check:', error);
    }
  }

  // 5. PENALTY ENGINE & REPUTATION UPDATE
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
          expiresAt: targetCase.targetType === 'user' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null, // 7 days suspension
        });

        // 2. Suspend/Warn the user in Users table if it was severe
        if (targetCase.targetType === 'user') {
          await db.update(users)
            .set({ status: 'suspended', updatedAt: new Date() })
            .where(eq(users.id, offenderUserId));
        }

        // 3. Deduct Reputation Points (-50 reputation points) when report is accepted
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

  // Helper to adjust reputation points (base reputation is 100)
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

      // Automatically recalculate and adjust Trust Level based on reputation points
      const updatedRep = await db.select().from(userReputations).where(eq(userReputations.userId, userId));
      if (updatedRep.length) {
        const points = updatedRep[0].points;
        let trustLevel = 1; // Initiate
        if (points >= 100) trustLevel = 2; // Member
        if (points >= 300) trustLevel = 3; // Trusted
        if (points >= 600) trustLevel = 4; // Elder

        await db.update(users)
          .set({ trustLevel, updatedAt: new Date() })
          .where(eq(users.id, userId));
      }
    } catch (error) {
      console.error(`Failed to update reputation for user ${userId}:`, error);
    }
  }

  // 6. APPEALS FLOW: Penalized user can submit an appeal
  async submitAppeal(uid: string, caseId: string, appealReason: string) {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      const user = userResult[0];

      // Get case
      const caseResult = await db.select().from(governanceCases).where(eq(governanceCases.id, caseId));
      if (!caseResult.length) throw new NotFoundException('Case not found');
      const targetCase = caseResult[0];

      if (targetCase.status !== 'resolved' || targetCase.decision !== 'action') {
        throw new BadRequestException('Only resolved cases with active enforcement actions can be appealed.');
      }

      // Verify the user appealing is indeed the owner/offender
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

      // Update case status to appealed
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

  // Resolve an appeal (Elder or trusted juror can review and resolve)
  async resolveAppeal(uid: string, caseId: string, appealDecision: 'upheld' | 'reversed') {
    try {
      const reviewerResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!reviewerResult.length) throw new NotFoundException('User not found');
      const reviewer = reviewerResult[0];

      // Only Elder (trustLevel 4) can resolve appeals
      if (reviewer.trustLevel < 4) {
        throw new ForbiddenException('Only community Elders (Trust Level 4) are authorized to resolve appeals.');
      }

      // Get case
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

      // If reversed, undo the penalties
      if (appealDecision === 'reversed') {
        let offenderUserId: string | null = null;

        if (targetCase.targetType === 'user') {
          offenderUserId = targetCase.targetId;
          // Reactivate the user
          await db.update(users).set({ status: 'active' }).where(eq(users.id, offenderUserId));
        } else if (targetCase.targetType === 'message') {
          const msg = await db.select().from(messages).where(eq(messages.id, targetCase.targetId));
          if (msg.length) {
            offenderUserId = msg[0].userId;
            // Restore content
            await db.update(messages).set({ deletedAt: null }).where(eq(messages.id, targetCase.targetId));
          }
        } else if (targetCase.targetType === 'resource') {
          const res = await db.select().from(resources).where(eq(resources.id, targetCase.targetId));
          if (res.length) {
            offenderUserId = res[0].uploaderId;
            // Restore resource and clean scan status
            await db.update(resources).set({ deletedAt: null, scanStatus: 'clean' }).where(eq(resources.id, targetCase.targetId));
          }
        }

        if (offenderUserId) {
          // Remove active penalties
          await db.delete(penalties).where(eq(penalties.caseId, targetCase.id));

          // Restore offender's reputation (+50 back)
          await this.updateUserReputation(offenderUserId, 50);
        }

        // Decrement reporter's successful reports count
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

  // 7. PUBLIC MODERATION LOG: Fetch all resolved cases
  async getResolvedCases() {
    try {
      return await db.select({
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
    } catch (error) {
      console.error('Failed to fetch public moderation log:', error);
      throw new InternalServerErrorException('Failed to fetch moderation logs');
    }
  }

  // Get case by ID, including its votes, jurors, and target content
  async getCaseDetails(caseId: string) {
    try {
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

      // Fetch jury members and votes
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

      return {
        ...targetCase,
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

  // Fetch active jury duties for a specific user
  async getJuryDutiesForUser(uid: string) {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      const user = userResult[0];

      return await db.select({
        id: governanceCases.id,
        targetType: governanceCases.targetType,
        targetId: governanceCases.targetId,
        reason: governanceCases.reason,
        status: governanceCases.status,
        createdAt: governanceCases.createdAt,
        hasVoted: juryMembers.hasVoted,
      })
      .from(juryMembers)
      .innerJoin(governanceCases, eq(juryMembers.caseId, governanceCases.id))
      .where(
        and(
          eq(juryMembers.userId, user.id),
          eq(governanceCases.status, 'voting')
        )
      )
      .orderBy(desc(governanceCases.createdAt));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Failed to fetch user jury duties:', error);
      throw new InternalServerErrorException('Failed to fetch jury duties');
    }
  }

  // Get user's cases (either submitted or penalised)
  async getMyCases(uid: string) {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      const user = userResult[0];

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
}
