import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('api/communities/:communityId/channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getChannels(@Param('communityId') communityId: string) {
    return this.channelsService.getChannelsForCommunity(communityId);
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async createChannel(
    @CurrentUser() user: any,
    @Param('communityId') communityId: string,
    @Body() body: { name: string; type: 'text' | 'voice' | 'announcement' }
  ) {
    return this.channelsService.createChannel(user.uid, communityId, body.name, body.type);
  }
}
