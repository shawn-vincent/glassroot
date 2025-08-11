import { useEffect } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

export function useCapacitorKeyboard() {
  useEffect(() => {
    // Skip Capacitor keyboard handling on web
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    
    let currentKeyboardHeight = 0;
    
    const updateViewportHeight = (keyboardHeight: number) => {
      currentKeyboardHeight = keyboardHeight;
      const availableHeight = window.innerHeight - keyboardHeight;
      
      // Set CSS variables for viewport and safe area
      document.documentElement.style.setProperty('--viewport-height', `${availableHeight}px`);
      
      // When keyboard is visible, ignore bottom safe area (set to 0)
      // When keyboard is hidden, use the actual safe area
      if (keyboardHeight > 0) {
        document.documentElement.style.setProperty('--bottom-safe-area', '0px');
      } else {
        document.documentElement.style.setProperty('--bottom-safe-area', 'env(safe-area-inset-bottom)');
      }
    };
    
    // Ensure element is visible above keyboard
    const scrollIntoViewIfNeeded = (element: Element) => {
      if (!element || currentKeyboardHeight === 0) return;
      
      // Small delay to let keyboard animation start
      setTimeout(() => {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight - currentKeyboardHeight;
        
        // Check if element is below the visible area (keyboard covering it)
        if (rect.bottom > viewportHeight) {
          // Find the scrollable container
          let scrollContainer = element.parentElement;
          while (scrollContainer) {
            const style = getComputedStyle(scrollContainer);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll' || 
                scrollContainer.classList.contains('overflow-y-auto')) {
              break;
            }
            scrollContainer = scrollContainer.parentElement;
          }
          
          if (scrollContainer) {
            // Calculate how much to scroll
            const scrollAmount = rect.bottom - viewportHeight + 20; // 20px padding
            scrollContainer.scrollTop += scrollAmount;
          } else {
            // Fallback to scrollIntoView
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }, 100);
    };
    
    // Handle focus events
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        scrollIntoViewIfNeeded(target);
      }
    };
    
    // Handle input/selection changes to keep cursor visible
    const handleInputChange = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        scrollIntoViewIfNeeded(target);
      }
    };

    // Set initial height
    updateViewportHeight(0);

    // iOS events
    Keyboard.addListener('keyboardWillShow', (info) => {
      updateViewportHeight(info.keyboardHeight);
      // Scroll focused element into view after keyboard shows
      const activeElement = document.activeElement;
      if (activeElement) {
        scrollIntoViewIfNeeded(activeElement);
      }
    });

    Keyboard.addListener('keyboardWillHide', () => {
      updateViewportHeight(0);
    });

    // Android events
    Keyboard.addListener('keyboardDidShow', (info) => {
      updateViewportHeight(info.keyboardHeight);
      // Scroll focused element into view after keyboard shows
      const activeElement = document.activeElement;
      if (activeElement) {
        scrollIntoViewIfNeeded(activeElement);
      }
    });

    Keyboard.addListener('keyboardDidHide', () => {
      updateViewportHeight(0);
    });

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      updateViewportHeight(0);
    });
    
    // Add focus and input event listeners
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('input', handleInputChange);
    document.addEventListener('selectionchange', handleInputChange);
    
    return () => {
      window.removeEventListener('orientationchange', () => {
        updateViewportHeight(0);
      });
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('input', handleInputChange);
      document.removeEventListener('selectionchange', handleInputChange);
    };
  }, []);
}