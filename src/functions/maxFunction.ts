import type { Bounds, ObjectiveFn } from './types'

/** 题目一目标函数，在 [0,10]×[0,10] 上求最大值。 */
export function maxObjective(x: number, y: number): number {
  const num =
    6.452 * (x + 0.125 * y) * Math.pow(Math.cos(x) - Math.cos(2 * y), 2)
  const den = 0.8 + Math.pow(x - 4.2, 2) + 2 * Math.pow(y - 7, 2)
  return num / den + 3.226 * y
}

export const MAX_PROBLEM_BOUNDS: { x: Bounds; y: Bounds } = {
  x: [0, 10],
  y: [0, 10],
}

export const MAX_FORMULA =
  'F(x,y) = 6.452(x+0.125y)(cos x - cos 2y)² / (0.8+(x-4.2)²+2(y-7)²) + 3.226y'

/** 页面 KaTeX 公式字符串 */
export const MAX_FORMULA_LATEX =
  String.raw`F(x,y)=\frac{6.452(x+0.125y)\bigl(\cos x-\cos 2y\bigr)^{2}}{0.8+(x-4.2)^{2}+2(y-7)^{2}}+3.226y`

export function sampleMaxSurface(
  xBound: Bounds,
  yBound: Bounds,
  gridSize = 40,
): { x: number[]; y: number[]; z: number[][] } {
  const xs = linspace(xBound[0], xBound[1], gridSize)
  const ys = linspace(yBound[0], yBound[1], gridSize)
  const z: number[][] = []
  for (const xv of xs) {
    const row: number[] = []
    for (const yv of ys) {
      row.push(maxObjective(xv, yv))
    }
    z.push(row)
  }
  return { x: xs, y: ys, z }
}

function linspace(start: number, end: number, count: number): number[] {
  if (count <= 1) return [start]
  const step = (end - start) / (count - 1)
  return Array.from({ length: count }, (_, i) => start + i * step)
}

export function evaluateGrid(
  objective: ObjectiveFn,
  xBound: Bounds,
  yBound: Bounds,
  gridSize = 40,
): { x: number[]; y: number[]; z: number[][] } {
  const xs = linspace(xBound[0], xBound[1], gridSize)
  const ys = linspace(yBound[0], yBound[1], gridSize)
  const z: number[][] = []
  for (const xv of xs) {
    const row: number[] = []
    for (const yv of ys) {
      row.push(objective(xv, yv))
    }
    z.push(row)
  }
  return { x: xs, y: ys, z }
}
