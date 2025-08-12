import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { AlertCircle, Zap } from 'lucide-react'
import { CodeBlockHeader } from './CodeBlockHeader'
import { cn } from '@/lib/utils'

interface MermaidRendererProps {
  code: string
  className?: string
  onFullscreen?: (content: React.ReactNode, title: string) => void
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

export function MermaidRenderer({ code, className, onFullscreen }: MermaidRendererProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)

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

    // Skip empty or invalid code
    if (!code || code.trim().length === 0) {
      setError('No diagram code provided')
      setSvg('')
      return
    }

    let isCancelled = false
    const renderDiagram = async () => {
      try {
        setError('')
        // Generate a unique ID for each render attempt
        const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // Clean up any existing element with the old ID
        const oldElement = document.getElementById(idRef.current)
        if (oldElement) {
          oldElement.remove()
        }
        
        if (isCancelled) return
        
        const { svg: renderedSvg } = await mermaid.render(uniqueId, code)
        
        if (!isCancelled) {
          setSvg(renderedSvg)
          idRef.current = uniqueId
        }
      } catch (err: unknown) {
        if (isCancelled) return
        
        // More specific error messages
        const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram'
        if (errorMessage.includes('No diagram type detected')) {
          setError('Invalid diagram type or syntax. Please check your Mermaid code.')
        } else if (errorMessage.includes('Parse error')) {
          setError('Syntax error in diagram. Please check your Mermaid syntax.')
        } else {
          setError('Failed to render diagram. Please check the syntax.')
        }
        setSvg('')
        
        // Clean up any partial render attempts with dynamic ID pattern
        const mermaidElements = document.querySelectorAll('[id^="mermaid-"]')
        for (const el of mermaidElements) {
          if (el.id.includes('output')) {
            el.remove()
          }
        }
      }
    }

    renderDiagram()
    
    // Cleanup function
    return () => {
      isCancelled = true
    }
  }, [code])

  const downloadSvgAsImage = (): { label: string; filename: string; content: Blob } | null => {
    if (!svg) return null
    
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' })
    return {
      label: 'Download as SVG image',
      filename: `diagram-${generateRandomString(3, true)}.svg`,
      content: svgBlob
    }
  }

  if (error) {
    return (
      <div className={cn(
        'relative w-full rounded-lg border',
        className
      )}
      style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--code-border)' }}>
        <CodeBlockHeader
          title="mermaid error"
          language="mermaid"
          code={code}
          icon={<AlertCircle className="w-3 h-3" />}
        />
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

  const mermaidIcon = <Zap className="w-3 h-3" />

  const diagramContainer = (
    <div 
      ref={containerRef}
      className="mermaid-diagram-container p-6 flex justify-center overflow-x-auto rounded-b-lg"
      style={{ backgroundColor: 'var(--bg)', maxWidth: '100%' }}
    >
      <div 
        className="max-w-full"
        style={{ maxWidth: '100%', overflow: 'hidden' }}
        dangerouslySetInnerHTML={{ __html: svg.replace('<svg', '<svg style="max-width: 100%; height: auto; display: block;"') }}
      />
    </div>
  )

  const customDownloads = []
  const svgDownload = downloadSvgAsImage()
  if (svgDownload) {
    customDownloads.push(svgDownload)
  }

  return (
    <div className={cn(
      'relative w-full rounded-lg border',
      'transition-all duration-200 hover:shadow-lg',
      className
    )}
    style={{ 
      backgroundColor: 'var(--code-bg)', 
      borderColor: 'var(--code-border)',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <CodeBlockHeader
        title="mermaid diagram"
        language="mermaid"
        code={code}
        icon={mermaidIcon}
        customDownloads={customDownloads}
        onFullscreen={() => onFullscreen?.(
          <div className="bg-white p-8 rounded-lg max-w-full max-h-full overflow-auto">
            <div 
              style={{ maxWidth: '100%', overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: svg.replace('<svg', '<svg style="max-width: 100%; height: auto; display: block;"') }} 
            />
          </div>,
          'Mermaid Diagram'
        )}
      />
      <button 
        type="button"
        className="cursor-pointer w-full text-left"
        onClick={() => onFullscreen?.(
          <div className="bg-white p-8 rounded-lg max-w-full max-h-full overflow-auto">
            <div 
              style={{ maxWidth: '100%', overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: svg.replace('<svg', '<svg style="max-width: 100%; height: auto; display: block;"') }} 
            />
          </div>,
          'Mermaid Diagram'
        )}
      >
        {diagramContainer}
      </button>
    </div>
  )
}