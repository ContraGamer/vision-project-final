export function ResultCard({ src, name, probs, error }) {
  const sorted = probs ? Object.entries(probs).sort((a, b) => b[1] - a[1]) : []
  return (
    <div className="card result">
      <img src={src} alt={name} />
      {error ? <p className="status bad" style={{ marginTop: 10 }}>{error}</p> : !probs ? <div className="skeleton" style={{ height: 90, marginTop: 10 }} /> : (
        <>
          <div className="top"><span>{sorted[0][0]}</span><span>{(sorted[0][1] * 100).toFixed(1)}%</span></div>
          {sorted.map(([c, p], i) => (
            <div className="bar-row" key={c}><span>{c}</span><div className="bar"><i className={i === 0 ? 'top' : ''} style={{ width: `${p * 100}%` }} /></div><span>{(p * 100).toFixed(1)}%</span></div>
          ))}
        </>
      )}
    </div>
  )
}
