import React, { useEffect, useRef, useState } from 'react'
import useImage from '../hooks/useImage'

export default function GameBoard() {
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)

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

  const canvasRef = useRef(null)
  const [map] = useImage('../test_map.png')
  const [token] = useImage('../test_token.png')

  useEffect(() => {
    const canvasObj = canvasRef.current
    const ctx = canvasObj.getContext('2d')

    ctx.fillStyle = 'gray'
    ctx.fillRect(0,0, window.innerWidth, window.innerHeight)

    ctx.drawImage(map, 0, 0, map.width, map.height)
    ctx.drawImage(token, 100, 100, 50, 50)
  })

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