<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GAParams, GenerationSnapshot, ObjectiveFn, OptimizeMode, RunResult } from '@/algorithms/types'
import { runGA } from '@/algorithms/ga'
import { runGridSearch, GRID_SEARCH_SIZE } from '@/algorithms/gridSearch'
import { yieldToUI } from '@/utils/helpers'
import ParamForm from '@/components/ParamForm.vue'
import FitnessChart from '@/components/FitnessChart.vue'
import IndividualChart from '@/components/IndividualChart.vue'
import Surface3D from '@/components/Surface3D.vue'
import ProblemHeader from '@/components/ProblemHeader.vue'
import SectionCard from '@/components/SectionCard.vue'
import MethodResultCard from '@/components/MethodResultCard.vue'
import AlgorithmCompareSection from '@/components/AlgorithmCompareSection.vue'
import PopulationCompareSection from '@/components/PopulationCompareSection.vue'

const props = defineProps<{
  title: string
  formulaLatex: string
  variant?: 'max' | 'min'
  mode: OptimizeMode
  objective: ObjectiveFn
  defaultParams: GAParams
  fitnessLabel: string
}>()

const params = ref<GAParams>({
  ...props.defaultParams,
  xBound: [...props.defaultParams.xBound],
  yBound: [...props.defaultParams.yBound],
})

const running = ref(false)
const gaRunning = ref(false)
const gridRunning = ref(false)

const gaGeneration = ref(0)
const gaBestX = ref<number | null>(null)
const gaBestY = ref<number | null>(null)
const gaBestValue = ref<number | null>(null)
const gaElapsedMs = ref<number | null>(null)
const fitnessHistory = ref<number[]>([])
const xHistory = ref<number[]>([])
const yHistory = ref<number[]>([])
const scatterX = ref<number[]>([])
const scatterY = ref<number[]>([])
const scatterZ = ref<number[]>([])

const gridProgress = ref(0)
const gridBestX = ref<number | null>(null)
const gridBestY = ref<number | null>(null)
const gridBestValue = ref<number | null>(null)
const gridElapsedMs = ref<number | null>(null)

const gaResult = ref<RunResult | null>(null)
const gridResult = ref<RunResult | null>(null)

const gaEvalHint = computed(
  () => `约 ${params.value.popSize * params.value.iterations} 次`,
)

let abortController: AbortController | null = null

function resetRunState() {
  gaGeneration.value = 0
  gaBestX.value = null
  gaBestY.value = null
  gaBestValue.value = null
  gaElapsedMs.value = null
  fitnessHistory.value = []
  xHistory.value = []
  yHistory.value = []
  scatterX.value = []
  scatterY.value = []
  scatterZ.value = []

  gridProgress.value = 0
  gridBestX.value = null
  gridBestY.value = null
  gridBestValue.value = null
  gridElapsedMs.value = null

  gaResult.value = null
  gridResult.value = null
}

async function handleRun() {
  if (running.value) return
  abortController = new AbortController()
  const signal = abortController.signal
  running.value = true
  gaRunning.value = true
  gridRunning.value = false
  resetRunState()

  const gaProgress = async (snapshot: GenerationSnapshot) => {
    gaGeneration.value = snapshot.generation
    scatterX.value = snapshot.populationX
    scatterY.value = snapshot.populationY
    scatterZ.value = snapshot.populationZ
    fitnessHistory.value.push(snapshot.bestValue)
    xHistory.value.push(snapshot.bestX)
    yHistory.value.push(snapshot.bestY)
    gaBestX.value = snapshot.bestX
    gaBestY.value = snapshot.bestY
    gaBestValue.value = snapshot.bestValue
    await yieldToUI()
  }

  try {
    const ga = await runGA(props.objective, props.mode, params.value, gaProgress, signal)
    gaResult.value = ga
    fitnessHistory.value = ga.bestFitnessHistory
    xHistory.value = ga.bestXHistory
    yHistory.value = ga.bestYHistory
    gaBestX.value = ga.bestX
    gaBestY.value = ga.bestY
    gaBestValue.value = ga.bestValue
    gaElapsedMs.value = ga.elapsedMs
    gaGeneration.value = params.value.iterations
    gaRunning.value = false

    scatterX.value = []
    scatterY.value = []
    scatterZ.value = []

    if (signal.aborted) return

    gridRunning.value = true
    const grid = await runGridSearch(
      props.objective,
      props.mode,
      params.value.xBound,
      params.value.yBound,
      GRID_SEARCH_SIZE,
      async (snapshot) => {
        gridProgress.value = snapshot.generation
        gridBestX.value = snapshot.bestX
        gridBestY.value = snapshot.bestY
        gridBestValue.value = snapshot.bestValue
        await yieldToUI()
      },
      signal,
    )
    gridResult.value = grid
    gridBestX.value = grid.bestX
    gridBestY.value = grid.bestY
    gridBestValue.value = grid.bestValue
    gridElapsedMs.value = grid.elapsedMs
    gridProgress.value = GRID_SEARCH_SIZE
  } finally {
    running.value = false
    gaRunning.value = false
    gridRunning.value = false
    abortController = null
  }
}

