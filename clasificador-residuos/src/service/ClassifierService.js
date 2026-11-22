import errorBus from './errorBus.js'

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
const RETRY_STATUS = new Set([429, 500, 502, 503, 504])
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function health() {
  const r = await fetch(`${BASE}/api/health`)
  if (!r.ok) throw new Error('API no disponible')
  return r.json()
}

/** Clasifica un File/Blob con reintentos (límite de peticiones de Custom Vision = 429). */
export async function classify(file, { retries = 6 } = {}) {
  let lastMsg = 'Error desconocido'
  for (let attempt = 0; attempt <= retries; attempt++) {
    let r
    try {
      r = await fetch(`${BASE}/api/classify`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file })
    } catch {
      lastMsg = 'Sin conexión con la API'
      await sleep(800 * 2 ** attempt)
      continue
    }
    const data = await r.json().catch(() => ({}))
    if (r.ok) return data.probs
    lastMsg = `${data.error || 'Error'} (${r.status})`
    if (!RETRY_STATUS.has(r.status) || attempt === retries) break
    await sleep(Math.min(800 * 2 ** attempt, 8000) + Math.random() * 300)
  }
  throw new Error(lastMsg)
}

/** Varios archivos con concurrencia limitada. onProgress(done,total). Un solo aviso de error por lote. */
export async function classifyMany(files, { concurrency = 2, onProgress } = {}) {
  const results = new Array(files.length)
  let next = 0, done = 0, firstError = null
  const worker = async () => {
    while (next < files.length) {
      const i = next++
      try { results[i] = { probs: await classify(files[i]) } }
      catch (e) { results[i] = { error: e.message }; firstError ??= e.message }
      onProgress?.(++done, files.length)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker))
  if (firstError) errorBus.emit(`${results.filter((r) => r.error).length} imagen(es) fallaron: ${firstError}`)
  return results
}
