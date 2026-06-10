<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Plotly from 'plotly.js-dist-min'
import type { Bounds, ObjectiveFn } from '@/algorithms/types'
import { evaluateGrid } from '@/functions/maxFunction'

const props = defineProps<{
  objective: ObjectiveFn
  xBound: Bounds
  yBound: Bounds
  scatterX?: number[]
  scatterY?: number[]
  scatterZ?: number[]
}>()

const plotRef = ref<HTMLDivElement | null>(null)

async function render() {
  if (!plotRef.value) return
  const grid = evaluateGrid(props.objective, props.xBound, props.yBound, 35)
  const traces: Plotly.Data[] = [
    {
      type: 'surface',
      x: grid.y,
      y: grid.x,
      z: grid.z,
      colorscale: 'Viridis',
      opacity: 0.85,
      showscale: true,
    },
  ]

  if (props.scatterX?.length) {
    traces.push({
      type: 'scatter3d',
      mode: 'markers',
      x: props.scatterY,
      y: props.scatterX,
      z: props.scatterZ,
      marker: { size: 3, color: '#111' },
    })
  }

  await Plotly.newPlot(
    plotRef.value,
    traces,
    {
      margin: { l: 0, r: 0, t: 0, b: 0 },
      scene: {
        xaxis: { title: 'y' },
        yaxis: { title: 'x' },
        zaxis: { title: 'F(x,y)' },
      },
    },
    { responsive: true, displayModeBar: true },
  )
}

watch(
  () => [props.scatterX, props.scatterY, props.xBound, props.yBound],
  render,
  { deep: true },
)

onMounted(render)

onBeforeUnmount(() => {
  if (plotRef.value) Plotly.purge(plotRef.value)
})
</script>

<template>
  <div ref="plotRef" class="plot-box" />
</template>

<style scoped>
.plot-box {
  width: 100%;
  height: 420px;
}
</style>
