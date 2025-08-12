import { useState } from 'react'
import { Check, Copy, Download, Expand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

const generateRandomString = (length: number, lowercase = false) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return lowercase ? result.toLowerCase() : result
}

const getFileExtension = (language: string): string => {
  const extensions: { [key: string]: string } = {
    javascript: 'js',
    typescript: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    csharp: 'cs',
    php: 'php',
    ruby: 'rb',
    go: 'go',
    rust: 'rs',
    sql: 'sql',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    json: 'json',
    xml: 'xml',
    yaml: 'yml',
    yml: 'yml',
    toml: 'toml',
    ini: 'ini',
    conf: 'conf',
    sh: 'sh',
    bash: 'sh',
    zsh: 'zsh',
    fish: 'fish',
    powershell: 'ps1',
    dockerfile: 'dockerfile',
    makefile: 'makefile',
    mermaid: 'mmd',
    markdown: 'md',
    latex: 'tex',
    r: 'r',
    matlab: 'm',
    kotlin: 'kt',
    swift: 'swift',
    dart: 'dart',
    elixir: 'ex',
    erlang: 'erl',
    haskell: 'hs',
    scala: 'scala',
    clojure: 'clj',
    lua: 'lua',
    perl: 'pl',
    vim: 'vim'
  }
  
  return extensions[language.toLowerCase()] || 'txt'
}

interface CodeBlockHeaderProps {
  title: string
  language?: string
  code: string
  icon?: React.ReactNode
  onFullscreen?: () => void
  customDownloads?: Array<{
    label: string
    filename: string
    content: string | Blob
    mimeType?: string
  }>
}

export function CodeBlockHeader({
  title,
  language,
  code,
  icon,
  onFullscreen,
  customDownloads
}: CodeBlockHeaderProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false)

  const defaultDownload = () => {
    if (typeof window === 'undefined') return
    
    const extension = language ? getFileExtension(language) : 'txt'
    const suggestedFileName = `code-${generateRandomString(3, true)}.${extension}`
    const fileName = window.prompt('Enter file name', suggestedFileName)

    if (!fileName) return

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

  const handleCustomDownload = (download: NonNullable<typeof customDownloads>[0]) => {
    if (typeof window === 'undefined') return

    const fileName = window.prompt('Enter file name', download.filename)
    if (!fileName) return

    let blob: Blob
    if (download.content instanceof Blob) {
      blob = download.content
    } else {
      blob = new Blob([download.content], { 
        type: download.mimeType || 'text/plain' 
      })
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = fileName
    link.href = url
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setIsDownloadMenuOpen(false)
  }

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(code)
  }

  const hasMultipleDownloads = customDownloads && customDownloads.length > 0

  return (
    <div className="flex w-full items-center justify-between px-4 py-2 border-b" 
         style={{ 
           borderColor: 'var(--code-border)', 
           backgroundColor: 'color-mix(in srgb, var(--bg-alt) 50%, transparent)' 
         }}>
      <span className="text-xs font-medium flex items-center gap-1.5" 
            style={{ color: 'var(--accent)' }}>
        {icon}
        {title}
      </span>
      
      <div className="flex items-center space-x-1 relative">
        {onFullscreen && (
          <Button
            variant="ghost"
            onClick={onFullscreen}
            size="icon"
            className="size-8"
          >
            <Expand className="size-4" />
            <span className="sr-only">Fullscreen</span>
          </Button>
        )}
        
        {hasMultipleDownloads ? (
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
              size="icon"
              className="size-8"
            >
              <Download className="size-4" />
              <span className="sr-only">Download</span>
            </Button>
            
            {isDownloadMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 min-w-48 p-1 rounded-lg border shadow-lg flex flex-col"
                   style={{ 
                     backgroundColor: 'var(--bg)', 
                     borderColor: 'var(--border)' 
                   }}>
                <button
                  type="button"
                  onClick={() => {
                    defaultDownload()
                    setIsDownloadMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-[var(--bg-alt)] whitespace-nowrap"
                >
                  Download as {language ? getFileExtension(language) : 'txt'}
                </button>
                
                {customDownloads.map((download, index) => (
                  <button
                    type="button"
                    key={`download-${download.label}`}
                    onClick={() => handleCustomDownload(download)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-[var(--bg-alt)] whitespace-nowrap"
                  >
                    {download.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={defaultDownload}
            size="icon"
            className="size-8"
          >
            <Download className="size-4" />
            <span className="sr-only">Download</span>
          </Button>
        )}
        
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
      
      {/* Click outside to close dropdown */}
      {isDownloadMenuOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: This is a click-outside handler, not an interactive element
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDownloadMenuOpen(false)}
        />
      )}
    </div>
  )
}