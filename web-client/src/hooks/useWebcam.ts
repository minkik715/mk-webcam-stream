import { useEffect, useRef } from "react";

export const useWebcam = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    startWebcam();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const canputreAndSend = () => {
      if(stopped) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if(!video || ! canvas) return;

      const context = canvas.getContext("2d");

      if(!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        async (blob) => {
          if(!blob || stopped) return;

          try{
            await fetch('http://localhost:3000/frame', {
              method: 'POST',
              headers: {
                'Content-Type': 'image/jpeg'
              },
              body: blob
            });
          }catch (error) {
            console.error('Failed to send frame:', error);
          }

          if(!stopped){
            timer = setTimeout(canputreAndSend, 50);
          }
        },
        'image/jpeg',
        0.7
      );
    }
    canputreAndSend();

    return () => {
      stopped = true;
      if(timer){
        clearTimeout(timer);
      }
    }
  }, [videoRef]
)

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if(!video || !canvas){
        return;
    }

    const context = canvas.getContext('2d');

    if(!context){
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    )

    canvas.toBlob(
        async (blob) => {
            if(!blob) {
                return;
            }
            console.log(blob);

            await fetch("/frame", {
                method: 'POST',
                headers: {
                    'Content-Type': 'image/jpeg'
                },
                body: blob,
            });

        },
        'image/jpeg',
        0.7
    )
  };

  return {
    videoRef,
    canvasRef,
    captureFrame
};
};
