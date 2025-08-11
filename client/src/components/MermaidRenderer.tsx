import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { Check, Copy, Download, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'

interface MermaidRendererProps {
  code: string
  className?: string
}

let mermaidInitialized = false

const generateRandomString = (length: number, lowercase = false) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return lowercase ? result.toLowerCase() : result
}

export function MermaidRenderer({ code, className }: MermaidRendererProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  useEffect(() => {
    if (!mermaidInitialized) {
      // Get current theme
      const isDark = document.documentElement.classList.contains('dark')
      
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'base',
        securityLevel: 'loose',
        themeVariables: isDark ? {
          // Dark theme variables
          darkMode: true,
          primaryColor: '#3B82F6',
          primaryTextColor: '#EAEAEA',
          primaryBorderColor: '#3A3A3A',
          lineColor: '#666666',
          secondaryColor: '#1A1A1A',
          tertiaryColor: '#2B2B2B',
          background: '#0E0E0E',
          mainBkg: '#1A1A1A',
          secondBkg: '#2B2B2B',
          tertiaryBkg: '#3A3A3A',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        } : {
          // Light theme variables
          darkMode: false,
          primaryColor: '#007AFF',
          primaryTextColor: '#1A1A1A',
          primaryBorderColor: '#DDDDDD',
          lineColor: '#666666',
          secondaryColor: '#F7F7F7',
          tertiaryColor: '#F0F0F0',
          background: '#FFFFFF',
          mainBkg: '#FFFFFF',
          secondBkg: '#F7F7F7',
          tertiaryBkg: '#F0F0F0',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        },
      })
      mermaidInitialized = true
    }

    const renderDiagram = async () => {
      try {
        setError('')
        const { svg: renderedSvg } = await mermaid.render(idRef.current, code)
        setSvg(renderedSvg)
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError('Failed to render diagram. Please check the syntax.')
        setSvg('')
        // Clean up any partial render attempts
        const element = document.getElementById(idRef.current)
        if (element) {
          element.remove()
        }
      }
    }

    renderDiagram()
  }, [code])

  const downloadAsFile = () => {
    if (typeof window === 'undefined') {
      return
    }
    
    // Download the mermaid code as .mmd file
    const suggestedFileName = `diagram-${generateRandomString(3, true)}.mmd`
    const fileName = window.prompt('Enter file name', suggestedFileName)

    if (!fileName) {
      return
    }

    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = fileName
    link.href = url
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(code)
  }

  if (error) {
    return (
      <div className={cn(
        'codeblock border-border relative w-full rounded-lg border bg-[#fafafa] py-2',
        className
      )}>
        <div className="flex w-full items-center justify-between px-4 py-2 border-b border-code-border">
          <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--error)' }}>
            <AlertCircle className="w-3 h-3" />
            mermaid error
          </span>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              onClick={downloadAsFile}
              size="icon"
              className="size-8"
            >
              <Download className="size-4" />
              <span className="sr-only">Download</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCopy}
              className="size-8"
            >
              {isCopied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              <span className="sr-only">Copy code</span>
            </Button>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm mb-3 font-medium" style={{ color: 'var(--error)' }}>{error}</p>
          <details className="group">
            <summary className="text-xs cursor-pointer transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}>
              View source code
            </summary>
            <pre className="mt-2 text-xs border p-3 rounded-lg overflow-x-auto animate-fade-in" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
              <code style={{ color: 'var(--text-muted)' }}>{code}</code>
            </pre>
          </details>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'relative w-full rounded-bubble border',
      'transition-all duration-200 hover:shadow-lg',
      className
    )}
    style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--code-border)' }}>
      <div className="flex w-full items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--code-border)', backgroundColor: 'color-mix(in srgb, var(--bg-alt) 50%, transparent)' }}>
        <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <title>Mermaid diagram icon</title>
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
          mermaid diagram
        </span>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            onClick={downloadAsFile}
            size="icon"
            className="size-8"
          >
            <Download className="size-4" />
            <span className="sr-only">Download</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCopy}
            className="size-8"
          >
            {isCopied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      </div>
      <div 
        ref={containerRef}
        className="mermaid-diagram-container p-6 flex justify-center overflow-x-auto rounded-b-bubble"
        style={{ backgroundColor: 'var(--bg)' }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}