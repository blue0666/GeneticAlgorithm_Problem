<script setup lang="ts">
import MathFormula from '@/components/MathFormula.vue'

withDefaults(
  defineProps<{
    title: string
    formulaLatex: string
    variant?: 'max' | 'min'
  }>(),
  { variant: 'max' },
)
</script>

<template>
  <section class="problem-header" :class="`problem-header--${variant}`">
    <h2 class="problem-title">{{ title }}</h2>
    <div class="formula-panel">
      <MathFormula :latex="formulaLatex" />
    </div>
  </section>
</template>

<style scoped>
.problem-header {
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  border: 1px solid var(--border);
  border-left-width: 4px;
  box-shadow: var(--shadow-sm);
}

.problem-header--max {
  background: linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%);
  border-left-color: #3b82f6;
}

.problem-header--min {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf9 100%);
  border-left-color: #14b8a6;
}

.problem-title {
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: 0.02em;
}

.formula-panel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e8eef5;
  border-radius: 10px;
  padding: 14px 18px;
  overflow-x: auto;
}

.problem-header--max .formula-panel {
  box-shadow: inset 0 1px 0 rgba(59, 130, 246, 0.06);
}

.problem-header--min .formula-panel {
  box-shadow: inset 0 1px 0 rgba(20, 184, 166, 0.06);
}
</style>
