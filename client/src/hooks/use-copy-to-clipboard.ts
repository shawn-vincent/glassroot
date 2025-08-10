import { useState } from 'react'

interface UseCopyToClipboardProps {
  timeout?: number
}

export function useCopyToClipboard({ timeout = 2000 }: UseCopyToClipboardProps = {}) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)

      setTimeout(() => {
        setIsCopied(false)
      }, timeout)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      setIsCopied(false)
    }
  }

  return { isCopied, copyToClipboard }
}