import type { AccentColor } from '@/components/ChatMessage'

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
  
  return {
    backgroundColor: hasAccent ? 'var(--accent-soft)' :
                     isError ? 'var(--error-bg)' :
                     isSystem ? 'var(--bg-alt)' :
                     'var(--bg-alt)',
    borderColor: bordered ? (
      hasAccent ? 'var(--accent)' :
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