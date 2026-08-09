import { Controller, Get, Patch, UseGuards, Body, Param } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('api/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async getMyProfile(@CurrentUser() user: any) {
    return this.profilesService.getProfile(user.uid);
  }

  @Patch('me')
  @UseGuards(FirebaseAuthGuard)
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() body: { displayName?: string; avatarUrl?: string; major?: string }
  ) {
    return this.profilesService.updateProfile(user.uid, body);
  }

  @Get(':uid')
  @UseGuards(FirebaseAuthGuard)
  async getUserProfile(@Param('uid') uid: string) {
    return this.profilesService.getProfile(uid);
  }
}