function handleStop() {
  abortController?.abort()
}

function resetParams() {
  params.value = {
    ...props.defaultParams,
    xBound: [...props.defaultParams.xBound] as [number, number],
    yBound: [...props.defaultParams.yBound] as [number, number],
  }
}
</script>

<template>
  <div class="page-stack solver-view">
    <ProblemHeader :title="title" :formula-latex="formulaLatex" :variant="variant ?? mode" />

    <SectionCard
      title="算法与参数"
      subtitle="GA参数可以手动调整，也可以直接运行求解，随后就会依次运行 GA 与网格搜索，包括动态展示"
    >
      <div class="solver-section">
        <ParamForm v-model="params" :disabled="running" />

        <div class="toolbar-row run-bar">
          <div class="btn-row">
            <el-button type="primary" :loading="running" @click="handleRun">开始求解</el-button>
            <el-button :disabled="!running" @click="handleStop">停止</el-button>
            <el-button :disabled="running" @click="resetParams">恢复默认</el-button>
          </div>
        </div>
      </div>
    </SectionCard>

    <SectionCard title="运行结果" :subtitle="`${fitnessLabel} · GA &网格简单搜索`">
      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <MethodResultCard
            label="遗传算法 GA"
            :best-x="gaBestX"
            :best-y="gaBestY"
            :best-value="gaBestValue"
            :elapsed-ms="gaElapsedMs"
            :progress="gaGeneration"
            progress-label="当前代数"
            :running="gaRunning"
            :pending="running && !gaRunning && gaBestValue == null"
            accent="blue"
          />
        </el-col>
        <el-col :xs="24" :md="12">
          <MethodResultCard
            :label="`网格搜索 ${GRID_SEARCH_SIZE}×${GRID_SEARCH_SIZE}`"
            :best-x="gridBestX"
            :best-y="gridBestY"
            :best-value="gridBestValue"
            :elapsed-ms="gridElapsedMs"
            :progress="gridProgress"
            progress-label="已扫描行数"
            :running="gridRunning"
            :pending="running && !gridRunning && gridBestValue == null"
            accent="teal"
          />
        </el-col>
      </el-row>
    </SectionCard>

    <SectionCard title="三维曲面展示" subtitle="曲面为目标函数；黑点为 GA 当前计算的这一代种群（仅运行时动态更新）">
      <Surface3D
        :objective="objective"
        :x-bound="params.xBound"
        :y-bound="params.yBound"
        :scatter-x="scatterX"
        :scatter-y="scatterY"
        :scatter-z="scatterZ"
      />
    </SectionCard>

    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12" class="chart-col">
        <SectionCard title="GA · Best Fitness" :subtitle="`F(x,y)，${fitnessLabel}`">
          <FitnessChart
            title=""
            :history="fitnessHistory"
            y-label="F(x,y)"
            :empty-text="gaRunning ? 'GA 计算中…' : '点击「开始求解」后显示 GA 曲线'"
          />
        </SectionCard>
      </el-col>
      <el-col :xs="24" :lg="12" class="chart-col">
        <SectionCard title="GA · Best Individual" subtitle="最优解 (x, y) 随代数变化">
          <IndividualChart
            :x-history="xHistory"
            :y-history="yHistory"
            :empty-text="gaRunning ? 'GA 计算中…' : '点击「开始求解」后显示 GA 曲线'"
          />
        </SectionCard>
      </el-col>
    </el-row>

    <SectionCard
      title="算法对比"
      subtitle="GA 与网格搜索在同一参数下的最优解、评估次数与运行时间对比"
    >
      <AlgorithmCompareSection
        :ga-result="gaResult"
        :grid-result="gridResult"
        :ga-eval-hint="gaEvalHint"
        :ga-running="gaRunning"
        :grid-running="gridRunning"
      />
    </SectionCard>

    <SectionCard
      title="种群规模对比"
      subtitle="固定其他 GA 参数，测试不同种群规模对算法性能的影响"
    >
      <PopulationCompareSection
        :objective="objective"
        :mode="mode"
        :base-params="params"
        :disabled="running"
      />
    </SectionCard>
  </div>
</template>

<style scoped>
.solver-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.run-bar {
  padding-top: 4px;
  border-top: 1px solid var(--border-light);
  margin-top: 4px;
  justify-content: flex-end;
}

.chart-row {
  width: 100%;
  margin: 0 !important;
}

.chart-row :deep(.el-col) {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .chart-row :deep(.el-col:first-child) {
    margin-bottom: 16px;
  }
}
</style>
