import { RefObject, useEffect, useRef } from 'react';

interface H264Init {
  type: 'init';
  codec: string;
  codedWidth: number;
  codedHeight: number;
  description: string;
}

export const useH264Decoder = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
) => {
  const decoderRef = useRef<VideoDecoder | null>(null);

  useEffect(() => {
    const handleInit = (data: string) => {
      const init = JSON.parse(data) as H264Init;

      const description = Uint8Array.from(
        atob(init.description),
        (char) => char.charCodeAt(0),
      );

      const decoder = new VideoDecoder({
        output: (frame) => {
          const canvas = canvasRef.current;

          if (!canvas) {
            frame.close();
            return;
          }

          const ctx = canvas.getContext('2d');

          if (!ctx) {
            frame.close();
            return;
          }

          // Canvas 크기 설정
          if (
            canvas.width !== frame.displayWidth ||
            canvas.height !== frame.displayHeight
          ) {
            canvas.width = frame.displayWidth;
            canvas.height = frame.displayHeight;
          }

          // VideoFrame → Canvas
          ctx.drawImage(frame, 0, 0);

          // 반드시 닫아줘야 함
          frame.close();
        },

        error: (error) => {
          console.error('VideoDecoder error:', error);
        },
      });

      decoder.configure({
        codec: init.codec,
        codedWidth: init.codedWidth,
        codedHeight: init.codedHeight,
        description,
      });

      decoderRef.current = decoder;
    };

    const handleMedia = (data: ArrayBuffer) => {
      const decoder = decoderRef.current;

      if (!decoder || decoder.state !== 'configured') {
        return;
      }

      const view = new DataView(data);

      const type = view.getUint8(0);

      const timestamp = Number(
        view.getBigUint64(1, true),
      );

      const duration = view.getUint32(9, true);

      const h264 = data.slice(13);

      const chunk = new EncodedVideoChunk({
        type: type === 1 ? 'key' : 'delta',
        timestamp,
        duration,
        data: h264,
      });

      decoder.decode(chunk);
    };

    const websocket = new WebSocket(
      'ws://localhost:3000',
    );

    websocket.binaryType = 'arraybuffer';

    websocket.onopen = () => {
      console.log('WebSocket Connected');
    };

    websocket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        handleInit(event.data);
        return;
      }

      if (event.data instanceof ArrayBuffer) {
        handleMedia(event.data);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      websocket.close();

      if (
        decoderRef.current &&
        decoderRef.current.state !== 'closed'
      ) {
        decoderRef.current.close();
      }

      decoderRef.current = null;
    };
  }, [canvasRef]);
};