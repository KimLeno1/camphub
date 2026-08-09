import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { db } from '../../db';
import { users, userReputations } from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ProfilesService {
  async getProfile(uid: string) {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) {
        throw new NotFoundException('User profile not found');
      }

      const repResult = await db.select().from(userReputations).where(eq(userReputations.userId, userResult[0].id));
      const repData = repResult.length ? repResult[0] : { points: 100, votesCast: 0, successfulReports: 0 };
      
      return {
        ...userResult[0],
        reputation: repData,
        reputationScore: repData.points,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Failed to get profile:', error);
      throw new InternalServerErrorException('Failed to fetch profile', { cause: error });
    }
  }

  async updateProfile(uid: string, data: { displayName?: string; avatarUrl?: string; major?: string }) {
    try {
      const result = await db.update(users)
        .set({
          ...(data.displayName && { displayName: data.displayName }),
          ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
          ...(data.major && { major: data.major }),
          updatedAt: new Date(),
        })
        .where(eq(users.uid, uid))
        .returning();

      if (!result.length) {
        throw new NotFoundException('User not found');
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Failed to update profile:', error);
      throw new InternalServerErrorException('Failed to update profile', { cause: error });
    }
  }
}
