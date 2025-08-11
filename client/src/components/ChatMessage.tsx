import type React from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, AlertCircle, Copy, RotateCw, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

export type MessageRole = 'self' | 'user' | 'assistant' | 'tool' | 'system' | 'error'
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal' | 'neutral'

interface MessageProps {
  role: MessageRole
  accent?: AccentColor
  name?: string
  time?: string
  children: React.ReactNode
  actions?: React.ReactNode
  details?: string
  onRetry?: () => void
  className?: string
  isStreaming?: boolean
}

export function ChatMessage({
  role,
  accent,
  name,
  time,
  children,
  actions,
  details,
  onRetry,
  className,
  isStreaming = false,
}: MessageProps) {
  const [showDetails, setShowDetails] = useState(false)
  const { isCopied, copyToClipboard } = useCopyToClipboard()
  
  // Determine alignment and styling based on role
  const isAlignedRight = role === 'self'
  const isAlignedCenter = role === 'system'
  const isError = role === 'error'
  const hasAccent = accent && (role === 'self' || role === 'assistant')
  
  // Create wrapper div with accent class for proper scoping
  const wrapperClasses = cn(
    'w-full',
    accent && {
      'accent-blue': accent === 'blue',
      'accent-green': accent === 'green',
      'accent-purple': accent === 'purple',
      'accent-orange': accent === 'orange',
      'accent-pink': accent === 'pink',
      'accent-teal': accent === 'teal',
      'accent-neutral': accent === 'neutral',
    }
  )
  
  const bubbleClasses = cn(
    'group relative max-w-bubble rounded-bubble px-4 py-3',
    'text-sm leading-relaxed break-words',
    'border', // Always show border per spec
    {
      // Messages with accent get thicker border
      'border-2': hasAccent || isError,
      // Alignment
      'ml-auto mr-0 animate-slide-in-right': isAlignedRight,
      'mr-auto ml-0 animate-slide-in-left': !isAlignedRight && !isAlignedCenter && !isError,
      'mx-auto text-center max-w-md': isAlignedCenter,
      // System messages get dashed border and italic
      'border-dashed italic': isAlignedCenter,
      // Streaming animation
      'animate-pulse-soft': isStreaming,
    },
    className
  )
  
  // Compute dynamic styles based on role and accent
  const bubbleStyles: React.CSSProperties = {
    backgroundColor: hasAccent ? 'var(--accent-soft)' :
                     isError ? 'var(--error-bg)' :
                     isAlignedCenter ? 'var(--bg-alt)' :
                     'var(--bg-alt)',
    borderColor: hasAccent ? 'var(--accent)' :
                 isError ? 'var(--error-border)' :
                 'var(--border)',
    color: isError ? 'var(--error)' : 'var(--text)'
  }
  
  const containerClasses = cn(
    'flex gap-3 px-4 py-2',
    {
      'justify-end': isAlignedRight,
      'justify-center': isAlignedCenter,
      'justify-start': !isAlignedRight && !isAlignedCenter,
    }
  )
  
  const handleCopyContent = () => {
    const text = typeof children === 'string' ? children : children?.toString() || ''
    copyToClipboard(text)
  }
  
  return (
    <div className={containerClasses}>
      <div className={wrapperClasses}>
        <div className="flex flex-col gap-1 max-w-bubble w-full">
        {/* Message bubble */}
        <div className={bubbleClasses} style={bubbleStyles}>
          {/* Name and time inside bubble */}
          {(name || time) && (
            <div className={cn(
              'flex items-center gap-2 mb-2 pb-2 border-b border-black/10 dark:border-white/10',
              isAlignedCenter && 'justify-center'
            )}>
              {name && (
                <span 
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                  style={{ 
                    borderColor: accent ? 'var(--accent)' : 'var(--border)',
                    color: accent ? 'var(--accent)' : 'var(--text-muted)',
                    backgroundColor: accent ? 'var(--accent-soft)' : 'transparent'
                  }}
                >
                  {name}
                </span>
              )}
              {time && (
                <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-muted) 70%, transparent)' }}>
                  {time}
                </span>
              )}
            </div>
          )}
          
          {/* Error specific header */}
          {isError && (
            <div className="flex items-center gap-2 mb-2 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Something went wrong</span>
            </div>
          )}
          
          {/* Message content */}
          <div className="prose-chat">
            {children}
          </div>
          
          {/* Details section for errors */}
          {isError && details && (
            <div className="mt-3 pt-3 border-t border-error-border/50">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: 'color-mix(in srgb, var(--error-contrast) 70%, transparent)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error-contrast)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'color-mix(in srgb, var(--error-contrast) 70%, transparent)' }}
              >
                {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showDetails ? 'Hide' : 'Show'} details
              </button>
              {showDetails && (
                <pre className="mt-2 p-2 border rounded text-xs overflow-x-auto animate-fade-in" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--code-border)' }}>
                  {details}
                </pre>
              )}
            </div>
          )}
          
          {/* Hover actions */}
          <div className={cn(
            'absolute -top-8 right-0 flex items-center gap-1',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'border rounded-lg shadow-lg p-1',
            'pointer-events-none group-hover:pointer-events-auto'
          )}
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
            {isError && onRetry && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={onRetry}
                title="Retry"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleCopyContent}
              title={isCopied ? 'Copied!' : 'Copy'}
            >
              <Copy className="h-3.5 w-3.5" style={isCopied ? { color: 'var(--accent)' } : undefined} />
            </Button>
            {actions}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}