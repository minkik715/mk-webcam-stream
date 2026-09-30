import { useEffect, type RefObject } from "react";
import { websocket } from "../utils/websocket";

export const useH264Encoder = (
  videoRef: RefObject<HTMLVideoElement | null>,
) => {


  useEffect(() => {
    if (!videoRef.current) return;
    console.log("videoEncoder supported:", "VideoEncoder" in window);

    const video = videoRef.current;
    const encoder = new VideoEncoder({
      output: (chunk, metadata) => {
        console.log("encoded chunk", chunk);
        console.log("metadata", metadata);

        if (websocket.readyState !== WebSocket.OPEN){
            return;
        }

        const data = new ArrayBuffer(chunk.byteLength);

        chunk.copyTo(data);

        websocket.send(data);

      },
      error: (error) => {
        console.error("encoder error:", error);
      },
    });

    encoder.configure({
      codec: "avc1.42E01F",
      width: 1280,
      height: 720,
      bitrate: 2_000_000,
      framerate: 30,
    });

    const startEncoding = () => {
        const encodeFrame = () => {
            const frame = new VideoFrame(video);
            encoder.encode(frame);
            frame.close();

            video.requestVideoFrameCallback(encodeFrame);
        }

        video.requestVideoFrameCallback(encodeFrame);
    }

    video.addEventListener("loadedmetadata", startEncoding);

    return () => {
      encoder.close();
    };
  }, [videoRef]);
};
