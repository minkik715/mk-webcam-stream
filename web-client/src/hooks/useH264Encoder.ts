import { useEffect, type RefObject } from "react";
import { websocket } from "../utils/websocket";

const HEADER_SIZE = 13;

export const useH264Encoder = (
  videoRef: RefObject<HTMLVideoElement | null>,
) => {

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    let initSent = false;
    const encoder = new VideoEncoder({
      output: (chunk, metadata) => {

        if (!initSent && metadata?.decoderConfig) {
          const config = metadata.decoderConfig;
          let description = null;
          if(config.description){
            description = arrayBufferToBase64(config.description);
          }
        
          websocket.send(
            JSON.stringify({
              type: "init",
              codec: config.codec,
              codedWidth: config.codedWidth,
              codedHeight: config.codedHeight,
              description,
            }),
          );
          initSent = true;
        }
        
        const packet = new ArrayBuffer(HEADER_SIZE + chunk.byteLength);
        const view = new DataView(packet);

        // type(1) + timestamp(8) + duration(4) + chunk
        view.setUint8(0, chunk.type === 'key' ? 1 : 0);
        view.setBigUint64(1, BigInt(chunk.timestamp));
        view.setUint32(9, chunk.duration ?? 0);

        chunk.copyTo(new Uint8Array(packet, HEADER_SIZE));

        websocket.send(packet);

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

const arrayBufferToBase64 = (buffer: AllowSharedBufferSource) => {
  const bytes = new Uint8Array(buffer as ArrayBuffer);

  let binary = "";

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
};