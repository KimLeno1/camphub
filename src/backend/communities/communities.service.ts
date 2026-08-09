import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { db } from '../../db';
import { communities, communityMembers, users } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class CommunitiesService {
  async createCommunity(uid: string, name: string, description: string, visibility: 'public' | 'private' | 'invite_only') {
    try {
      // 1. Get User ID
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      
      const user = userResult[0];
      
      // Enforce Trust Level constraint for creating communities (e.g. L3 Trusted)
      // For now, allowing all or check if trustLevel >= 3 based on PRD
      if (user.trustLevel < 3) {
        // According to docs, L3 (Trusted) is required to create communities
        // We'll throw an error if they don't have it, but for demo, we might want to bypass or allow them to grow.
        // Let's enforce it.
        throw new ForbiddenException('Trust Level 3 (Trusted) is required to create communities.');
      }

      // 2. Insert Community
      const newCommunity = await db.insert(communities).values({
        name,
        description,
        visibility,
      }).returning();

      // 3. Add user as member (initiator)
      await db.insert(communityMembers).values({
        userId: user.id,
        communityId: newCommunity[0].id,
        role: 'elder', // The creator can start as an elder to help seed governance
      });

      return newCommunity[0];
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      console.error('Failed to create community:', error);
      throw new InternalServerErrorException('Failed to create community', { cause: error });
    }
  }

  async getAllCommunities() {
    try {
      // Return public communities
      return await db.select().from(communities).where(eq(communities.visibility, 'public'));
    } catch (error) {
      console.error('Failed to get communities:', error);
      throw new InternalServerErrorException('Failed to fetch communities', { cause: error });
    }
  }

  async getCommunityById(id: string) {
    try {
      const result = await db.select().from(communities).where(eq(communities.id, id));
      if (!result.length) throw new NotFoundException('Community not found');
      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Failed to get community:', error);
      throw new InternalServerErrorException('Failed to fetch community', { cause: error });
    }
  }

  async joinCommunity(uid: string, communityId: string) {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      
      const user = userResult[0];

      await db.insert(communityMembers).values({
        userId: user.id,
        communityId: communityId,
        role: 'member',
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to join community:', error);
      throw new InternalServerErrorException('Failed to join community', { cause: error });
    }
  }
}
