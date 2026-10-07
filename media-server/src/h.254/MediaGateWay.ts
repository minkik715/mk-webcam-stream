import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { RawData, WebSocket } from 'ws';

@WebSocketGateway()
export class MediaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private viewers = new Set<WebSocket>();
  handleConnection(client: WebSocket) {
    console.log("websocket connected");
    client.on("message", (data: RawData, isBinary: boolean) => {
      
      // INIT
      if (!isBinary) {
        const message = data.toString();
      
        console.log("text message:", message);
      
        try {
          const init = JSON.parse(message);
      
          if (init.type === "init") {
            const description = Buffer.from(init.description, "base64");
      
          }

          if (init.type === "subscribe"){
              this.viewers.add(client)
          }

        } catch (error) {
          console.error("Failed to parse JSON:", error);
        }
      
        return;
      }
  
      // MEDIA
      if (!Buffer.isBuffer(data)) return;
  
      for (const viewer of this.viewers) {
      if (viewer.readyState !== WebSocket.OPEN) continue;

        viewer.send(data);
      }
  
    });
  }

  handleDisconnect(client: WebSocket, reason?: string) {
    this.viewers.delete(client);
    console.log(`Websocket disconnected : ${reason}`);
  }
}
