import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('api/channels/:channelId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getMessages(
    @Param('channelId') channelId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.messagesService.getMessagesForChannel(channelId, limit, offset);
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async createMessage(
    @CurrentUser() user: any,
    @Param('channelId') channelId: string,
    @Body() body: { content: string; parentMessageId?: string }
  ) {
    return this.messagesService.createMessage(user.uid, channelId, body.content, body.parentMessageId);
  }
}
