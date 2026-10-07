import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const propertyId = client.handshake.query.propertyId as string;
    if (propertyId) {
      client.join(`property_${propertyId}`);
      console.log(`Client ${client.id} joined property_${propertyId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, data: any) {
    return { event: 'pong', data: 'Server is alive' };
  }

  // Used by other internal services to broadcast
  broadcastToProperty(propertyId: string, event: string, payload: any) {
    this.server.to(`property_${propertyId}`).emit(event, payload);
  }
}
