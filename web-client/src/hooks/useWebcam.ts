import { useEffect, useRef } from "react";
import { websocket } from "../utils/websocket";

export const useWebcam = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
  
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Failed to access webcam", error);
      }
    };
  
    if (websocket.readyState === WebSocket.OPEN) {
      startWebcam();
    } else {
      websocket.addEventListener("open", startWebcam, { once: true });
    }
  
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);


  return {
    videoRef,
};
};
