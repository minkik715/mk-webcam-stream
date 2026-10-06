import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { RawData, WebSocket } from 'ws';

@WebSocketGateway()
export class MediaGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
            console.log("=== H.264 INIT ===");
            console.log("codec:", init.codec);
            console.log("width:", init.codedWidth);
            console.log("height:", init.codedHeight);
      
            const description = Buffer.from(init.description, "base64");
      
            console.log("description size:", description.length);
            console.log("description:", description);
          }
        } catch (error) {
          console.error("Failed to parse JSON:", error);
        }
      
        return;
      }
  
      // MEDIA
      if (!Buffer.isBuffer(data)) return;
  
      const buffer = data;
  
      //console.log("H.264 chunk size:", buffer.length);
    });
  }

  handleDisconnect(client: WebSocket, reason?: string) {
    console.log(`Websocket disconnected : ${reason}`);
  }
}
