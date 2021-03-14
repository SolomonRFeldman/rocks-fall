import './App.css'
import { w3cwebsocket as W3CWebSocket } from "websocket"
import React, { useEffect, useState } from 'react'


function App() {
  const [client, setClient] = useState(new W3CWebSocket('ws://localhost:3001/cable'))
  const [text, setText] = useState('')

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
      console.log(data.type)
      if (data.type !== 'ping' && data.type !== 'welcome' && data.type !== 'confirm_subscription') {
        console.log(data)
        setText(data.message.text)
      }
    };
    client.onclose = (message) => {
      setClient(new W3CWebSocket('ws://localhost:3001/cable'))
      console.log(message)
    };
  }, [client])


  const handleChange = event => {
    setText(event.target.value)
    client.send(JSON.stringify({ 
      command: 'message',
      identifier: JSON.stringify({ channel: 'BoardChannel' }),
      data: JSON.stringify({ text: event.target.value })
    }))
  }

  useEffect(() => {
    console.log(text)
  }, [text])

  return (
    <div className="App">
      <input onChange={handleChange} value={text}></input>
    </div>
  );
}

export default App
