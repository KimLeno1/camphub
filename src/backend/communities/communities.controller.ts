import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('api/communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Get()
  async getAllCommunities() {
    return this.communitiesService.getAllCommunities();
  }

  @Get(':id')
  async getCommunity(@Param('id') id: string) {
    return this.communitiesService.getCommunityById(id);
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async createCommunity(
    @CurrentUser() user: any,
    @Body() body: { name: string; description: string; visibility: 'public' | 'private' | 'invite_only' }
  ) {
    return this.communitiesService.createCommunity(user.uid, body.name, body.description, body.visibility);
  }

  @Post(':id/join')
  @UseGuards(FirebaseAuthGuard)
  async joinCommunity(
    @CurrentUser() user: any,
    @Param('id') id: string
  ) {
    return this.communitiesService.joinCommunity(user.uid, id);
  }
}
