import {
  RefObject,
  useEffect,
  useRef,
} from 'react';

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
  const decoderRef =
    useRef<VideoDecoder | null>(null);

  useEffect(() => {
    console.log(
      'useH264Decoder effect started',
    );

    // =========================
    // INIT
    // =========================

    const handleInit = (data: string) => {
      console.log('INIT received:', data);

      const init = JSON.parse(data) as H264Init;

      const description = Uint8Array.from(
        atob(init.description),
        (char) => char.charCodeAt(0),
      );

      // 혹시 기존 decoder가 있으면 닫기
      if (
        decoderRef.current &&
        decoderRef.current.state !== 'closed'
      ) {
        decoderRef.current.close();
      }

      const decoder = new VideoDecoder({
        output: (frame) => {
          const canvas =
            canvasRef.current;

          if (!canvas) {
            frame.close();
            return;
          }

          const ctx =
            canvas.getContext('2d');

          if (!ctx) {
            frame.close();
            return;
          }

          // Canvas 크기 설정
          if (
            canvas.width !==
              frame.displayWidth ||
            canvas.height !==
              frame.displayHeight
          ) {
            canvas.width =
              frame.displayWidth;

            canvas.height =
              frame.displayHeight;
          }

          // VideoFrame → Canvas
          ctx.drawImage(
            frame,
            0,
            0,
          );

          // 반드시 close
          frame.close();
        },

        error: (error) => {
          console.error(
            'VideoDecoder error:',
            error,
          );
        },
      });

      decoder.configure({
        codec: init.codec,
        codedWidth: init.codedWidth,
        codedHeight: init.codedHeight,
        description,
      });

      decoderRef.current = decoder;

      console.log(
        'VideoDecoder configured',
      );
    };

    // =========================
    // MEDIA
    // =========================

    const handleMedia = (
      data: ArrayBuffer,
    ) => {
      const decoder =
        decoderRef.current;

      if (
        !decoder ||
        decoder.state !==
          'configured'
      ) {
        console.log(
          'Decoder is not configured',
        );

        return;
      }

      const view = new DataView(data);

const type = view.getUint8(0);

const timestamp = Number(
  view.getBigUint64(1, false),
);

const duration = view.getInt32(9, false);

const h264 = data.slice(13);

const chunk = new EncodedVideoChunk({
  type: type === 1 ? 'key' : 'delta',
  timestamp,
  duration,
  data: h264,
});

decoder.decode(chunk);
    };

    // =========================
    // WEBSOCKET
    // =========================

    const websocket =
      new WebSocket(
        'ws://192.168.219.100:3000',
      );

    websocket.binaryType =
      'arraybuffer';

    // 연결
    websocket.onopen = () => {
      console.log(
        'WebSocket Connected',
      );

      // Viewer 등록
      websocket.send(
        JSON.stringify({
          type: 'subscribe',
        }),
      );

      console.log(
        'Subscribe sent',
      );
    };

    // 메시지
    websocket.onmessage = (
      event,
    ) => {
      // INIT
      if (
        typeof event.data ===
        'string'
      ) {
        handleInit(
          event.data,
        );

        return;
      }

      // MEDIA
      if (
        event.data instanceof
        ArrayBuffer
      ) {
        handleMedia(
          event.data,
        );
      }
    };

    // 종료
    websocket.onclose = (
      event,
    ) => {
      console.log(
        'WebSocket Disconnected',
        event.code,
        event.reason,
      );
    };

    // 에러
    websocket.onerror = (
      error,
    ) => {
      console.error(
        'WebSocket error:',
        error,
      );
    };

    // =========================
    // CLEANUP
    // =========================

    return () => {
      console.log(
        'useH264Decoder cleanup',
      );

      websocket.close();

      if (
        decoderRef.current &&
        decoderRef.current.state !==
          'closed'
      ) {
        decoderRef.current.close();
      }

      decoderRef.current = null;
    };
  }, [canvasRef]);
};