import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    // In a real app we'd authenticate the socket connection here
    // For now we'll accept the connection
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove from presence
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        this.server.emit('presence_update', { userId, status: 'offline' });
        break;
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string }
  ) {
    this.userSockets.set(data.userId, client.id);
    this.server.emit('presence_update', { userId: data.userId, status: 'online' });
    return { event: 'authenticated', data: { success: true } };
  }

  @SubscribeMessage('join_channel')
  handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string }
  ) {
    client.join(data.channelId);
    return { event: 'joined_channel', data };
  }

  @SubscribeMessage('leave_channel')
  handleLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string }
  ) {
    client.leave(data.channelId);
    return { event: 'left_channel', data };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; userId: string; isTyping: boolean }
  ) {
    client.to(data.channelId).emit('user_typing', data);
  }

  // Used by other backend services to emit messages to rooms
  emitMessageToChannel(channelId: string, message: any) {
    this.server.to(channelId).emit('new_message', message);
  }

  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  emitNotification(userId: string, notification: any) {
    this.emitToUser(userId, 'notification', notification);
  }
}
