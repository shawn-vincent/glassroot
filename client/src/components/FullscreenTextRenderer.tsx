import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useEffect, useState } from 'react'

interface FullscreenTextRendererProps {
  content: string
  language?: string
  title: string
}

export function FullscreenTextRenderer({ content, language, title }: FullscreenTextRendererProps) {
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    // Check theme on mount and when it changes
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkTheme()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    })
    
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-[var(--code-bg)] border border-[var(--code-border)] rounded-lg overflow-hidden max-w-[95vw] max-h-[90vh]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--code-border)] bg-[var(--bg-alt)]">
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {title}
        </span>
      </div>
      
      {/* Content with scrolling */}
      <div className="overflow-auto" style={{ maxHeight: '80vh' }}>
        {language ? (
          <SyntaxHighlighter
            language={language}
            style={isDark ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '0.875rem',
              backgroundColor: 'var(--code-bg)',
              border: 'none',
              minHeight: '100%',
            }}
            codeTagProps={{
              style: {
                color: 'var(--text)',
              }
            }}
          >
            {content}
          </SyntaxHighlighter>
        ) : (
          <pre 
            style={{
              backgroundColor: 'var(--code-bg)',
              border: 'none',
              borderRadius: 0,
              padding: '1rem',
              margin: 0,
              overflow: 'visible',
              minHeight: '100%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <code style={{ color: 'var(--text)' }}>
              {content}
            </code>
          </pre>
        )}
      </div>
    </div>
  )
}