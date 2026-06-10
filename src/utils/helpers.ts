import type { GAParams } from '@/algorithms/types'

export const DEFAULT_POP_SIZES = [50, 100, 200, 500]

export function formatNumber(value: number, digits = 15): string {
  if (!Number.isFinite(value)) return String(value)
  return value.toFixed(digits)
}

export function cloneGAParams(params: GAParams): GAParams {
  return {
    ...params,
    xBound: [...params.xBound] as [number, number],
    yBound: [...params.yBound] as [number, number],
  }
}

export async function yieldToUI(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}
