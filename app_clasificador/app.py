import io, zipfile, os
import pandas as pd, streamlit as st
from customvision import classify
import metrics

st.set_page_config(page_title="Clasificador de residuos", page_icon="♻️", layout="wide")
CFG = {k: st.secrets.get(k, os.getenv(k, "")) for k in ["CV_ENDPOINT", "CV_PROJECT_ID", "CV_PUBLISHED_NAME", "CV_KEY"]}
if not all(CFG.values()):
    st.error("Faltan credenciales. Defina CV_ENDPOINT, CV_PROJECT_ID, CV_PUBLISHED_NAME y CV_KEY en los secretos de Streamlit."); st.stop()

def predict(b): return classify(b, CFG["CV_ENDPOINT"], CFG["CV_PROJECT_ID"], CFG["CV_PUBLISHED_NAME"], CFG["CV_KEY"])

st.title("♻️ Clasificador de residuos reciclables")
st.caption("Modelo entrenado en Azure Custom Vision. Clases: cardboard, glass, metal, paper, plastic, trash.")
tab1, tab2 = st.tabs(["Clasificar imágenes", "Evaluar un dataset"])

with tab1:
    files = st.file_uploader("Suba una o varias imágenes", type=["jpg", "jpeg", "png"], accept_multiple_files=True)
    if files and st.button("Clasificar", type="primary"):
        rows = []
        cols = st.columns(min(len(files), 3))
        for i, f in enumerate(files):
            try:
                p = predict(f.getvalue()); top = max(p, key=p.get)
                rows.append({"archivo": f.name, "clase": top, "confianza": round(p[top] * 100, 1)})
                with cols[i % len(cols)]:
                    st.image(f, caption=f"{top} ({p[top]*100:.1f}%)", use_container_width=True)
            except Exception as e:
                st.warning(f"No se pudo clasificar {f.name}: {e}")
        if rows:
            df = pd.DataFrame(rows); st.dataframe(df, use_container_width=True)
            st.download_button("Descargar resultados (CSV)", df.to_csv(index=False), "resultados.csv")

with tab2:
    st.write("Suba un **.zip** con una carpeta por clase (por ejemplo `test/glass/img1.jpg`). Se calculan precisión, recall, F1, matriz de confusión, curvas ROC y AUC.")
    z = st.file_uploader("Dataset de prueba (.zip)", type=["zip"])
    if z and st.button("Evaluar"):
        zf = zipfile.ZipFile(io.BytesIO(z.getvalue()))
        items = [(n, n.split("/")[-2]) for n in zf.namelist() if n.lower().endswith((".jpg", ".jpeg", ".png")) and len(n.split("/")) >= 2]
        if not items: st.error("El zip no tiene imágenes en carpetas por clase."); st.stop()
        y, P, classes, bar = [], [], None, st.progress(0.0)
        for i, (n, label) in enumerate(items):
            try:
                p = predict(zf.read(n))
                if classes is None: classes = sorted(p)
                y.append(label); P.append([p.get(c, 0.0) for c in classes])
            except Exception as e: st.warning(f"{n}: {e}")
            bar.progress((i + 1) / len(items))
        res = metrics.compute(y, P, classes)
        c1, c2, c3 = st.columns(3)
        c1.metric("Exactitud", f"{res['accuracy']*100:.1f}%")
        c2.metric("F1 macro", f"{res['report']['macro avg']['f1-score']:.3f}")
        c3.metric("AUC macro", f"{res['macro_auc']:.3f}")
        rep = pd.DataFrame(res["report"]).T.round(3); st.dataframe(rep, use_container_width=True)
        st.download_button("Descargar métricas (CSV)", rep.to_csv(), "metricas.csv")
        a, b = st.columns(2); a.pyplot(metrics.fig_cm(res, classes)); b.pyplot(metrics.fig_roc(res))
