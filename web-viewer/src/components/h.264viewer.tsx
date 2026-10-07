import { useRef } from 'react';
import { useH264Decoder } from '../hooks/h.264.decoder';

export const H264Viewer = ()  => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useH264Decoder(canvasRef);

  return (
    
    <div>
      <h1>Viewer</h1>

      <canvas
        ref={canvasRef}
        style={{
          width: '640px',
          height: '360px',
          background: 'black',
        }}
      />
    </div>);
}

export default H264Viewer;