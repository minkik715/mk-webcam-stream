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

  // 가장 최근 INIT
  private initMessage: string | null = null;

  // 가장 최근 KEY FRAME
  private latestKeyFrame: Buffer | null = null;

  handleConnection(client: WebSocket) {
    console.log('WebSocket connected');

    client.on(
      'message',
      (data: RawData, isBinary: boolean) => {
        // =========================
        // TEXT
        // =========================
        if (!isBinary) {
          const message = data.toString();

          console.log('text message:', message);

          try {
            const json = JSON.parse(message);

            // -------------------------
            // INIT
            // -------------------------
            if (json.type === 'init') {
              this.initMessage = message;

              console.log('INIT received');

              return;
            }

            // -------------------------
            // SUBSCRIBE
            // -------------------------
            if (json.type === 'subscribe') {
              console.log('Viewer subscribed');

              this.viewers.add(client);

              // 현재 INIT 전송
              if (this.initMessage) {
                client.send(this.initMessage);
              }

              // 현재 KEY FRAME 전송
              if (this.latestKeyFrame) {
                client.send(this.latestKeyFrame);
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

        // =========================
        // BINARY MEDIA
        // =========================

        if (!Buffer.isBuffer(data)) {
          return;
        }

        const packet = data;

        // Header
        // 0      : type
        // 1 ~ 8  : timestamp
        // 9 ~ 12 : duration
        // 13 ~   : H.264

        const type = packet.readUInt8(0);

        // KEY FRAME 저장
        if (type === 1) {
          this.latestKeyFrame = packet;

          console.log(
            'Latest key frame updated:',
            packet.length,
          );
        }

        // Viewer들에게 전달
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