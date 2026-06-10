<script setup lang="ts">
import SolverView from '@/views/SolverView.vue'
import MathFormula from '@/components/MathFormula.vue'
import PageIntro from '@/components/PageIntro.vue'
import SectionCard from '@/components/SectionCard.vue'
import { defaultGAParamsMax, defaultGAParamsMin } from '@/algorithms/ga'
import { GRID_SEARCH_SIZE } from '@/algorithms/gridSearch'
import { maxObjective, MAX_FORMULA_LATEX } from '@/functions/maxFunction'
import { rastriginObjective, RASTRIGIN_FORMULA_LATEX } from '@/functions/rastrigin'

const maxParams = defaultGAParamsMax()
const minParams = defaultGAParamsMin()
</script>

<template>
  <el-container class="app-shell">
    <el-header class="header">
      <div class="header-inner">
        <div class="header-brand">
          <span class="header-badge">实验四</span>
          <div>
            <h1>遗传算法求最值</h1>
          </div>
        </div>
      </div>
    </el-header>

    <el-main class="main-content">
      <div class="content-wrap">
        <el-tabs type="border-card" class="app-tabs">
          <el-tab-pane label="实验说明">
            <div class="page-stack">
              <PageIntro
                title="实验概述"
                description="本次实验使用遗传函数与另一个暴力算法（网格搜索）求解两个函数的最值，分别在每个题的页面内一键运行 GA 与网格搜索，并在下方实时查看对比结果"
              />

              <SectionCard title="实验内容">
                <ol class="intro-list">
                  <li>题目一：自定义函数在指定区间内求<strong>最大值</strong></li>
                  <li>题目二：Rastrigin 函数在指定区间内求<strong>最小值</strong></li>
                  <li>点击求解后后，GA 与 {{ GRID_SEARCH_SIZE }}×{{ GRID_SEARCH_SIZE }} 网格搜索分别计算结果</li>
                  <li>三维图用黑点实时展示 GA 进化过程；同时在页面底部展示两种算法对比与修改种群规模后的对比</li>
                </ol>
              </SectionCard>

              <SectionCard title="题目一 / 二 默认参数">
                <el-descriptions :column="1" border class="param-table">
                  <el-descriptions-item label="题目一函数">
                    <MathFormula :latex="MAX_FORMULA_LATEX" />
                  </el-descriptions-item>
                  <el-descriptions-item label="题目二函数">
                    <MathFormula :latex="RASTRIGIN_FORMULA_LATEX" />
                  </el-descriptions-item>
                  <el-descriptions-item label="题目一 · 编码长度">
                    {{ maxParams.dnaSize }}（种群 {{ maxParams.popSize }}，迭代
                    {{ maxParams.iterations }}）
                  </el-descriptions-item>
                  <el-descriptions-item label="题目二 · 编码长度">
                    {{ minParams.dnaSize }}（种群 {{ minParams.popSize }}，迭代
                    {{ minParams.iterations }}）
                  </el-descriptions-item>
                  <el-descriptions-item label="网格搜索">
                    {{ GRID_SEARCH_SIZE }}×{{ GRID_SEARCH_SIZE }} 均匀网格，共
                    {{ GRID_SEARCH_SIZE * GRID_SEARCH_SIZE }} 次函数评估
                  </el-descriptions-item>
                </el-descriptions>
              </SectionCard>
            </div>
          </el-tab-pane>

          <el-tab-pane label="1. 求最大值" lazy>
            <SolverView
              title="1. 求函数最大值"
              :formula-latex="MAX_FORMULA_LATEX"
              variant="max"
              mode="max"
              :objective="maxObjective"
              :default-params="maxParams"
              fitness-label="最大值"
            />
          </el-tab-pane>

          <el-tab-pane label="2. Rastrigin 最小值" lazy>
            <SolverView
              title="2. 求 Rastrigin 函数最小值"
              :formula-latex="RASTRIGIN_FORMULA_LATEX"
              variant="min"
              mode="min"
              :objective="rastriginObjective"
              :default-params="minParams"
              fitness-label="最小值"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-main>
  </el-container>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--app-bg);
}

.header {
  height: auto !important;
  padding: 18px 24px;
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #3b82f6 100%);
  color: #fff;
  box-shadow: 0 2px 12px rgba(37, 99, 235, 0.25);
}

.header-inner {
  max-width: var(--content-max);
  margin: 0 auto;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.header h1 {
  margin: 0;
  font-size: 21px;
  font-weight: 600;
}

.header p {
  margin: 4px 0 0;
  opacity: 0.88;
  font-size: 13px;
}

.main-content {
  padding: 20px 16px 32px;
}

.content-wrap {
  max-width: var(--content-max);
  margin: 0 auto;
}

.intro-list {
  margin: 0;
  padding-left: 20px;
  line-height: 1.85;
  color: var(--text-secondary);
}

.param-table :deep(.el-descriptions__label) {
  width: 140px;
  font-weight: 500;
}
</style>
