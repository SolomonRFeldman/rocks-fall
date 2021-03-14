import React, { useEffect, useRef } from 'react'

export default function useCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvasObj = canvasRef.current
    const ctx = canvasObj.getContext('2d')
    ctx.fillStyle = 'gray'
    ctx.fillRect(0,0, window.innerWidth, window.innerHeight)
  })

  return(
    [canvasRef]
  )
}