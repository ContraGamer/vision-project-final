import { useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { classifyMany } from '../service/ClassifierService.js'
import { evaluate } from '../utils/metrics.js'

const COLORS = ['#3574f5', '#1fa67a', '#ee8a31', '#8c60de', '#c93f3f', '#8895ac']
const pct = (x) => `${(x * 100).toFixed(1)}%`

/** La clase es el nombre de la carpeta padre del archivo (test/<clase>/img.jpg) */
const classOf = (f) => { const p = (f.webkitRelativePath || '').split('/'); return p.length >= 2 ? p[p.length - 2] : null }

export default function Evaluate() {
  const [prog, setProg] = useState(null)
  const [res, setRes] = useState(null)
  const [classes, setClasses] = useState([])
  const [items, setItems] = useState([])
  const ref = useRef()

  const run = async (fileList) => {
    const files = [...fileList].filter((f) => f.type.startsWith('image/') && classOf(f))
    if (!files.length) return
    const cls = [...new Set(files.map(classOf))].sort()
    setClasses(cls); setRes(null); setProg({ done: 0, total: files.length })
    const out = await classifyMany(files, { onProgress: (done, total) => setProg({ done, total }) })
    const its = files.map((f, i) => ({ file: f.name, trueClass: classOf(f), probs: out[i].probs, error: out[i].error }))
    setItems(its)
    setRes(evaluate(its, cls))
    setProg(null)
  }

  const rocData = res && (() => {
    const grid = Array.from({ length: 101 }, (_, i) => i / 100)
    return grid.map((x) => {
      const row = { fpr: x }
      classes.forEach((c) => {
        const pts = res.roc[c].points
        let y = 0
        for (let i = 0; i < pts.length; i++) if (pts[i].fpr <= x) y = pts[i].tpr
        row[c] = y
      })
      return row
    })
  })()

  const download = () => {
    const rows = [['clase', 'precision', 'recall', 'f1', 'soporte', 'auc'], ...res.report.rows.map((r) => [r.class, r.precision, r.recall, r.f1, r.support, res.roc[r.class].auc])]
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' }))
    a.download = 'metricas_por_clase.csv'; a.click()
  }

  const downloadJson = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ classes, items }, null, 1)], { type: 'application/json' }))
    a.download = 'resultados_evaluacion.json'; a.click()
  }

  return (
    <div className="page">
      <h1>Evaluar el modelo</h1>
      <p className="sub">Selecciona la carpeta <b>test</b> (con una subcarpeta por clase) para calcular precisión, recall, F1, matriz de confusión y curvas ROC.</p>
      <div className="card">
        <button className="btn" disabled={!!prog} onClick={() => ref.current.click()}>Seleccionar carpeta de prueba</button>
        <input ref={ref} type="file" webkitdirectory="" directory="" multiple style={{ display: 'none' }} onChange={(e) => run(e.target.files)} />
        {prog && <><div className="progress"><i style={{ width: `${(prog.done / prog.total) * 100}%` }} /></div><p className="note">Clasificando {prog.done} / {prog.total}…</p></>}
      </div>

      {res && (
        <>
          <div className="grid kpi" style={{ marginTop: 16 }}>
            {[['Accuracy', pct(res.report.accuracy)], ['Precisión macro', pct(res.report.macro.precision)], ['Recall macro', pct(res.report.macro.recall)], ['F1 macro', pct(res.report.macro.f1)], ['AUC macro', res.macroAuc.toFixed(3)]].map(([k, v]) => (
              <div className="card kpi-card" key={k}><span>{k}</span><strong>{v}</strong></div>
            ))}
          </div>
          {res.failed > 0 && <p className="status bad" style={{ marginBottom: 12 }}>{res.failed} imágenes fallaron y se excluyeron: las métricas NO son válidas, vuelve a ejecutar</p>}
          <div className="grid two">
            <div className="card">
              <h2>Métricas por clase</h2>
              <table className="tbl"><thead><tr><th>Clase</th><th>Prec.</th><th>Recall</th><th>F1</th><th>AUC</th><th>N</th></tr></thead>
                <tbody>{res.report.rows.map((r) => <tr key={r.class}><td>{r.class}</td><td>{pct(r.precision)}</td><td>{pct(r.recall)}</td><td>{pct(r.f1)}</td><td>{res.roc[r.class].auc.toFixed(3)}</td><td>{r.support}</td></tr>)}</tbody></table>
              <button className="btn ghost" style={{ marginTop: 12 }} onClick={download}>Descargar CSV</button>
              <button className="btn ghost" style={{ marginTop: 12, marginLeft: 8 }} onClick={downloadJson}>Descargar resultados (JSON)</button>
            </div>
            <div className="card">
              <h2>Matriz de confusión</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="tbl cm"><thead><tr><th>Real \ Pred.</th>{classes.map((c) => <th key={c} style={{ textTransform: 'capitalize' }}>{c.slice(0, 5)}</th>)}</tr></thead>
                  <tbody>{res.cm.map((row, i) => {
                    const sum = row.reduce((a, b) => a + b, 0) || 1
                    return <tr key={i}><td>{classes[i]}</td>{row.map((v, j) => <td key={j} className="cell" style={{ background: `rgba(12,74,190,${(v / sum) * (i === j ? 0.55 : 0.9)})`, color: v / sum > 0.35 ? '#fff' : '#10264a' }}>{v}</td>)}</tr>
                  })}</tbody></table>
              </div>
            </div>
          </div>
          <div className="card" style={{ marginTop: 16 }}>
            <h2>Curvas ROC (uno contra resto)</h2>
            <div style={{ height: 460, maxWidth: 760, margin: '0 auto' }}>
              <ResponsiveContainer>
                <LineChart data={rocData}>
                  <CartesianGrid stroke="#e3eaf8" />
                  <XAxis dataKey="fpr" type="number" domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} tickFormatter={(v) => v.toFixed(1)} label={{ value: 'Tasa de falsos positivos', position: 'insideBottom', offset: -8 }} height={50} />
                  <YAxis domain={[0, 1]} width={60} label={{ value: 'Tasa de verdaderos positivos', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                  <Tooltip formatter={(v) => Number(v).toFixed(3)} labelFormatter={(v) => `FPR ${Number(v).toFixed(2)}`} />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 12 }} />
                  {classes.map((c, i) => <Line key={c} dataKey={c} name={`${c} (AUC ${res.roc[c].auc.toFixed(3)})`} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />)}
                  <Line dataKey="fpr" name="Azar" stroke="#8895ac" strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
