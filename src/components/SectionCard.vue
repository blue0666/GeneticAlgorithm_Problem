<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <section class="section-card">
    <div v-if="title || $slots.extra" class="section-card__head">
      <div>
        <h3 v-if="title" class="section-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="section-card__subtitle">{{ subtitle }}</p>
      </div>
      <slot name="extra" />
    </div>
    <div class="section-card__body" :class="{ 'section-card__body--plain': !title }">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.section-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border-light);
  background: linear-gradient(180deg, #fcfdff 0%, var(--surface) 100%);
}

.section-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-card__subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-muted);
}

.section-card__body {
  padding: 18px 20px 20px;
}

.section-card__body--plain {
  padding-top: 20px;
}
</style>
