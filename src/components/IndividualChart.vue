<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = withDefaults(
  defineProps<{
    xHistory: number[]
    yHistory: number[]
    emptyText?: string
  }>(),
  { emptyText: '暂无数据' },
)

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

function render() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)

  if (props.xHistory.length === 0) {
    chart.clear()
    chart.setOption({
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: props.emptyText,
          fill: '#94a3b8',
          fontSize: 14,
        },
      },
    })
    nextTick(() => chart?.resize())
    return
  }

  const generations = props.xHistory.map((_, i) => i)
  chart.setOption(
    {
      graphic: [],
      tooltip: { trigger: 'axis' },
      legend: { data: ['x', 'y'], top: 4, textStyle: { color: '#64748b' } },
      grid: { left: 52, right: 20, top: 40, bottom: 36 },
      xAxis: {
        type: 'category',
        name: '步数',
        nameTextStyle: { color: '#64748b' },
        data: generations,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
      },
      yAxis: {
        type: 'value',
        name: '坐标',
        nameTextStyle: { color: '#64748b' },
        scale: true,
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      series: [
        {
          name: 'x',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: props.xHistory,
          lineStyle: { width: 2, color: '#2563eb' },
        },
        {
          name: 'y',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: props.yHistory,
          lineStyle: { width: 2, color: '#0d9488' },
        },
      ],
    },
    true,
  )
  nextTick(() => chart?.resize())
}

watch(() => [props.xHistory, props.yHistory], render, { deep: true })

onMounted(() => {
  render()
  resizeObserver = new ResizeObserver(() => chart?.resize())
  if (chartRef.value) resizeObserver.observe(chartRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="chartRef" class="chart-box" />
</template>

<style scoped>
.chart-box {
  width: 100%;
  min-width: 0;
  height: 300px;
}
</style>
