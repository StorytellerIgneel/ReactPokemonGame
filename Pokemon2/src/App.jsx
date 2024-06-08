import { React, useState } from 'react'
import  CanvasComponent  from "./Components/CanvasComponent.jsx"
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div id = "game">
      <CanvasComponent/>
    </div>
  )
}

export default App
