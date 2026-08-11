import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { GovernanceService } from './governance.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('api/governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  // 1. PUBLIC MODERATION LOG: Fetch all resolved/appealed cases
  @Get('cases/resolved')
  async getResolvedCases() {
    return this.governanceService.getResolvedCases();
  }

  // 2. GET USER'S ASSIGNED JURY DUTIES
  @Get('cases/jury-duty')
  @UseGuards(FirebaseAuthGuard)
  async getJuryDuties(@CurrentUser() user: any) {
    return this.governanceService.getJuryDutiesForUser(user.uid);
  }

  // 3. GET USER'S SUBMITTED OR RECEIVED CASES
  @Get('cases/my-cases')
  @UseGuards(FirebaseAuthGuard)
  async getMyCases(@CurrentUser() user: any) {
    return this.governanceService.getMyCases(user.uid);
  }

  // 4. GET CASE DETAILS (Evidence, target content, and votes)
  @Get('cases/:caseId')
  async getCaseDetails(@Param('caseId') caseId: string) {
    return this.governanceService.getCaseDetails(caseId);
  }

  // 5. REPORT ENGINE: Submit a report with evidence
  @Post('cases')
  @UseGuards(FirebaseAuthGuard)
  async reportContent(
    @CurrentUser() user: any,
    @Body() body: { 
      targetType: 'user' | 'message' | 'resource' | 'community'; 
      targetId: string; 
      reason: string;
      evidenceUrl?: string;
      evidenceDescription?: string;
    }
  ) {
    return this.governanceService.createCase(
      user.uid, 
      body.targetType, 
      body.targetId, 
      body.reason,
      body.evidenceUrl,
      body.evidenceDescription
    );
  }

  // 6. VOTING: Cast a vote as an assigned juror
  @Post('cases/:caseId/vote')
  @UseGuards(FirebaseAuthGuard)
  async castVote(
    @CurrentUser() user: any,
    @Param('caseId') caseId: string,
    @Body() body: { decision: 'action' | 'no_action' | 'abstain'; justification?: string }
  ) {
    return this.governanceService.castVote(user.uid, caseId, body.decision, body.justification);
  }

  // 7. APPEALS ENGINE: Submit an appeal (Offender only)
  @Post('cases/:caseId/appeal')
  @UseGuards(FirebaseAuthGuard)
  async submitAppeal(
    @CurrentUser() user: any,
    @Param('caseId') caseId: string,
    @Body() body: { appealReason: string }
  ) {
    return this.governanceService.submitAppeal(user.uid, caseId, body.appealReason);
  }

  // 8. APPEAL RESOLUTION: Elder resolves an appeal
  @Post('cases/:caseId/appeal/resolve')
  @UseGuards(FirebaseAuthGuard)
  async resolveAppeal(
    @CurrentUser() user: any,
    @Param('caseId') caseId: string,
    @Body() body: { appealDecision: 'upheld' | 'reversed' }
  ) {
    return this.governanceService.resolveAppeal(user.uid, caseId, body.appealDecision);
  }

  // 9. BANNED USERS: Get all banned/suspended users eligible for reinstatement
  @Get('banned-users')
  async getBannedUsers() {
    return this.governanceService.getBannedUsers();
  }

  // 10. REINSTATEMENT PETITION: Create a petition to reinstate a banned user
  @Post('banned-users/:bannedUserId/reinstatement')
  @UseGuards(FirebaseAuthGuard)
  async petitionReinstatement(
    @CurrentUser() user: any,
    @Param('bannedUserId') bannedUserId: string,
    @Body() body: { reason: string }
  ) {
    return this.governanceService.createReinstatementPetition(user.uid, bannedUserId, body.reason);
  }
}
