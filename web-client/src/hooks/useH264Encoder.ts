import { useEffect } from "react"

export const useH264Encoder = () => {
    useEffect(() => {
        console.log("videoEncoder supported:", "VideoEncoder" in window);
        
        const encoder = new VideoEncoder({
            output: (chunk) => {
                console.log("encoded chunk", chunk);
            },
            error: (error) => {
                console.error("encoder error:", error);
            }
        })

        encoder.configure({
            codec: "avc1.42E01F",
            width: 1280,
            height: 720,
            bitrate: 2_000_000,
            framerate: 30
        })

        return () => {
            encoder.close();
        };
    }, []);
}