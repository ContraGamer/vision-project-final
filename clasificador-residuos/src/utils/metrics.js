export const argmax = (probs) => Object.entries(probs).sort((a, b) => b[1] - a[1])[0][0]

/** y_true: string[]; preds: string[]; classes: string[] */
export function confusionMatrix(yTrue, yPred, classes) {
  const idx = Object.fromEntries(classes.map((c, i) => [c, i]))
  const m = classes.map(() => classes.map(() => 0))
  yTrue.forEach((t, i) => { if (idx[t] !== undefined && idx[yPred[i]] !== undefined) m[idx[t]][idx[yPred[i]]]++ })
  return m
}

export function classificationReport(cm, classes) {
  const total = cm.flat().reduce((a, b) => a + b, 0)
  const rows = classes.map((c, i) => {
    const tp = cm[i][i]
    const support = cm[i].reduce((a, b) => a + b, 0)
    const predicted = cm.reduce((a, r) => a + r[i], 0)
    const precision = predicted ? tp / predicted : 0
    const recall = support ? tp / support : 0
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0
    return { class: c, precision, recall, f1, support }
  })
  const mean = (k) => rows.reduce((a, r) => a + r[k], 0) / rows.length
  const correct = classes.reduce((a, _, i) => a + cm[i][i], 0)
  return {
    rows,
    accuracy: total ? correct / total : 0,
    macro: { precision: mean('precision'), recall: mean('recall'), f1: mean('f1') },
    total,
  }
}

/** ROC uno-contra-resto. scores: number[], labels: 0|1[]. Devuelve {points:[{fpr,tpr}], auc} */
export function rocCurve(scores, labels) {
  const P = labels.filter(Boolean).length
  const N = labels.length - P
  if (!P || !N) return { points: [{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }], auc: NaN }
  const order = scores.map((s, i) => [s, labels[i]]).sort((a, b) => b[0] - a[0])
  const points = [{ fpr: 0, tpr: 0 }]
  let tp = 0, fp = 0
  for (let i = 0; i < order.length; i++) {
    order[i][1] ? tp++ : fp++
    if (i === order.length - 1 || order[i + 1][0] !== order[i][0]) points.push({ fpr: fp / N, tpr: tp / P })
  }
  let auc = 0
  for (let i = 1; i < points.length; i++) auc += ((points[i].fpr - points[i - 1].fpr) * (points[i].tpr + points[i - 1].tpr)) / 2
  return { points, auc }
}

/** items: [{ trueClass, probs }] */
export function evaluate(items, classes) {
  const ok = items.filter((i) => i.probs)
  const yTrue = ok.map((i) => i.trueClass)
  const yPred = ok.map((i) => argmax(i.probs))
  const cm = confusionMatrix(yTrue, yPred, classes)
  const report = classificationReport(cm, classes)
  const roc = Object.fromEntries(classes.map((c) => [c, rocCurve(ok.map((i) => i.probs[c] ?? 0), yTrue.map((t) => (t === c ? 1 : 0)))]))
  const aucs = classes.map((c) => roc[c].auc).filter((a) => !Number.isNaN(a))
  return { cm, report, roc, macroAuc: aucs.length ? aucs.reduce((a, b) => a + b, 0) / aucs.length : NaN, failed: items.length - ok.length }
}
