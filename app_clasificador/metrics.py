"""Métricas de clasificación multiclase a partir de las probabilidades del endpoint."""
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.metrics import (classification_report, confusion_matrix, roc_curve, auc,
                             accuracy_score, ConfusionMatrixDisplay)
from sklearn.preprocessing import label_binarize

def compute(y_true, probs, classes):
    """y_true: lista de etiquetas reales; probs: matriz (n, k) en el orden de `classes`."""
    probs = np.asarray(probs); idx = {c: i for i, c in enumerate(classes)}
    y = np.array([idx[t] for t in y_true]); y_pred = probs.argmax(1)
    rep = classification_report(y, y_pred, target_names=classes, output_dict=True, zero_division=0)
    cm = confusion_matrix(y, y_pred, labels=range(len(classes)))
    Y = label_binarize(y, classes=range(len(classes)))
    roc = {}
    for i, c in enumerate(classes):
        if Y[:, i].sum() == 0: continue
        fpr, tpr, _ = roc_curve(Y[:, i], probs[:, i]); roc[c] = (fpr, tpr, auc(fpr, tpr))
    macro_auc = float(np.mean([v[2] for v in roc.values()]))
    return {"accuracy": accuracy_score(y, y_pred), "report": rep, "cm": cm, "roc": roc, "macro_auc": macro_auc}

def fig_cm(res, classes):
    fig, ax = plt.subplots(figsize=(5.5, 4.8))
    ConfusionMatrixDisplay(res["cm"], display_labels=classes).plot(ax=ax, cmap="Greens", colorbar=False, xticks_rotation=45)
    fig.tight_layout(); return fig

def fig_roc(res):
    fig, ax = plt.subplots(figsize=(5.5, 4.8))
    for c, (f, t, a) in res["roc"].items(): ax.plot(f, t, label=f"{c} (AUC={a:.3f})")
    ax.plot([0, 1], [0, 1], "k--", lw=.8); ax.set_xlabel("Tasa de falsos positivos"); ax.set_ylabel("Tasa de verdaderos positivos")
    ax.legend(fontsize=8); ax.spines[["top", "right"]].set_visible(False); fig.tight_layout(); return fig
