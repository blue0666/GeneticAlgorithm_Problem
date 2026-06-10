import type {
  GAParams,
  GenerationSnapshot,
  ObjectiveFn,
  OptimizeMode,
  ProgressCallback,
  RunResult,
} from './types'

type Population = number[][]

function decodeDNA(
  pop: Population,
  dnaSize: number,
  xBound: [number, number],
  yBound: [number, number],
): { x: number[]; y: number[] } {
  // 与参考代码一致：偶数列(0,2,4…)为 y，奇数列(1,3,5…)为 x
  const xPop = pop.map((row) => row.filter((_, i) => i % 2 === 1))
  const yPop = pop.map((row) => row.filter((_, i) => i % 2 === 0))
  const weights = Array.from({ length: dnaSize }, (_, i) => 2 ** (dnaSize - 1 - i))
  const maxVal = 2 ** dnaSize - 1

  const decodeAxis = (
    genes: number[][],
    bound: [number, number],
  ): number[] =>
    genes.map((gene) => {
      const raw = gene.reduce((sum, bit, i) => sum + bit * weights[i], 0)
      return (raw / maxVal) * (bound[1] - bound[0]) + bound[0]
    })

  return {
    x: decodeAxis(xPop, xBound),
    y: decodeAxis(yPop, yBound),
  }
}

function getFitness(
  pop: Population,
  objective: ObjectiveFn,
  mode: OptimizeMode,
  params: GAParams,
): number[] {
  const { x, y } = decodeDNA(pop, params.dnaSize, params.xBound, params.yBound)
  const values = x.map((xv, i) => objective(xv, y[i]))

  if (mode === 'max') {
    const minVal = Math.min(...values)
    return values.map((v) => v - minVal + 0.0001)
  }
  const maxVal = Math.max(...values)
  return values.map((v) => -(v - maxVal) + 0.0001)
}

function select(pop: Population, fitness: number[]): Population {
  const total = fitness.reduce((a, b) => a + b, 0)
  const probs = fitness.map((f) => f / total)
  const result: Population = []
  for (let i = 0; i < pop.length; i++) {
    const r = Math.random()
    let acc = 0
    let picked = 0
    for (let j = 0; j < pop.length; j++) {
      acc += probs[j]
      if (r <= acc) {
        picked = j
        break
      }
    }
    result.push([...pop[picked]])
  }
  return result
}

function mutate(individual: number[], mutaRate: number, geneLength: number): void {
  if (Math.random() < mutaRate) {
    const point = Math.floor(Math.random() * geneLength)
    individual[point] = individual[point] === 0 ? 1 : 0
  }
}

function crossMutate(
  pop: Population,
  crossRate: number,
  mutaRate: number,
  geneLength: number,
): Population {
  const newPop: Population = []
  for (const parent of pop) {
    const child = [...parent]
    if (Math.random() < crossRate) {
      const mate = pop[Math.floor(Math.random() * pop.length)]
      const c1 = Math.floor(Math.random() * (geneLength - 1))
      const c2 = c1 + Math.floor(Math.random() * (geneLength - c1))
      for (let i = c1; i < c2; i++) {
        child[i] = mate[i]
      }
    }
    mutate(child, mutaRate, geneLength)
    newPop.push(child)
  }
  return newPop
}

function initPopulation(popSize: number, geneLength: number): Population {
  return Array.from({ length: popSize }, () =>
    Array.from({ length: geneLength }, () => (Math.random() < 0.5 ? 0 : 1)),
  )
}

function buildSnapshot(
  pop: Population,
  fitness: number[],
  objective: ObjectiveFn,
  mode: OptimizeMode,
  params: GAParams,
  generation: number,
): GenerationSnapshot {
  const { x, y } = decodeDNA(pop, params.dnaSize, params.xBound, params.yBound)
  const values = x.map((xv, i) => objective(xv, y[i]))
  let bestIdx = 0
  if (mode === 'max') {
    bestIdx = values.indexOf(Math.max(...values))
  } else {
    bestIdx = values.indexOf(Math.min(...values))
  }
  return {
    generation,
    bestFitness: fitness[bestIdx],
    bestX: x[bestIdx],
    bestY: y[bestIdx],
    bestValue: values[bestIdx],
    populationX: x,
    populationY: y,
    populationZ: values,
  }
}

export async function runGA(
  objective: ObjectiveFn,
  mode: OptimizeMode,
  params: GAParams,
  onProgress?: ProgressCallback,
  signal?: AbortSignal,
): Promise<RunResult> {
  const geneLength = params.dnaSize * 2
  let pop = initPopulation(params.popSize, geneLength)
  const bestFitnessHistory: number[] = []
  const bestXHistory: number[] = []
  const bestYHistory: number[] = []

  const start = performance.now()
  let globalBestValue = mode === 'max' ? -Infinity : Infinity
  let globalBestX = 0
  let globalBestY = 0

  for (let gen = 0; gen <= params.iterations; gen++) {
    if (signal?.aborted) break

    const fitness = getFitness(pop, objective, mode, params)
    const snapshot = buildSnapshot(pop, fitness, objective, mode, params, gen)

    if (mode === 'max' ? snapshot.bestValue > globalBestValue : snapshot.bestValue < globalBestValue) {
      globalBestValue = snapshot.bestValue
      globalBestX = snapshot.bestX
      globalBestY = snapshot.bestY
    }

    bestFitnessHistory.push(globalBestValue)
    bestXHistory.push(globalBestX)
    bestYHistory.push(globalBestY)

    if (onProgress) {
      await onProgress(
        {
          ...snapshot,
          bestX: globalBestX,
          bestY: globalBestY,
          bestValue: globalBestValue,
        },
        signal ?? new AbortController().signal,
      )
    }

    if (gen === params.iterations) break

    pop = crossMutate(pop, params.crossRate, params.mutaRate, geneLength)
    const newFitness = getFitness(pop, objective, mode, params)
    pop = select(pop, newFitness)
  }

  return {
    bestFitnessHistory,
    bestXHistory,
    bestYHistory,
    bestX: globalBestX,
    bestY: globalBestY,
    bestValue: globalBestValue,
    elapsedMs: performance.now() - start,
  }
}

export function defaultGAParamsMax(): GAParams {
  return {
    dnaSize: 24,
    popSize: 100,
    crossRate: 0.8,
    mutaRate: 0.15,
    iterations: 50,
    xBound: [0, 10],
    yBound: [0, 10],
  }
}

export function defaultGAParamsMin(): GAParams {
  return {
    dnaSize: 24,
    popSize: 200,
    crossRate: 0.5,
    mutaRate: 0.015,
    iterations: 200,
    xBound: [1, 2],
    yBound: [1, 2],
  }
}
