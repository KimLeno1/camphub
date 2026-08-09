import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { db } from '../../db';
import { messages, users, channels, communityMembers } from '../../db/schema';
import { eq, desc, and } from 'drizzle-orm';

@Injectable()
export class MessagesService {
  async getMessagesForChannel(channelId: string, limit: number = 50, offset: number = 0) {
    try {
      return await db.select()
        .from(messages)
        .where(eq(messages.channelId, channelId))
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw new InternalServerErrorException('Failed to fetch messages');
    }
  }

  async createMessage(uid: string, channelId: string, content: string, parentMessageId?: string) {
    try {
      // 1. Get User ID
      const userResult = await db.select().from(users).where(eq(users.uid, uid));
      if (!userResult.length) throw new NotFoundException('User not found');
      
      const user = userResult[0];

      // 2. Verify channel and membership
      const channelResult = await db.select().from(channels).where(eq(channels.id, channelId));
      if (!channelResult.length) throw new NotFoundException('Channel not found');
      
      const channel = channelResult[0];

      const memberResult = await db.select().from(communityMembers)
        .where(
          and(
            eq(communityMembers.userId, user.id),
            eq(communityMembers.communityId, channel.communityId)
          )
        );

      if (!memberResult.length) {
        throw new ForbiddenException('Not a member of this community');
      }

      // 3. Create message
      const newMessage = await db.insert(messages).values({
        userId: user.id,
        channelId,
        content,
        parentMessageId,
      }).returning();

      return newMessage[0];
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      console.error('Failed to create message:', error);
      throw new InternalServerErrorException('Failed to send message');
    }
  }
}
