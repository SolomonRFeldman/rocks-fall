import { useEffect, useState } from 'react'

export default function useImage(defaultSource) {
  const [source, setSource] = useState(defaultSource)
  const [image, setImage] = useState(new Image())

  useEffect(() => {
    const stageImg = new Image()
    stageImg.src = source
    stageImg.onload = () => setImage(stageImg)
  }, [source])

  return(
    [image, setSource]
  )
}