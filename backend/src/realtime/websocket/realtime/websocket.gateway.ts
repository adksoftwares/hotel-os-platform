import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

@WebSocketGateway({ cors: { origin: allowedOrigins } })
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const authorization = client.handshake.headers.authorization;
    const bearerToken = typeof authorization === 'string'
      ? authorization.replace(/^Bearer\s+/i, '')
      : undefined;
    const suppliedToken = client.handshake.auth?.token ?? bearerToken;

    if (typeof suppliedToken !== 'string' || suppliedToken.length === 0) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync(suppliedToken);
      if (!payload?.sub || !payload?.role) {
        client.disconnect(true);
        return;
      }

      const queryPropertyId = client.handshake.query.propertyId;
      const requestedPropertyId = typeof queryPropertyId === 'string' ? queryPropertyId : undefined;
      const propertyId = requestedPropertyId || payload.propertyId;

      if (
        typeof propertyId !== 'string' ||
        propertyId.length === 0 ||
        (payload.role !== 'SUPER_ADMIN' && propertyId !== payload.propertyId)
      ) {
        client.disconnect(true);
        return;
      }

      client.data.user = {
        id: payload.sub,
        role: payload.role,
        propertyId: payload.propertyId
      };
      client.data.propertyId = propertyId;
      await client.join(`property_${propertyId}`);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // Avoid logging tokens, guest details, or other connection credentials.
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    if (!client.data?.user) {
      client.disconnect(true);
      return;
    }
    return { event: 'pong', data: 'Server is alive' };
  }

  // Internal services should only broadcast to a server-validated property room.
  broadcastToProperty(propertyId: string, event: string, payload: any) {
    this.server.to(`property_${propertyId}`).emit(event, payload);
  }
}
