import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// GitHub Pages 项目页：https://用户名.github.io/仓库名/
export default defineConfig({
  base: '/GeneticAlgorithm_Problem/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
