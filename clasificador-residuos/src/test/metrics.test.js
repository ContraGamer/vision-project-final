import { describe, it, expect } from 'vitest'
import { confusionMatrix, classificationReport, rocCurve, evaluate } from '../utils/metrics.js'

describe('metrics', () => {
  const classes = ['a', 'b']
  it('matriz de confusión y reporte', () => {
    const cm = confusionMatrix(['a', 'a', 'b', 'b'], ['a', 'b', 'b', 'b'], classes)
    expect(cm).toEqual([[1, 1], [0, 2]])
    const r = classificationReport(cm, classes)
    expect(r.accuracy).toBeCloseTo(0.75)
    expect(r.rows[0].precision).toBe(1)
    expect(r.rows[0].recall).toBe(0.5)
    expect(r.rows[1].precision).toBeCloseTo(2 / 3)
  })
  it('AUC perfecto y aleatorio', () => {
    expect(rocCurve([0.9, 0.8, 0.2, 0.1], [1, 1, 0, 0]).auc).toBe(1)
    expect(rocCurve([0.5, 0.5, 0.5, 0.5], [1, 0, 1, 0]).auc).toBeCloseTo(0.5)
  })
  it('AUC con un error', () => {
    expect(rocCurve([0.9, 0.4, 0.6, 0.1], [1, 1, 0, 0]).auc).toBeCloseTo(0.75)
  })
  it('evaluate integra todo', () => {
    const items = [
      { trueClass: 'a', probs: { a: 0.9, b: 0.1 } },
      { trueClass: 'b', probs: { a: 0.2, b: 0.8 } },
    ]
    const e = evaluate(items, classes)
    expect(e.report.accuracy).toBe(1)
    expect(e.macroAuc).toBe(1)
  })
})
