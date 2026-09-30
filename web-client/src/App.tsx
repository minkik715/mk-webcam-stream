import './App.css'
import { useWebcam } from './hooks/useWebcam';
import { useH264Encoder } from './hooks/useH264Encoder';

function App() {
  
  const {videoRef} =  useWebcam();
  
  useH264Encoder(videoRef);

  return <>
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      width={640}
    />

  </>
}

export default App
