import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  async getOrCreateUser(uid: string, email: string, displayName: string, avatarUrl?: string) {
    try {
      const result = await db.insert(users)
        .values({
          uid,
          email,
          displayName,
          avatarUrl,
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            email,
            displayName,
            avatarUrl,
            updatedAt: new Date(),
          },
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error('Failed to get or create user:', error);
      throw new InternalServerErrorException('Failed to sync user with database');
    }
  }

  async getUserProfile(uid: string) {
    try {
      const result = await db.select().from(users).where(eq(users.uid, uid));
      return result[0];
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw new InternalServerErrorException('Failed to fetch user profile');
    }
  }
}
