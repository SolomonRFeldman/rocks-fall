import { useEffect, useRef } from 'react'
import useImage from './useImage'

export default function useCanvas() {
  const canvasRef = useRef(null)
  const [map] = useImage('../test_map.png')

  useEffect(() => {
    const canvasObj = canvasRef.current
    const ctx = canvasObj.getContext('2d')

    ctx.fillStyle = 'gray'
    ctx.fillRect(0,0, window.innerWidth, window.innerHeight)

    ctx.drawImage(map, 0, 0, map.width, map.height)
  })

  return(
    [canvasRef]
  )
}