import { useEffect, useRef, useState } from 'react'
import type { Assets } from '../types'

export function useAssets() {
  const shuttleRef = useRef(new Image())
  const racketYouRef = useRef(new Image())
  const racketAIRef = useRef(new Image())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let done = 0
    const need = 3
    const onAny = () => { done++; if (done >= need) setLoaded(true) }
    // Simple, license-free placeholders (replace with branded art later)
    shuttleRef.current.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Shuttlecock.png/64px-Shuttlecock.png'
    racketYouRef.current.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Badminton_racket.png/128px-Badminton_racket.png'
    racketAIRef.current.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Badminton_racket.png/128px-Badminton_racket.png'

    shuttleRef.current.onload = onAny; shuttleRef.current.onerror = onAny
    racketYouRef.current.onload = onAny; racketYouRef.current.onerror = onAny
    racketAIRef.current.onload = onAny; racketAIRef.current.onerror = onAny
  }, [])

  const assets: Assets = {
    shuttle: shuttleRef.current,
    racketYou: racketYouRef.current,
    racketAI: racketAIRef.current,
    loaded,
  }
  return assets
}

