import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { db } from '../../db';
import { resources, users, communityMembers, communities, governanceCases } from '../../db/schema';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';

@Injectable()
export class ResourcesService {
  async getResourcesForCommunity(communityId: string) {
    try {
      const isGlobal = !communityId || communityId === 'global' || communityId === 'global-resources';
      const whereCondition = isGlobal
        ? isNull(resources.deletedAt)
        : and(eq(resources.communityId, communityId), isNull(resources.deletedAt));

      const dbResources = await db.select({
        resource: resources,
        uploader: {
          id: users.id,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          trustLevel: users.trustLevel,
          major: users.major
        }
      })
      .from(resources)
      .innerJoin(users, eq(resources.uploaderId, users.id))
      .where(whereCondition)
      .orderBy(desc(resources.createdAt));

      if (dbResources.length === 0) return [];

      const resourceIds = dbResources.map(r => r.resource.id);
      
      const cases = await db.select()
        .from(governanceCases)
        .where(
          and(
            eq(governanceCases.targetType, 'resource'),
            sql`${governanceCases.targetId} = ANY(${resourceIds})`
          )
        );

      const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      return dbResources.map(({ resource, uploader }) => {
        const resCases = cases.filter(c => c.targetId === resource.id);
        const hasActiveOrUpheldReport = resCases.some(c => 
          c.status !== 'resolved' || c.decision === 'action'
        );
        const isOlderThan15Days = (now - new Date(resource.createdAt).getTime()) >= fifteenDaysInMs;
        
        return {
          ...resource,
          uploader: {
            name: uploader.displayName,
            avatar: uploader.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(uploader.displayName)}`,
            role: uploader.trustLevel >= 3 ? 'Elite Contributor' : 'Student'
          },
          verified: isOlderThan15Days && !hasActiveOrUpheldReport,
        };
      });
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      throw new InternalServerErrorException('Failed to fetch resources');
    }
  }

  async getResourceById(id: string) {
    try {
      const result = await db.select({
        resource: resources,
        uploader: {
          id: users.id,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          trustLevel: users.trustLevel,
          major: users.major
        }
      })
      .from(resources)
      .innerJoin(users, eq(resources.uploaderId, users.id))
      .where(and(eq(resources.id, id), isNull(resources.deletedAt)));

      if (!result.length) {
        throw new NotFoundException('This resource was removed completely from the website following a community governance vote.');
      }
      
      const { resource, uploader } = result[0];
      
      // Check for active reports
      const resCases = await db.select()
        .from(governanceCases)
        .where(
          and(
            eq(governanceCases.targetType, 'resource'),
            eq(governanceCases.targetId, resource.id)
          )
        );

      const hasActiveOrUpheldReport = resCases.some(c => 
        c.status !== 'resolved' || c.decision === 'action'
      );
      
      const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
      const isOlderThan15Days = (Date.now() - new Date(resource.createdAt).getTime()) >= fifteenDaysInMs;

      return {
        ...resource,
        uploader: {
          name: uploader.displayName,
          avatar: uploader.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(uploader.displayName)}`,
          role: uploader.trustLevel >= 3 ? 'Elite Contributor' : 'Student'
        },
        verified: isOlderThan15Days && !hasActiveOrUpheldReport,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Failed to fetch resource by ID:', error);
      throw new InternalServerErrorException('Failed to fetch resource details');
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

      return {
        ...newResource[0],
        uploader: {
          name: user.displayName,
          avatar: user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName)}`,
          role: user.trustLevel >= 3 ? 'Elite Contributor' : 'Student'
        },
        verified: false,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) throw error;
      console.error('Failed to upload resource:', error);
      throw new InternalServerErrorException('Failed to register resource upload');
    }
  }
}
