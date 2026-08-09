import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('api/ai')
@UseGuards(FirebaseAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('duplicate-resource')
  async detectDuplicateResource(
    @Body() body: { title: string; mimeType: string; communityId: string }
  ) {
    return this.aiService.detectDuplicateResource(body.title, body.mimeType, body.communityId);
  }

  @Post('detect-spam')
  async detectSpam(@Body() body: { content: string }) {
    return this.aiService.detectSpam(body.content);
  }

  @Post('detect-toxicity')
  async detectToxicity(@Body() body: { content: string }) {
    return this.aiService.detectToxicity(body.content);
  }

  @Get('recommend-opportunities')
  async recommendOpportunities(@CurrentUser() user: any) {
    return this.aiService.recommendOpportunities(user.uid);
  }

  @Get('recommend-clubs')
  async recommendClubs(@CurrentUser() user: any) {
    return this.aiService.recommendClubs(user.uid);
  }

  @Get('recommend-study-partners')
  async recommendStudyPartners(@CurrentUser() user: any) {
    return this.aiService.recommendStudyPartners(user.uid);
  }

  @Post('summarize')
  async summarize(@Body() body: { content: string; type?: 'bullet' | 'short' | 'detailed' }) {
    return this.aiService.summarize(body.content, body.type);
  }

  @Post('translate')
  async translate(@Body() body: { text: string; targetLanguage: string }) {
    return this.aiService.translate(body.text, body.targetLanguage);
  }

  @Post('ask')
  async askStudyAssistant(@Body() body: { question: string; context?: string }) {
    return this.aiService.askStudyAssistant(body.question, body.context);
  }

  @Get('semantic-search')
  async semanticSearch(@Query('query') query: string) {
    return this.aiService.semanticSearch(query);
  }
}
