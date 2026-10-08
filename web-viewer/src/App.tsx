import { useState } from 'react'
import './App.css'
import H264Viewer from './components/h.264viewer'
import { MinimumPwd } from './components/MinimunPwd'

function App() {

  const [auth, setAuth] = useState(false);

  return (
    <>

      <MinimumPwd setAuth={setAuth}/>
      {auth && <H264Viewer/>}

    </>
  )
}

export default App
