import React, { useEffect, useRef, useState } from 'react'
import useImage from '../hooks/useImage'

export default function GameBoard() {
  const canvasRef = useRef(null)
  const [ctx, setCtx] = useState(null)
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)
  const [zoomIncrement, setZoomIncrement] = useState(0)
  const [scale, setScale] = useState(1)

  const [map] = useImage('../test_map.png')
  const [token] = useImage('../test_token.png')

  useEffect(() => { setCtx(canvasRef.current.getContext('2d'))}, [canvasRef])

  useEffect(() => {
    const handleResize = () => {
      console.log('resizeing canvas')
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const draw = () => {
    console.log('drawing')
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    const currentScale = ctx.getTransform().a

    ctx.fillStyle = 'gray'
    ctx.fillRect(0,0, (1 / currentScale) * width, (1 / currentScale) * height)

    ctx.drawImage(map, 0, 0, map.width, map.height)
    ctx.drawImage(token, 0, 0, 50, 50)
    
  }

  useEffect(() => { if(ctx) {
    draw()
  }})
  
  const handleWheel = event => {
    const newZoomIncrement = zoomIncrement - (event.deltaY / 100)
    setZoomIncrement(newZoomIncrement)
    setScale(Math.pow(1.1892071150027210667174999705605, newZoomIncrement))
  }

  const handleMouseEnter = () => canvasRef.current.addEventListener('wheel', event => event.preventDefault(), { passive: false })
  const handleMouseLeave = () => canvasRef.current.removeEventListener('wheel', event => event.preventDefault(), { passive: false })

  return(
    <canvas
      className="App-canvas"
      ref={canvasRef}
      width={width * .8}
      height={height}
      style={{border: "1px solid #000000"}}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    />
  )
}