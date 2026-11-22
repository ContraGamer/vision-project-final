// Proxy hacia Azure Custom Vision. Mantiene la Prediction-Key fuera del navegador.
import 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'

// Carga mínima de .env (sin dependencias extra)
const envFile = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) process.env[m[1]] = m[2]
  }
}

const { PORT = 8787, CV_ENDPOINT, CV_PROJECT_ID, CV_PUBLISHED_NAME, CV_KEY } = process.env
const app = express()
app.use(cors())

const configured = () => Boolean(CV_ENDPOINT && CV_PROJECT_ID && CV_PUBLISHED_NAME && CV_KEY)

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, configured: configured(), model: CV_PUBLISHED_NAME || null }))

app.post('/api/classify', express.raw({ type: '*/*', limit: '8mb' }), async (req, res) => {
  if (!configured()) return res.status(503).json({ error: 'Servidor sin configurar: falta CV_KEY u otras variables en .env' })
  if (!req.body?.length) return res.status(400).json({ error: 'Imagen vacía' })
  const url = `${CV_ENDPOINT.replace(/\/+$/, '')}/customvision/v3.0/Prediction/${CV_PROJECT_ID}/classify/iterations/${CV_PUBLISHED_NAME}/image`
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Prediction-Key': CV_KEY, 'Content-Type': 'application/octet-stream' },
      body: req.body,
    })
    const text = await r.text()
    if (!r.ok) return res.status(r.status).json({ error: `Custom Vision respondió ${r.status}`, detail: text.slice(0, 300) })
    const data = JSON.parse(text)
    const probs = Object.fromEntries((data.predictions || []).map((p) => [p.tagName, p.probability]))
    res.json({ probs })
  } catch (e) {
    res.status(502).json({ error: 'No se pudo contactar Custom Vision', detail: String(e.message || e) })
  }
})

// Producción: sirve el front compilado
const dist = path.resolve(process.cwd(), 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT} · configurada: ${configured()}`))
