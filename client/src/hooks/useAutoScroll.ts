import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAutoScrollOptions {
  threshold?: number
  rootMargin?: string
  delay?: number
}

export function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const {
    threshold = 0.8,
    rootMargin = '0px',
    delay = 100
  } = options

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollContainerRef.current) {
      const scrollOptions: ScrollToOptions = {
        top: scrollContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant'
      }
      scrollContainerRef.current.scrollTo(scrollOptions)
    }
  }, [])

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    const atBottom = entry.isIntersecting
    setIsAtBottom(atBottom)
    setShouldAutoScroll(atBottom)
  }, [])

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (scrollContainerRef.current && sentinelRef.current) {
        const container = scrollContainerRef.current
        const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight
        const atBottom = scrollBottom < 50
        
        if (atBottom !== isAtBottom) {
          setIsAtBottom(atBottom)
          setShouldAutoScroll(atBottom)
        }
      }
    }, delay)
  }, [isAtBottom, delay])

  useEffect(() => {
    if (!sentinelRef.current || !scrollContainerRef.current) return

    observerRef.current = new IntersectionObserver(
      handleIntersection,
      {
        root: scrollContainerRef.current,
        rootMargin,
        threshold
      }
    )

    observerRef.current.observe(sentinelRef.current)

    const container = scrollContainerRef.current
    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [handleIntersection, handleScroll, rootMargin, threshold])

  const performAutoScroll = useCallback(() => {
    if (shouldAutoScroll && scrollContainerRef.current) {
      requestAnimationFrame(() => {
        scrollToBottom(true)
      })
    }
  }, [shouldAutoScroll, scrollToBottom])

  return {
    scrollContainerRef,
    sentinelRef,
    isAtBottom,
    shouldAutoScroll,
    scrollToBottom,
    performAutoScroll
  }
}