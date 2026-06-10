<script setup lang="ts">
import { formatNumber } from '@/utils/helpers'

defineProps<{
  label: string
  bestX: number | null
  bestY: number | null
  bestValue: number | null
  elapsedMs: number | null
  progress: number
  progressLabel: string
  running: boolean
  pending?: boolean
  accent?: 'blue' | 'teal'
}>()
</script>

<template>
  <div class="method-card" :class="`method-card--${accent ?? 'blue'}`">
    <div class="method-card__head">
      <span class="method-card__name">{{ label }}</span>
      <el-tag v-if="running" type="warning" effect="light" size="small" round>计算中</el-tag>
      <el-tag v-else-if="pending" type="info" effect="light" size="small" round>等待中</el-tag>
      <el-tag v-else-if="bestValue != null" type="success" effect="light" size="small" round>
        完成
      </el-tag>
    </div>
    <div class="method-card__grid">
      <div class="metric metric--main">
        <span class="metric__label">F(x, y)</span>
        <span class="metric__value">{{ bestValue == null ? '—' : formatNumber(bestValue) }}</span>
      </div>
      <div class="metric">
        <span class="metric__label">最优 x</span>
        <span class="metric__value">{{ bestX == null ? '—' : formatNumber(bestX) }}</span>
      </div>
      <div class="metric">
        <span class="metric__label">最优 y</span>
        <span class="metric__value">{{ bestY == null ? '—' : formatNumber(bestY) }}</span>
      </div>
      <div class="metric">
        <span class="metric__label">{{ progressLabel }}</span>
        <span class="metric__value">{{ progress }}</span>
      </div>
      <div class="metric">
        <span class="metric__label">运行时间</span>
        <span class="metric__value">
          {{ elapsedMs == null ? '—' : `${elapsedMs.toFixed(1)} ms` }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.method-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface);
}

.method-card--blue {
  border-top: 3px solid #2563eb;
}

.method-card--teal {
  border-top: 3px solid #0d9488;
}

.method-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: var(--surface-muted);
  border-bottom: 1px solid var(--border-light);
}

.method-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.method-card__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1px;
  background: var(--border-light);
}

.metric {
  padding: 12px 14px;
  background: var(--surface);
}

.metric--main {
  grid-column: 1 / -1;
  background: #fafbff;
}

.method-card--teal .metric--main {
  background: #f7fefc;
}

.metric__label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.metric__value {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.4;
}
</style>
