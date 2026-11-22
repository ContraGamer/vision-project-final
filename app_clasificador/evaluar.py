"""Evalúa la carpeta test/ contra el endpoint y guarda tablas y gráficas para el informe.
Uso: python evaluar.py ruta/a/test   (con las variables CV_* definidas en el entorno)"""
import os, sys, json, csv
import pandas as pd
from customvision import classify
import metrics
root = sys.argv[1]; E = {k: os.environ[k] for k in ["CV_ENDPOINT", "CV_PROJECT_ID", "CV_PUBLISHED_NAME", "CV_KEY"]}
y, P, classes, rows = [], [], None, []
for c in sorted(os.listdir(root)):
    for f in sorted(os.listdir(f"{root}/{c}")):
        p = classify(open(f"{root}/{c}/{f}", "rb").read(), E["CV_ENDPOINT"], E["CV_PROJECT_ID"], E["CV_PUBLISHED_NAME"], E["CV_KEY"])
        if classes is None: classes = sorted(p)
        y.append(c); P.append([p.get(k, 0.0) for k in classes]); rows.append([c, f] + P[-1])
pd.DataFrame(rows, columns=["real", "archivo"] + classes).to_csv("predicciones.csv", index=False)
res = metrics.compute(y, P, classes)
pd.DataFrame(res["report"]).T.round(3).to_csv("metricas_por_clase.csv")
metrics.fig_cm(res, classes).savefig("matriz_confusion.png", dpi=150); metrics.fig_roc(res).savefig("curvas_roc.png", dpi=150)
print(f"Exactitud {res['accuracy']:.3f} | F1 macro {res['report']['macro avg']['f1-score']:.3f} | AUC macro {res['macro_auc']:.3f}")
