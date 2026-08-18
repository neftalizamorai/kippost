import type { CSSProperties } from 'react'

export interface CoverOptions {
  x?: number         // focal point 0–100, default 50
  y?: number         // focal point 0–100, default 50
  brightness?: number  // default 1.0
  contrast?: number    // default 1.0
  saturate?: number    // default 1.0
}

export function coverStyle(opts: CoverOptions = {}): CSSProperties {
  const { x = 50, y = 50, brightness = 1, contrast = 1, saturate = 1 } = opts
  const parts: string[] = []
  if (brightness !== 1) parts.push(`brightness(${brightness})`)
  if (contrast !== 1) parts.push(`contrast(${contrast})`)
  if (saturate !== 1) parts.push(`saturate(${saturate})`)
  return {
    objectPosition: `${x}% ${y}%`,
    ...(parts.length > 0 ? { filter: parts.join(' ') } : {}),
  }
}
