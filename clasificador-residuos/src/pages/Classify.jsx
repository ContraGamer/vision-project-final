import { useEffect, useRef, useState } from 'react'
import { classifyMany, health } from '../service/ClassifierService.js'
import { ResultCard } from '../components/ResultCard.jsx'

export default function Classify() {
  const [items, setItems] = useState([])
  const [api, setApi] = useState(null)
  const inputRef = useRef()
  useEffect(() => { health().then(setApi).catch(() => setApi({ ok: false })) }, [])

  const onFiles = async (fileList) => {
    const files = [...fileList].filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    const base = items.length
    setItems((p) => [...p, ...files.map((f) => ({ name: f.name, src: URL.createObjectURL(f) }))])
    const res = await classifyMany(files)
    setItems((p) => p.map((it, i) => (i >= base && res[i - base] ? { ...it, ...res[i - base] } : it)))
  }

  return (
    <div className="page">
      <h1>Clasificar imágenes</h1>
      <p className="sub">Sube una o varias fotos de residuos y el modelo indica a qué clase pertenecen.</p>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          {api && <span className={`status ${api.ok && api.configured ? 'ok' : 'bad'}`}>
            {api.ok ? (api.configured ? `Modelo ${api.model} conectado` : 'API sin configurar (falta CV_KEY en .env)') : 'API no disponible'}
          </span>}
        </div>
        <div className="drop" onClick={() => inputRef.current.click()}
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files) }}>
          <i className="bx bx-cloud-upload" style={{ fontSize: 40 }} />
          <p>Arrastra imágenes aquí o haz clic para seleccionarlas</p>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => { onFiles(e.target.files); e.target.value = '' }} />
        </div>
        {items.length > 0 && <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => setItems([])}>Limpiar</button>}
      </div>
      <div className="preview-grid">{items.map((it, i) => <ResultCard key={i} {...it} />)}</div>
    </div>
  )
}
