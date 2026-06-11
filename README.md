# 遗传算法求最值实验（Web 版）

基于 **Vite + Vue 3 + TypeScript + Element Plus + ECharts + Plotly.js** 的模块化实验系统，可在浏览器中运行遗传算法与网格搜索，并部署到 GitHub Pages。

## 项目结构

```
code/
├── src/
│   ├── algorithms/     # GA、网格搜索
│   ├── functions/      # 目标函数（题目一、Rastrigin）
│   ├── components/     # 参数表单、图表、3D 曲面
│   ├── views/          # 各实验页面
│   └── utils/          # 工具函数
├── index.html
└── vite.config.ts
```

## 本地运行

```bash
cd code
npm install
npm run dev
```

浏览器打开终端提示的地址（通常是 http://localhost:5173）。

## GitHub Pages 自动部署

网站地址：`https://blue0666.github.io/GeneticAlgorithm_Problem/`

### 首次在 GitHub 上配置（只需做一次）

1. **Settings → Actions → General → Workflow permissions**  
   选择 **Read and write permissions**，保存。

2. **Settings → Pages**  
   - Source：**Deploy from a branch**  
   - Branch：**gh-pages**  
   - Folder：**/ (root)**  
   - 保存  

3. 本地 push 代码后，打开 **Actions**，等待「发布到 GitHub Pages」出现绿色勾。

4. 若仓库里还没有 `gh-pages` 分支，需等 Actions 第一次成功运行后才会自动创建。

### 日常更新

```bash
git add .
git commit -m "更新说明"
git push
```

push 后 Actions 会自动 `npm run build`，并把结果更新到 `gh-pages` 分支。

### 手动部署（不用 Actions 时）

```bash
npm run build
npx gh-pages -d dist
```

`vite.config.ts` 中 `base` 已设为 `/GeneticAlgorithm_Problem/`。

## 功能模块

| 页面 | 说明 |
|------|------|
| 题目一 | 求最大值，GA / 网格搜索 切换，实时曲线与 3D 图 |
| 题目二 | Rastrigin 最小值 |
| 种群规模对比 | 多种 popSize 批量实验 |
| 算法对比 | GA vs 网格搜索 结果与时间 |

## 与参考 Python 代码的对应

- `src/algorithms/ga.ts` ↔ `ga_max.py` / `ga_min.py`
- `src/algorithms/gridSearch.ts` ↔ 均匀网格穷举（200×200 对照）
- `src/functions/maxFunction.ts` ↔ 题目一 `F(x,y)`
- `src/functions/rastrigin.ts` ↔ 题目二 Rastrigin
