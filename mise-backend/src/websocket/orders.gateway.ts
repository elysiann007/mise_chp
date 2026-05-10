import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrderStatus } from '../shared/enums/order-status.enum';

@WebSocketGateway({
  namespace: '/orders',
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' },
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe-to-session')
  handleSubscribeSession(@ConnectedSocket() client: Socket, @MessageBody() sessionToken: string) {
    client.join(`session:${sessionToken}`);
  }

  @SubscribeMessage('subscribe-to-kitchen')
  handleSubscribeKitchen(@ConnectedSocket() client: Socket, @MessageBody() restaurantId: string) {
    client.join(`kitchen:${restaurantId}`);
  }

  notifyOrderPlaced(restaurantId: string, order: any) {
    this.server.to(`kitchen:${restaurantId}`).emit('order:placed', order);
    this.server.to(`session:${order.session?.sessionToken}`).emit('order:placed', order);
  }

  notifyOrderStatusChanged(restaurantId: string, sessionToken: string, order: any) {
    this.server.to(`kitchen:${restaurantId}`).emit('order:status-changed', order);
    this.server.to(`session:${sessionToken}`).emit('order:status-changed', order);

    if (order.status === OrderStatus.READY) {
      this.server.to(`session:${sessionToken}`).emit('order:ready', order);
    }
  }
}
