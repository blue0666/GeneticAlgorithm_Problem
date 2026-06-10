<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = withDefaults(
  defineProps<{
    title: string
    history: number[]
    yLabel?: string
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

  if (props.history.length === 0) {
    chart.clear()
    chart.setOption({
      title: props.title
        ? { text: props.title, left: 'center', textStyle: { fontSize: 14 } }
        : undefined,
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

  chart.setOption(
    {
      graphic: [],
      title: props.title
        ? { text: props.title, left: 'center', textStyle: { fontSize: 14 } }
        : undefined,
      tooltip: { trigger: 'axis' },
      grid: { left: 52, right: 20, top: props.title ? 48 : 24, bottom: 36 },
      xAxis: {
        type: 'category',
        name: '步数',
        nameTextStyle: { color: '#64748b' },
        data: props.history.map((_, i) => i),
        axisLine: { lineStyle: { color: '#cbd5e1' } },
      },
      yAxis: {
        type: 'value',
        name: props.yLabel ?? '值',
        nameTextStyle: { color: '#64748b' },
        scale: true,
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: props.history,
          lineStyle: { width: 2, color: '#2563eb' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(37, 99, 235, 0.18)' },
                { offset: 1, color: 'rgba(37, 99, 235, 0)' },
              ],
            },
          },
        },
      ],
    },
    true,
  )
  nextTick(() => chart?.resize())
}

watch(() => props.history, render, { deep: true })

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
