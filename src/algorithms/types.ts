export type OptimizeMode = 'max' | 'min'

export type Bounds = [number, number]

export interface GAParams {
  dnaSize: number
  popSize: number
  crossRate: number
  mutaRate: number
  iterations: number
  xBound: Bounds
  yBound: Bounds
}

export interface PSOParams {
  popSize: number
  iterations: number
  w: number
  c1: number
  c2: number
  xBound: Bounds
  yBound: Bounds
}

export interface GenerationSnapshot {
  generation: number
  bestFitness: number
  bestX: number
  bestY: number
  bestValue: number
  populationX: number[]
  populationY: number[]
  populationZ: number[]
}

export interface RunResult {
  bestFitnessHistory: number[]
  bestXHistory: number[]
  bestYHistory: number[]
  bestX: number
  bestY: number
  bestValue: number
  elapsedMs: number
}

export type ObjectiveFn = (x: number, y: number) => number

export type ProgressCallback = (
  snapshot: GenerationSnapshot,
  signal: AbortSignal,
) => void | Promise<void>

export interface ProblemDefinition {
  id: string
  title: string
  mode: OptimizeMode
  objective: ObjectiveFn
  defaultParams: GAParams
  formula: string
  description: string
}

export interface PopulationCompareRow {
  popSize: number
  bestValue: number
  bestX: number
  bestY: number
  elapsedMs: number
}
