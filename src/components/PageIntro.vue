<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="page-intro">
    <h2 class="page-intro__title">{{ title }}</h2>
    <p v-if="description" class="page-intro__desc">{{ description }}</p>
    <slot />
  </header>
</template>

<style scoped>
.page-intro {
  padding: 4px 2px 0;
}

.page-intro__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.page-intro__desc {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-secondary);
}
</style>
