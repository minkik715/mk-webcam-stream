import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { buffer } from 'stream/consumers';
import type { RawData, WebSocket } from 'ws';

@WebSocketGateway()
export class MediaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleConnection(client: WebSocket) {
    console.log('websocket connected');
    client.on('message', (data: RawData, isBinary: boolean) => {
      console.log('message received');
      console.log('isBinary', isBinary);
      if (!isBinary) return;

      let buffer: Buffer;

      if (!Buffer.isBuffer(data)) return;
      buffer = data;
      console.log("H.264 chunk size:", buffer.length);
    });
  }

  handleDisconnect(client: WebSocket, reason?: string) {
    console.log(`Websocket disconnected : ${reason}`);
  }
}
