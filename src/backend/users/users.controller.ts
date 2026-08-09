import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  @UseGuards(FirebaseAuthGuard)
  async syncUser(
    @CurrentUser() user: any,
    @Body() body: { displayName?: string; avatarUrl?: string }
  ) {
    const email = user.email || '';
    const displayName = body.displayName || user.name || 'Anonymous Student';
    const avatarUrl = body.avatarUrl || user.picture;

    return this.usersService.getOrCreateUser(user.uid, email, displayName, avatarUrl);
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async getMyProfile(@CurrentUser() user: any) {
    return this.usersService.getUserProfile(user.uid);
  }
}
