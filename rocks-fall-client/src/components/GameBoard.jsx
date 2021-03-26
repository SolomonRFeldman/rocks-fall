import React, { useEffect, useRef, useState } from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket"
import useImage from '../hooks/useImage'
import useToken from '../hooks/useToken'

export default function GameBoard() {
  const [map] = useImage('../test_map.png')
  const [token] = useImage('../test_token.png')

  const canvasRef = useRef(null)
  const [ctx, setCtx] = useState(null)
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)
  const [translationX, setTranslationX] = useState(0)
  const [translationY, setTranslationY] = useState(0)
  const [zoomIncrement, setZoomIncrement] = useState(0)
  const [scale, setScale] = useState(1)
  const [clickedObj, setClickedObj] = useState(null)

  const [mouseDown, setMouseDown] = useState(false)

  
  const [boardObjects, setBoardObjects] = useState([
    {id: 1, img: token, pos: {x: 64, y: 64}, size: {width: 64, height: 64}},
    {id: 2, img: token, pos: {x: 128, y: 128}, size: {width: 64, height: 64}}
  ])
  
  const [client, setClient] = useState(new W3CWebSocket('ws://localhost:3001/cable'))

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
      client.send(JSON.stringify({
        command: 'subscribe',
        identifier: JSON.stringify({ channel: 'BoardChannel' })
      }))
    };
    client.onmessage = (message) => {
      const data = JSON.parse(message.data)
      // console.log(data.type)
      if (data.type !== 'ping' && data.type !== 'welcome' && data.type !== 'confirm_subscription') {
        if(!(clickedObj && clickedObj.id === data.message.boardObject.id)) {
          const newPos = data.message.boardObject.pos
          const objectToUpdate = boardObjects.find(boardObject => boardObject.id === data.message.boardObject.id)
          const updatedObject = {...objectToUpdate, pos: {x: newPos.x, y: newPos.y}}
          setBoardObjects([...boardObjects.filter(boardObject => boardObject.id !== data.message.boardObject.id), updatedObject])
        }
      }
    };
    client.onclose = (message) => {
      setClient(new W3CWebSocket('ws://localhost:3001/cable'))
      console.log(message)
    };
  })



  useEffect(() => { setCtx(canvasRef.current.getContext('2d'))}, [canvasRef])

  useEffect(() => {
    const handleResize = () => {
      console.log('resizeing canvas')
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mouseup', () => handleMouseUp)
    }
  }, [])

  const draw = () => {
    // console.log('drawing')
    ctx.setTransform(scale, 0, 0, scale, translationX, translationY)
    ctx.fillStyle = 'gray'

    ctx.fillRect(-translationX / scale, -translationY / scale, width / scale, height / scale)

    ctx.drawImage(map, 0, 0, map.width, map.height)
    boardObjects.map(obj => ctx.drawImage(obj.img, obj.pos.x, obj.pos.y, obj.size.width, obj.size.height))
    
  }

  useEffect(() => { if(ctx) {
    draw()
  }})
  
  const handleWheel = event => {
    const newZoomIncrement = zoomIncrement - (event.deltaY / 100)
    const newScale = Math.pow(1.1892071150027210667174999705605, newZoomIncrement)
    const scaleChange = newScale - scale
    const canvasPos = canvasRef.current.getBoundingClientRect()
    const [mouseX, mouseY] = [event.pageX - canvasPos.x + 1, event.pageY - canvasPos.y + 1]
    const [canvMouseX, canvMouseY] = [(-translationX / scale) + (mouseX / scale), (-translationY / scale) + (mouseY / scale)]
    setTranslationX(translationX - (canvMouseX * scaleChange))
    setTranslationY(translationY - (canvMouseY * scaleChange))
    setZoomIncrement(newZoomIncrement)
    setScale(newScale)
  }

  const handleMouseEnter = () => canvasRef.current.addEventListener('wheel', event => event.preventDefault(), { passive: false })
  const handleMouseLeave = () => canvasRef.current.removeEventListener('wheel', event => event.preventDefault(), { passive: false })

  const handleMouseDown = event => {
    setMouseDown(true)

    const canvasPos = canvasRef.current.getBoundingClientRect()
    const [mouseX, mouseY] = [event.pageX - canvasPos.x + 1, event.pageY - canvasPos.y + 1]
    const [canvMouseX, canvMouseY] = [(-translationX / scale) + (mouseX / scale), (-translationY / scale) + (mouseY / scale)]

    
    const objectClicked = boardObjects.find(obj => {
      return (
        obj.pos.x <= canvMouseX && (obj.pos.x + obj.size.width) >= canvMouseX &&
        obj.pos.y <= canvMouseY && (obj.pos.y + obj.size.height) >= canvMouseY
      )
    })

    if(objectClicked) {
      setClickedObj(objectClicked)
      setBoardObjects([...boardObjects.filter(boardObject => boardObject.id !== objectClicked.id), objectClicked])
            
      client.send(JSON.stringify({ 
        command: 'message',
        identifier: JSON.stringify({ channel: 'BoardChannel' }),
        data: JSON.stringify({ boardObject: objectClicked })
      }))
    }
    console.log(clickedObj)
  }

  
  const handleMouseUp = event => {
    setMouseDown(false)
    setClickedObj(undefined)
  }
  const handleMouseMove = event => {
    if (mouseDown) {
      if (clickedObj) {
        const oldPos = clickedObj.pos
        const updatedObj = {
          ...clickedObj,
          pos: {x: oldPos.x + (event.movementX * (1/scale)), y: oldPos.y + (event.movementY * (1/scale))}
        }
        setBoardObjects([...boardObjects.filter(boardObject => boardObject.id !== clickedObj.id), updatedObj])
        setClickedObj(updatedObj)
            
        client.send(JSON.stringify({ 
          command: 'message',
          identifier: JSON.stringify({ channel: 'BoardChannel' }),
          data: JSON.stringify({ boardObject: updatedObj })
        }))
      } else {
        setTranslationX(translationX + event.movementX)
        setTranslationY(translationY + event.movementY)
      }
    }
  }

  const handleClick = event => {
    const canvasPos = canvasRef.current.getBoundingClientRect()
    const [mouseX, mouseY] = [event.pageX - canvasPos.x + 1, event.pageY - canvasPos.y + 1]
    const [canvMouseX, canvMouseY] = [(-translationX / scale) + (mouseX / scale), (-translationY / scale) + (mouseY / scale)]
    console.log('---------------')
    console.log(canvMouseX)
    console.log(canvMouseY)
    console.log(translationX)
    console.log(translationY)
    console.log(mouseX)
    console.log(mouseY)
    console.log(scale)
    console.log('---------------')
  }

  return(
    <canvas
      className="App-canvas"
      ref={canvasRef}
      width={width * .8}
      height={height * .8}
      style={{border: "1px solid #000000"}}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onWheel={handleWheel}
    />
  )
}