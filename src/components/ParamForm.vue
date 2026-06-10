<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { GAParams } from '@/algorithms/types'

const props = defineProps<{
  modelValue: GAParams
  disabled?: boolean
  boundsOnly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: GAParams]
}>()

const local = reactive({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => Object.assign(local, val),
  { deep: true },
)

function emitUpdate() {
  emit('update:modelValue', {
    ...local,
    xBound: [...local.xBound] as [number, number],
    yBound: [...local.yBound] as [number, number],
  })
}
</script>

<template>
  <el-form label-width="108px" :disabled="disabled" class="param-form" @change="emitUpdate">
    <el-row :gutter="20">
      <template v-if="!boundsOnly">
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="编码长度">
            <el-input-number v-model="local.dnaSize" :min="8" :max="64" @change="emitUpdate" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="种群规模">
            <el-input-number v-model="local.popSize" :min="10" :max="1000" @change="emitUpdate" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="迭代次数">
            <el-input-number v-model="local.iterations" :min="1" :max="2000" @change="emitUpdate" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="交叉概率">
            <el-input-number
              v-model="local.crossRate"
              :min="0"
              :max="1"
              :step="0.05"
              :precision="2"
              @change="emitUpdate"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="变异率">
            <el-input-number
              v-model="local.mutaRate"
              :min="0"
              :max="1"
              :step="0.005"
              :precision="3"
              @change="emitUpdate"
            />
          </el-form-item>
        </el-col>
      </template>
      <el-col :xs="24" :sm="12" :lg="8">
        <el-form-item label="X 区间">
          <div class="bound-row">
            <el-input-number v-model="local.xBound[0]" :step="0.1" @change="emitUpdate" />
            <span class="bound-sep">至</span>
            <el-input-number v-model="local.xBound[1]" :step="0.1" @change="emitUpdate" />
          </div>
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="8">
        <el-form-item label="Y 区间">
          <div class="bound-row">
            <el-input-number v-model="local.yBound[0]" :step="0.1" @change="emitUpdate" />
            <span class="bound-sep">至</span>
            <el-input-number v-model="local.yBound[1]" :step="0.1" @change="emitUpdate" />
          </div>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<style scoped>
.param-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.bound-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bound-sep {
  color: var(--text-muted);
  font-size: 13px;
  flex-shrink: 0;
}
</style>
