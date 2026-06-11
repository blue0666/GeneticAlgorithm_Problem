import type {
  Bounds,
  GenerationSnapshot,
  ObjectiveFn,
  OptimizeMode,
  ProgressCallback,
  RunResult,
} from './types'

/** 每轴均匀划分的网格点数；总评估次数为 GRID_SEARCH_SIZE²。 */
export const GRID_SEARCH_SIZE = 200

/**
 * 均匀网格穷举：在 x、y 边界内按 gridSize×gridSize 取点，
 * 逐点计算 F(x,y) 并维护历史最优。外层每完成一行触发一次进度回调。
 */
export async function runGridSearch(
  objective: ObjectiveFn,
  mode: OptimizeMode,
  xBound: Bounds,
  yBound: Bounds,
  gridSize: number = GRID_SEARCH_SIZE,
  onProgress?: ProgressCallback,
  signal?: AbortSignal,
): Promise<RunResult> {
  const [xMin, xMax] = xBound
  const [yMin, yMax] = yBound
  const xStep = gridSize > 1 ? (xMax - xMin) / (gridSize - 1) : 0
  const yStep = gridSize > 1 ? (yMax - yMin) / (gridSize - 1) : 0

  let bestValue = mode === 'max' ? -Infinity : Infinity
  let bestX = xMin
  let bestY = yMin
  const bestFitnessHistory: number[] = []
  const bestXHistory: number[] = []
  const bestYHistory: number[] = []

  const start = performance.now()

  for (let i = 0; i < gridSize; i++) {
    if (signal?.aborted) break

    const rowX: number[] = []
    const rowY: number[] = []
    const rowZ: number[] = []
    const x = gridSize > 1 ? xMin + i * xStep : xMin

    for (let j = 0; j < gridSize; j++) {
      const y = gridSize > 1 ? yMin + j * yStep : yMin
      const value = objective(x, y)
      rowX.push(x)
      rowY.push(y)
      rowZ.push(value)

      if (mode === 'max' ? value > bestValue : value < bestValue) {
        bestValue = value
        bestX = x
        bestY = y
      }
    }

    bestFitnessHistory.push(bestValue)
    bestXHistory.push(bestX)
    bestYHistory.push(bestY)

    if (onProgress) {
      const snapshot: GenerationSnapshot = {
        generation: i + 1,
        bestFitness: bestValue,
        bestX,
        bestY,
        bestValue,
        populationX: rowX,
        populationY: rowY,
        populationZ: rowZ,
      }
      await onProgress(snapshot, signal ?? new AbortController().signal)
    }
  }

  return {
    bestFitnessHistory,
    bestXHistory,
    bestYHistory,
    bestX,
    bestY,
    bestValue,
    elapsedMs: performance.now() - start,
  }
}

export function gridSearchEvaluationCount(
  gridSize: number = GRID_SEARCH_SIZE,
): number {
  return gridSize * gridSize
}
