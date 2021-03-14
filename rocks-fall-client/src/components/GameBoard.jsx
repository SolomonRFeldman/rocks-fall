import React, { useEffect, useState } from 'react'
import useCanvas from '../hooks/useCanvas'

export default function GameBoard() {
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)
  const [canvasRef] = useCanvas()

  useEffect(() => {
    console.log('rerendering window size')
    const handleResize = () => {
      console.log('resizing')
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      console.log('cleaned up')
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return(
    <canvas
      className="App-canvas"
      ref={canvasRef}
      width={width}
      height={height}
      style={{border: "1px solid #000000"}}
    />
  )
}