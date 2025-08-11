import { useState, useEffect, useRef, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FullscreenPreviewProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function FullscreenPreview({ isOpen, onClose, children, title }: FullscreenPreviewProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 5))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25))
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if not clicking on a button
    if ((e.target as Element).closest('button')) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(prev => Math.max(0.25, Math.min(5, prev + delta)))
  }, [])

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault()
      const touch = e.touches[0]
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Add non-passive wheel event listener
  useEffect(() => {
    const container = containerRef.current
    if (!container || !isOpen) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [isOpen, handleWheel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 p-2 rounded-lg shadow-lg"
           style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
        {title && (
          <span className="text-sm font-medium px-2" style={{ color: 'var(--text)' }}>
            {title}
          </span>
        )}
        <div className="flex items-center gap-1 border-l pl-2" style={{ borderColor: 'var(--border)' }}>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleZoomOut}
            disabled={scale <= 0.25}
          >
            <ZoomOut className="size-4" />
            <span className="sr-only">Zoom out</span>
          </Button>
          
          <span className="text-xs px-2 min-w-12 text-center" style={{ color: 'var(--text-muted)' }}>
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleZoomIn}
            disabled={scale >= 5}
          >
            <ZoomIn className="size-4" />
            <span className="sr-only">Zoom in</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleReset}
          >
            <Maximize2 className="size-4" />
            <span className="sr-only">Fit to screen</span>
          </Button>
        </div>
      </div>

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 size-10 bg-black/50 hover:bg-black/70 text-white"
        onClick={onClose}
      >
        <X className="size-6" />
        <span className="sr-only">Close</span>
      </Button>

      {/* Content container */}
      <div
        ref={containerRef}
        className={cn(
          "w-full h-full flex items-center justify-center overflow-hidden",
          isDragging && "cursor-grabbing"
        )}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Content */}
        <div
          className="transition-transform select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        >
          {children}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-center text-white/70 max-w-md px-4">
        <p>Click and drag to pan • Scroll to zoom • ESC to close</p>
      </div>
    </div>
  )
}