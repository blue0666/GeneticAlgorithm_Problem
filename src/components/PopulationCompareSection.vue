<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { GAParams, ObjectiveFn, OptimizeMode, PopulationCompareRow } from '@/algorithms/types'
import { runGA } from '@/algorithms/ga'
import { DEFAULT_POP_SIZES, formatNumber } from '@/utils/helpers'
import * as echarts from 'echarts'

const props = defineProps<{
  objective: ObjectiveFn
  mode: OptimizeMode
  baseParams: GAParams
  disabled?: boolean
}>()

const popSizes = ref<number[]>([...DEFAULT_POP_SIZES])
const running = ref(false)
const rows = ref<PopulationCompareRow[]>([])

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

function disposeChart() {
  chart?.dispose()
  chart = null
}

function ensureChart(): echarts.ECharts | null {
  if (!chartRef.value || rows.value.length === 0) return null
  if (chart) {
    const attachedDom = chart.getDom()
    if (!attachedDom || attachedDom !== chartRef.value) {
      disposeChart()
    }
  }
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  return chart
}

async function runCompare() {
  running.value = true
  disposeChart()
  rows.value = []

  for (const size of popSizes.value) {
    const result = await runGA(props.objective, props.mode, {
      ...props.baseParams,
      popSize: size,
    })
    rows.value.push({
      popSize: size,
      bestValue: result.bestValue,
      bestX: result.bestX,
      bestY: result.bestY,
      elapsedMs: result.elapsedMs,
    })
  }

  running.value = false
  await nextTick()
  renderChart()
}

function renderChart() {
  const instance = ensureChart()
  if (!instance) return
  instance.setOption(
    {
      tooltip: { trigger: 'axis' },
      legend: { data: ['最佳 F(x,y)', '运行时间 (ms)'], top: 0 },
      grid: { left: 52, right: 52, top: 40, bottom: 36 },
      xAxis: {
        type: 'category',
        name: '种群规模',
        data: rows.value.map((r) => String(r.popSize)),
      },
      yAxis: [
        { type: 'value', name: 'F(x,y)', scale: true },
        { type: 'value', name: 'ms', scale: true },
      ],
      series: [
        {
          name: '最佳 F(x,y)',
          type: 'bar',
          data: rows.value.map((r) => r.bestValue),
          itemStyle: { color: '#2563eb', borderRadius: [4, 4, 0, 0] },
        },
        {
          name: '运行时间 (ms)',
          type: 'line',
          yAxisIndex: 1,
          data: rows.value.map((r) => Number(r.elapsedMs.toFixed(1))),
          lineStyle: { color: '#0d9488', width: 2 },
          itemStyle: { color: '#0d9488' },
        },
      ],
    },
    true,
  )
  nextTick(() => {
    instance.resize()
    bindResizeObserver()
  })
}

watch(rows, () => nextTick(renderChart), { deep: true })

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    if (chart?.getDom() === chartRef.value) chart.resize()
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  disposeChart()
})

function bindResizeObserver() {
  if (!resizeObserver || !chartRef.value) return
  resizeObserver.disconnect()
  resizeObserver.observe(chartRef.value)
}
</script>

<template>
  <div class="pop-compare">
    <div class="toolbar-row">
      <el-form inline class="pop-form">
        <el-form-item label="种群规模">
          <el-select
            v-model="popSizes"
            multiple
            collapse-tags
            collapse-tags-tooltip
            style="width: 100%; min-width: 220px; max-width: 320px"
            :disabled="running || disabled"
          >
            <el-option v-for="n in DEFAULT_POP_SIZES" :key="n" :label="String(n)" :value="n" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="primary" plain :loading="running" :disabled="disabled" @click="runCompare">
        运行种群规模对比
      </el-button>
    </div>

    <p class="pop-hint">
      固定当前页面其他 GA 参数，仅改变种群规模依次运行；结果用于分析种群规模对性能的影响。
    </p>

    <el-table :data="rows" border stripe empty-text="点击上方按钮开始种群规模对比实验">
      <el-table-column prop="popSize" label="种群规模" width="120" align="center" />
      <el-table-column label="最佳 F(x,y)" min-width="160">
        <template #default="{ row }">{{ formatNumber(row.bestValue) }}</template>
      </el-table-column>
      <el-table-column label="最优 (x, y)" min-width="200">
        <template #default="{ row }">
          ({{ formatNumber(row.bestX) }}, {{ formatNumber(row.bestY) }})
        </template>
      </el-table-column>
      <el-table-column label="运行时间" width="130" align="center">
        <template #default="{ row }">{{ row.elapsedMs.toFixed(1) }} ms</template>
      </el-table-column>
    </el-table>

    <div v-if="rows.length" ref="chartRef" class="chart-box" />
  </div>
</template>

<style scoped>
.pop-compare {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pop-form {
  margin: 0;
}

.pop-hint {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
}

.chart-box {
  width: 100%;
  height: 320px;
  margin-top: 8px;
}
</style>
