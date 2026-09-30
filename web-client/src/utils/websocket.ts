export const websocket = new WebSocket("ws://localhost:3000");

websocket.binaryType = "arraybuffer";

websocket.onopen = () => {
  console.log("WebSocket Connected");
};

websocket.onclose = () => {
  console.log("WebSocket Disconnected");
};

websocket.onerror = (error) => {
  console.error("WebSocket error:", error);
};
