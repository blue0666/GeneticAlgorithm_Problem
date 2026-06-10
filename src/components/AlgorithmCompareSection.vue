<script setup lang="ts">
import type { RunResult } from '@/algorithms/types'
import { GRID_SEARCH_SIZE } from '@/algorithms/gridSearch'
import { formatNumber } from '@/utils/helpers'
import FitnessChart from '@/components/FitnessChart.vue'

defineProps<{
  gaResult: RunResult | null
  gridResult: RunResult | null
  gaEvalHint: string
  gridRunning?: boolean
  gaRunning?: boolean
}>()
</script>

<template>
  <div class="algo-compare-block">
    <el-table
      v-if="gaResult && gridResult"
      :data="[
        {
          name: '遗传算法 GA',
          value: gaResult.bestValue,
          x: gaResult.bestX,
          y: gaResult.bestY,
          time: gaResult.elapsedMs,
          evals: gaEvalHint,
        },
        {
          name: `网格搜索 ${GRID_SEARCH_SIZE}×${GRID_SEARCH_SIZE}`,
          value: gridResult.bestValue,
          x: gridResult.bestX,
          y: gridResult.bestY,
          time: gridResult.elapsedMs,
          evals: String(GRID_SEARCH_SIZE * GRID_SEARCH_SIZE),
        },
      ]"
      border
      stripe
      class="compare-table"
    >
      <el-table-column prop="name" label="算法" min-width="150" />
      <el-table-column label="F(x,y)" min-width="160">
        <template #default="{ row }">{{ formatNumber(row.value) }}</template>
      </el-table-column>
      <el-table-column label="最优 (x, y)" min-width="200">
        <template #default="{ row }">
          ({{ formatNumber(row.x) }}, {{ formatNumber(row.y) }})
        </template>
      </el-table-column>
      <el-table-column prop="evals" label="函数评估量级" min-width="130" />
      <el-table-column label="运行时间" min-width="110" align="center">
        <template #default="{ row }">{{ row.time.toFixed(1) }} ms</template>
      </el-table-column>
    </el-table>

    <el-empty
      v-else
      :description="
        gaRunning || gridRunning ? '正在计算 GA 与网格搜索…' : '点击「开始求解」后将在此展示两种方法的对比'
      "
      :image-size="72"
    />

    <el-row v-if="gaResult && gridResult" :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12" class="chart-col">
        <div class="mini-chart-wrap">
          <div class="mini-chart-title">GA · Best Fitness 收敛曲线</div>
          <FitnessChart title="" :history="gaResult.bestFitnessHistory" />
        </div>
      </el-col>
      <el-col :xs="24" :lg="12" class="chart-col">
        <div class="mini-chart-wrap">
          <div class="mini-chart-title">
            网格搜索 · 扫描过程（{{ GRID_SEARCH_SIZE }} 步）
          </div>
          <FitnessChart title="" :history="gridResult.bestFitnessHistory" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.compare-table {
  margin-bottom: 4px;
}

.chart-row {
  margin-top: 16px !important;
  width: 100%;
}

.mini-chart-wrap {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 12px;
  background: var(--surface-muted);
}

.mini-chart-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
</style>
