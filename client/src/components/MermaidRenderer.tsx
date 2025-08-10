import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { Check, Copy, Download } from 'lucide-react'
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
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        themeVariables: {
          darkMode: false,
          primaryColor: '#e5e7eb',
          primaryTextColor: '#111827',
          primaryBorderColor: '#d1d5db',
          lineColor: '#6b7280',
          secondaryColor: '#f3f4f6',
          tertiaryColor: '#f9fafb',
          background: '#ffffff',
          mainBkg: '#ffffff',
          secondBkg: '#f3f4f6',
          tertiaryBkg: '#f9fafb',
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
        <div className="flex w-full items-center justify-between px-4">
          <span className="text-xs lowercase">mermaid (error)</span>
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
        <div className="px-4 py-2">
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <pre className="text-xs bg-red-100 p-2 rounded overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'codeblock border-border relative w-full rounded-lg border bg-[#fafafa] py-2',
      className
    )}>
      <div className="flex w-full items-center justify-between px-4">
        <span className="text-xs lowercase">mermaid</span>
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
        className="mermaid-diagram-container px-4 py-2 flex justify-center overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}