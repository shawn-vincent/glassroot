import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { MermaidRenderer } from './MermaidRenderer'
import { useEffect, useState } from 'react'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
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
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const language = match?.[1]
            const inline = !className || className.indexOf('language-') === -1
            
            // Handle mermaid diagrams
            if (!inline && language === 'mermaid') {
              return <MermaidRenderer code={String(children).replace(/\n$/, '')} />
            }
            
            // Handle code blocks with syntax highlighting
            if (!inline && language) {
              return (
                <div className="code-block-wrapper">
                  <SyntaxHighlighter
                    language={language}
                    style={isDark ? oneDark : oneLight}
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--code-bg)',
                      border: '1px solid var(--code-border)',
                      overflow: 'auto',
                    }}
                    codeTagProps={{
                      style: {
                        color: 'var(--text)',
                      }
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              )
            }
            
            // Inline code
            if (inline) {
              return (
                <code 
                  className="inline-code"
                  style={{
                    backgroundColor: 'var(--code-bg)',
                    borderColor: 'var(--code-border)',
                    color: 'var(--text)',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.875em',
                    border: '1px solid var(--code-border)',
                  }}
                  {...props}
                >
                  {children}
                </code>
              )
            }
            
            // Code block without language
            return (
              <pre 
                style={{
                  backgroundColor: 'var(--code-bg)',
                  border: '1px solid var(--code-border)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  overflow: 'auto',
                }}
              >
                <code style={{ color: 'var(--text)' }} {...props}>
                  {children}
                </code>
              </pre>
            )
          },
          // Scale images to fit
          img({ src, alt, ...props }) {
            return (
              <img 
                src={src} 
                alt={alt} 
                style={{ maxWidth: '100%', height: 'auto' }}
                {...props}
              />
            )
          },
          // Style links with accent color
          a({ href, children, ...props }) {
            return (
              <a 
                href={href}
                style={{
                  color: 'var(--accent)',
                  textDecoration: 'underline',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-muted)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--accent)'
                }}
                {...props}
              >
                {children}
              </a>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}