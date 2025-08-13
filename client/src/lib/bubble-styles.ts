import type { AccentColor } from '@/lib/theme-colors'

export interface BubbleStyleOptions {
  accent?: AccentColor
  variant?: 'default' | 'error' | 'system'
  bordered?: boolean
}

export function getBubbleStyles(options: BubbleStyleOptions = {}): React.CSSProperties {
  const { accent, variant = 'default', bordered = true } = options
  
  const hasAccent = !!accent
  const isError = variant === 'error'
  const isSystem = variant === 'system'
  
  // If we have an accent color, use the specific Tailwind color variable
  // instead of the global --accent variable
  const accentVar = accent ? `--color-${accent}-500` : null
  const accentSoft = accent ? `color-mix(in srgb, var(${accentVar}) 10%, transparent)` : null
  
  return {
    backgroundColor: hasAccent && accentSoft ? accentSoft :
                     isError ? 'var(--error-bg)' :
                     isSystem ? 'var(--bg-alt)' :
                     'var(--bg-alt)',
    borderColor: bordered ? (
      hasAccent && accentVar ? `var(${accentVar})` :
      isError ? 'var(--error-border)' :
      'var(--border)'
    ) : undefined,
    borderWidth: bordered ? (hasAccent || isError ? '2px' : '1px') : undefined,
    color: isError ? 'var(--error)' : 'var(--text)'
  }
}

export function getBubbleClasses(options: {
  hasAccent?: boolean
  isError?: boolean
  bordered?: boolean
} = {}): string {
  const { hasAccent = false, isError = false, bordered = true } = options
  
  const classes: string[] = []
  
  if (bordered) {
    classes.push('border')
    if (hasAccent || isError) {
      classes.push('border-2')
    }
  }
  
  return classes.join(' ')
}