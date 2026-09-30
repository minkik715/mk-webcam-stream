import { useEffect, useRef } from "react";

export const useMjpeg = (video: HTMLVideoElement) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const canputreAndSend = () => {
      if (stopped) return;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      const context = canvas.getContext("2d");

      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        async (blob) => {
          if (!blob || stopped) return;

          try {
            await fetch("http://localhost:3000/frame", {
              method: "POST",
              headers: {
                "Content-Type": "image/jpeg",
              },
              body: blob,
            });
          } catch (error) {
            console.error("Failed to send frame:", error);
          }

          if (!stopped) {
            timer = setTimeout(canputreAndSend, 100);
          }
        },
        "image/jpeg",
        1.0,
      );
    };
    canputreAndSend();

    return () => {
      stopped = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [video]);

  return {
    canvasRef,
  };
};
