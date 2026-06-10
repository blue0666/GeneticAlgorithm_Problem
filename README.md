# 遗传算法求最值实验（Web 版）

基于 **Vite + Vue 3 + TypeScript + Element Plus + ECharts + Plotly.js** 的模块化实验系统，可在浏览器中实时运行遗传算法与粒子群算法，并部署到 GitHub Pages。

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

## 构建与 GitHub Pages 部署

```bash
npm run build
```

将 `dist/` 目录内容部署到 GitHub Pages。若使用项目页（`https://用户名.github.io/仓库名/`），请在 `vite.config.ts` 中把 `base` 改为 `'/仓库名/'`。

也可使用 gh-pages 分支：

```bash
npx gh-pages -d dist
```

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
