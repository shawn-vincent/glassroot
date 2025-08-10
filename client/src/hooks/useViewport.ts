// client/src/hooks/useViewport.ts
import { useEffect, useCallback } from 'react';

export function useViewport() {
  const updateViewport = useCallback(() => {
    // Fallback for browsers without visualViewport
    const vv = window.visualViewport || {
      height: window.innerHeight,
      width: window.innerWidth,
      offsetTop: 0,
      scale: 1
    };

    // Calculate actual viewport height
    const vh = vv.height * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // Detect keyboard presence (heuristic)
    const viewportDiff = window.innerHeight - vv.height;
    const hasKeyboard = viewportDiff > 50; // Threshold for keyboard detection
    
    if (hasKeyboard) {
      document.documentElement.style.setProperty('--keyboard-height', `${viewportDiff}px`);
      document.documentElement.classList.add('keyboard-visible');
    } else {
      document.documentElement.style.setProperty('--keyboard-height', '0px');
      document.documentElement.classList.remove('keyboard-visible');
    }

    // Detect if user has zoomed
    if (vv.scale !== 1) {
      document.documentElement.classList.add('user-zoomed');
    } else {
      document.documentElement.classList.remove('user-zoomed');
    }
  }, []);

  useEffect(() => {
    // Initial setup
    updateViewport();

    // Event listeners
    const events = ['resize', 'scroll', 'orientationchange'];
    events.forEach(event => window.addEventListener(event, updateViewport));

    // Visual Viewport API events (if available)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }

    return () => {
      events.forEach(event => window.removeEventListener(event, updateViewport));
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
        window.visualViewport.removeEventListener('scroll', updateViewport);
      }
    };
  }, [updateViewport]);
}
