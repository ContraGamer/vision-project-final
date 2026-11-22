const classes = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']
export default function About() {
  return (
    <div className="page">
      <h1>Sobre el modelo</h1>
      <p className="sub">Clasificación de residuos reciclables con Azure AI Custom Vision.</p>
      <div className="grid two">
        <div className="card"><h2>Dataset</h2>
          <p className="note">TrashNet (Thung &amp; Yang, Stanford CS229, licencia MIT): 2 524 imágenes únicas tras eliminar duplicados, divididas de forma estratificada 70/15/15 (train/val/test, semilla 42).</p>
          <div className="chips" style={{ marginTop: 12 }}>{classes.map((c) => <span key={c} className="chip">{c}</span>)}</div></div>
        <div className="card"><h2>Entrenamiento y despliegue</h2>
          <p className="note">Custom Vision, clasificación multiclase, dominio General [A2], Quick Training. Publicado como <b>residuos-v1</b> y consumido vía Prediction API desde un proxy que oculta la clave al navegador.</p></div>
        <div className="card"><h2>Cómo se evalúa</h2>
          <p className="note">Con la carpeta de prueba (378 imágenes nunca vistas en el entrenamiento) se calculan precisión, recall y F1 por clase, matriz de confusión y curvas ROC/AUC uno-contra-resto a partir de las probabilidades del endpoint.</p></div>
      </div>
    </div>
  )
}
