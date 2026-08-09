import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { db } from '../../db';
import { resources, users, communityMembers, communities } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class ResourcesService {
  async getResourcesForCommunity(communityId: string) {
    try {
      return await db.select()
        .from(resources)
        .where(eq(resources.communityId, communityId))
        .orderBy(desc(resources.createdAt));
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      throw new InternalServerErrorException('Failed to fetch resources');
    }
  }

  async uploadResource(uid: string, communityId: string, title: string, fileUrl: string, fileSizeBytes: number, mimeType: string) {
    try {
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      const user = userResult[0];

      // Check membership
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

      // Check trust level limits (L2+ required for upload, limits depend on level)
      if (user.trustLevel < 2) {
        throw new ForbiddenException('Trust Level 2 (Member) is required to upload resources');
      }
      
      const maxSizeBytesL2 = 50 * 1024 * 1024; // 50MB
      const maxSizeBytesL3 = 250 * 1024 * 1024; // 250MB
      
      if (user.trustLevel === 2 && fileSizeBytes > maxSizeBytesL2) {
        throw new BadRequestException('File size exceeds the 50MB limit for Trust Level 2');
      }
      if (user.trustLevel >= 3 && fileSizeBytes > maxSizeBytesL3) {
        throw new BadRequestException('File size exceeds the 250MB limit for Trust Level 3+');
      }

      const newResource = await db.insert(resources).values({
        communityId,
        uploaderId: user.id,
        title,
        fileUrl,
        fileSizeBytes,
        mimeType,
        scanStatus: 'pending',
      }).returning();

      return newResource[0];
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) throw error;
      console.error('Failed to upload resource:', error);
      throw new InternalServerErrorException('Failed to register resource upload');
    }
  }
}
