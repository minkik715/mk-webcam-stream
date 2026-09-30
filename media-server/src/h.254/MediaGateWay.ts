import {
    SubscribeMessage,
    WebSocketGateway,
  } from "@nestjs/websockets";
  import type { WebSocket } from "ws"
  
  @WebSocketGateway()
  export class MediaGateway {
    @SubscribeMessage("message")
    handleMessage(client: WebSocket, data: Buffer) {
      console.log("H.264 chunk received");
      console.log("size:", data.length);
    }
  }