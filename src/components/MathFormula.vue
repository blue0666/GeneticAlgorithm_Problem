<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = withDefaults(
  defineProps<{
    latex: string
    displayMode?: boolean
  }>(),
  { displayMode: true },
)

const html = computed(() =>
  katex.renderToString(props.latex, {
    throwOnError: false,
    displayMode: props.displayMode,
  }),
)
</script>

<template>
  <div class="math-formula" v-html="html" />
</template>

<style scoped>
.math-formula {
  color: #1e293b;
  line-height: 1.6;
}

.math-formula :deep(.katex) {
  font-size: 1.15em;
}

.math-formula :deep(.katex-display) {
  margin: 0;
}
</style>
