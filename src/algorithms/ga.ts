import type {
  GAParams,
  GenerationSnapshot,
  ObjectiveFn,
  OptimizeMode,
  ProgressCallback,
  RunResult,
} from './types'

/** 种群：每个个体是一条 0/1 染色体（长度为 2 × dnaSize） */
type Population = number[][]

/**
 * 二进制解码：将种群染色体映射为 (x, y) 实数向量。
 * 染色体按位交错存储——偶数索引为 y，奇数索引为 x；
 * 每轴 dnaSize 位，按权重 2^(n-1)…2^0 转为整数后线性缩放到对应边界。
 */
function decodeDNA(
  pop: Population,
  dnaSize: number,
  xBound: [number, number],
  yBound: [number, number],
): { x: number[]; y: number[] } {
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

/**
 * 计算适应度。先求真实目标值 F(x,y)，再平移使全体为正，供轮盘赌使用：
 * 求 max 时减去当代最小值；求 min 时减去当代最大值并取负。
 */
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

/** 轮盘赌选择：按适应度比例抽样，允许重复选中同一父代。 */
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

/** 以 mutaRate 概率随机翻转染色体上的一个比特（覆盖 x、y 全部编码位）。 */
function mutate(individual: number[], mutaRate: number, geneLength: number): void {
  if (Math.random() < mutaRate) {
    const point = Math.floor(Math.random() * geneLength)
    individual[point] = individual[point] === 0 ? 1 : 0
  }
}

/**
 * 对每个父代生成子代：以 crossRate 概率与随机配偶做两点交叉，
 * 再执行变异。交叉区间 [c1, c2) 为随机选取的一段基因片段。
 */
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

/** 随机初始化 popSize 个个体，每位基因等概率取 0 或 1。 */
function initPopulation(popSize: number, geneLength: number): Population {
  return Array.from({ length: popSize }, () =>
    Array.from({ length: geneLength }, () => (Math.random() < 0.5 ? 0 : 1)),
  )
}

/**
 * 提取当前代信息：在真实 F(x,y) 上取 max/min 得到当代最优个体，
 * 并返回整代种群坐标供三维散点图展示。
 */
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

/**
 * 遗传算法主流程。
 * 每代顺序：评估 → 记录快照 → 更新历史全局最优 → 回调界面 → 交叉变异 → 选择。
 * 返回的收敛曲线基于 globalBest，避免最优解在后续代中丢失。
 */
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

/** 题目一默认 GA 参数：区间 [0,10]×[0,10]，求最大值。 */
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

/** 题目二默认 GA 参数：区间 [1,2]×[1,2]，求 Rastrigin 最小值。 */
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
