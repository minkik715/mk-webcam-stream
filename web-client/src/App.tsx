import './App.css'
import { useWebcam } from './hooks/useWebcam'

function App() {
  const { videoRef, canvasRef, captureFrame } = useWebcam();
  return (
    <>
      <h1>Webcam Stream</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={640}
      />

      <canvas
        ref={canvasRef}
      />

      <button onClick={captureFrame}>Capture</button>
    </>
  )
}

export default App
