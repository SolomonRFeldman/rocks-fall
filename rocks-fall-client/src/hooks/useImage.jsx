import { useEffect, useState } from 'react'

export default function useImage(defaultSource) {
  const [source, setSource] = useState(defaultSource)
  const [image, setImage] = useState(new Image())

  useEffect(() => {
    const loadingImage = new Image()
    loadingImage.src = source
    loadingImage.onload = () => setImage(loadingImage)
  }, [source])

  return(
    [image, setSource]
  )
}