import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { db } from '../../db';
import { channels, communityMembers, users } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class ChannelsService {
  async getChannelsForCommunity(communityId: string) {
    try {
      return await db.select().from(channels).where(eq(channels.communityId, communityId));
    } catch (error) {
      console.error('Failed to get channels:', error);
      throw new InternalServerErrorException('Failed to fetch channels');
    }
  }

  async createChannel(uid: string, communityId: string, name: string, type: 'text' | 'voice' | 'announcement') {
    try {
      // 1. Get User ID
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      
      const user = userResult[0];

      // 2. Check if user is a trusted member or elder of this community
      const memberResult = await db.select().from(communityMembers)
        .where(
          and(
            eq(communityMembers.userId, user.id),
            eq(communityMembers.communityId, communityId)
          )
        );

      if (!memberResult.length) {
        throw new ForbiddenException('Not a member of this community');
      }

      const role = memberResult[0].role;
      if (role !== 'trusted' && role !== 'elder') {
        throw new ForbiddenException('Only Trusted members or Elders can create channels');
      }

      // 3. Create channel
      const newChannel = await db.insert(channels).values({
        communityId,
        name,
        type,
      }).returning();

      return newChannel[0];
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      console.error('Failed to create channel:', error);
      throw new InternalServerErrorException('Failed to create channel');
    }
  }
}
