/// <reference types="vite/client" />

declare module 'plotly.js-dist-min' {
  import * as Plotly from 'plotly.js'
  export default Plotly
}

declare module 'katex' {
  export function renderToString(
    tex: string,
    options?: {
      throwOnError?: boolean
      displayMode?: boolean
    },
  ): string
}
