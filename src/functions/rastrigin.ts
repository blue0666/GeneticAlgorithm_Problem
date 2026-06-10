import type { Bounds } from '@/algorithms/types'
import { evaluateGrid } from './maxFunction'

/** 题目二：Rastrigin 函数（与 ga_min.py 一致） */
export function rastriginObjective(x: number, y: number): number {
  return (
    20 +
    x * x +
    y * y -
    10 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y))
  )
}

export const RASTRIGIN_BOUNDS: { x: Bounds; y: Bounds } = {
  x: [1, 2],
  y: [1, 2],
}

export const RASTRIGIN_FORMULA =
  'F(x,y) = 20 + x² + y² - 10(cos 2πx + cos 2πy)'

/** Word 公式风格展示（KaTeX LaTeX） */
export const RASTRIGIN_FORMULA_LATEX =
  String.raw`F(x,y)=20+x^{2}+y^{2}-10\bigl(\cos 2\pi x+\cos 2\pi y\bigr)`

export function sampleRastriginSurface(
  xBound: Bounds,
  yBound: Bounds,
  gridSize = 40,
) {
  return evaluateGrid(rastriginObjective, xBound, yBound, gridSize)
}
