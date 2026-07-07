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
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { OrderStatus } from '../shared/enums/order-status.enum';

type OrderNotification = {
  status?: OrderStatus;
  session?: {
    sessionToken?: string;
  };
};

@WebSocketGateway({
  namespace: '/orders',
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' },
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Customer subscription — session token is the shared secret (no JWT needed)
  @SubscribeMessage('subscribe-to-session')
  handleSubscribeSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() sessionToken: string,
  ) {
    if (!sessionToken || typeof sessionToken !== 'string') {
      client.disconnect();
      return;
    }
    void client.join(`session:${sessionToken}`);
  }

  // Staff/kitchen subscription — requires valid JWT whose restaurantId matches the requested room
  @SubscribeMessage('subscribe-to-kitchen')
  handleSubscribeKitchen(
    @ConnectedSocket() client: Socket,
    @MessageBody() restaurantId: string,
  ) {
    if (!restaurantId || typeof restaurantId !== 'string') {
      client.disconnect();
      return;
    }

    const token =
      (client.handshake.auth as Record<string, string>)?.token?.replace(
        'Bearer ',
        '',
      ) ?? '';

    try {
      const payload = this.jwtService.verify<{ restaurantId: string }>(token);
      if (payload.restaurantId !== restaurantId) {
        client.disconnect();
        return;
      }
    } catch {
      client.disconnect();
      return;
    }

    void client.join(`kitchen:${restaurantId}`);
  }

  notifyOrderPlaced(restaurantId: string, order: OrderNotification) {
    this.server.to(`kitchen:${restaurantId}`).emit('order:placed', order);
    const sessionToken = order.session?.sessionToken;
    if (sessionToken) {
      this.server.to(`session:${sessionToken}`).emit('order:placed', order);
    }
  }

  notifyOrderStatusChanged(
    restaurantId: string,
    sessionToken: string,
    order: OrderNotification,
  ) {
    this.server
      .to(`kitchen:${restaurantId}`)
      .emit('order:status-changed', order);
    this.server
      .to(`session:${sessionToken}`)
      .emit('order:status-changed', order);

    if (order.status === OrderStatus.READY) {
      this.server.to(`session:${sessionToken}`).emit('order:ready', order);
    }
  }
}
