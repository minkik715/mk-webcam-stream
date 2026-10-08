import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { RawData, WebSocket } from 'ws';

@WebSocketGateway()
export class MediaGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private viewers = new Set<WebSocket>();

  private interruptedClients = new Set<WebSocket>
  // 가장 최근 INIT
  private initMessage: string | null = null;

  handleConnection(client: WebSocket) {
    console.log('WebSocket connected');

    client.on(
      'message',
      (data: RawData, isBinary: boolean) => {
        if (!isBinary) {
          const message = data.toString();

          console.log('text message:', message);

          try {
            const json = JSON.parse(message);

            if (json.type === 'init') {
              this.initMessage = message;

              console.log('INIT received');

              return;
            }

            if (json.type === 'subscribe') {
              console.log('Viewer subscribed');

              this.interruptedClients.add(client);

              // 현재 INIT 전송
              if (this.initMessage) {
                client.send(this.initMessage);
              }

              return;
            }
          } catch (error) {
            console.error(
              'Failed to parse JSON:',
              error,
            );
          }

          return;
        }

        if (!Buffer.isBuffer(data)) {
          return;
        }

        const packet = data;

        const type = packet.readUInt8(0);

        if (type === 1) {
          for (const client of this.interruptedClients) {
            if (client.readyState !== WebSocket.OPEN) {
              continue;
            }

            this.viewers.add(client);
            this.interruptedClients.delete(client);
          }
        }

        for (const viewer of this.viewers) {
          if (viewer.readyState !== WebSocket.OPEN) {
            continue;
          }

          viewer.send(packet);
        }
      },
    );
  }

  handleDisconnect(client: WebSocket) {
    this.viewers.delete(client);

    console.log('WebSocket disconnected');
  }
}