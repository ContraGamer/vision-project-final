import { useEffect, useState } from 'react'
import errorBus from '../service/errorBus.js'

export function ErrorToast() {
  const [items, setItems] = useState([])
  useEffect(() => errorBus.subscribe((message) => {
    const id = Date.now() + Math.random()
    setItems((p) => [...p, { id, message }])
    setTimeout(() => setItems((p) => p.filter((i) => i.id !== id)), 6000)
  }), [])
  return (
    <div className="error-toast-root">
      {items.slice(-3).map((i) => (
        <div key={i.id} className="error-toast-card">
          <button onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))}>✕</button>
          <strong>Error</strong><div>{i.message}</div>
        </div>
      ))}
    </div>
  )
}
