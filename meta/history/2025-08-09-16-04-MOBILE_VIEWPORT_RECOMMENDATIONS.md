# Mobile Viewport Technical Recommendations for Glassroot

## Executive Summary

Based on the analysis of current implementation and known mobile viewport issues, this document provides specific, actionable recommendations for achieving optimal cross-platform mobile performance in the Glassroot application.

## Current State Assessment

### What's Working Well
- Basic viewport meta tag with `viewport-fit=cover` for notch support
- Fixed positioning strategy to prevent viewport bounce
- Safe area CSS utilities (`pt-safe`, `pb-safe`, etc.)
- Input font-size set to 16px to prevent iOS zoom
- Overflow behavior controls (`overscroll-behavior: none`)

### Identified Gaps
- No Visual Viewport API implementation for keyboard handling
- Missing dynamic viewport height calculations
- No keyboard-aware layout adjustments
- Lack of platform-specific handling (iOS vs Android)
- No monitoring for viewport state changes

## Recommended Implementation Strategy

### 1. Enhanced Viewport Meta Tag
**Current:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

**Recommended:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-visual" />
```

**Rationale:**
- Remove `maximum-scale=1.0` and `user-scalable=no` for accessibility
- Add `interactive-widget=resizes-visual` for better keyboard handling (experimental but forward-compatible)
- Prevent zoom through CSS `touch-action` instead

### 2. CSS Architecture Improvements

**Create a dedicated viewport management layer:**

```css
/* client/src/styles/viewport.css */
@layer viewport {
  /* Dynamic viewport height with fallbacks */
  :root {
    --vh: 1vh;
    --keyboard-height: 0px;
    --safe-top: env(safe-area-inset-top);
    --safe-bottom: env(safe-area-inset-bottom);
    --safe-left: env(safe-area-inset-left);
    --safe-right: env(safe-area-inset-right);
  }

  /* Use modern viewport units with fallbacks */
  html {
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height */
    position: fixed;
    width: 100%;
  }

  body {
    height: 100%;
    margin: 0;
    overflow: hidden;
    overscroll-behavior: none;
    /* Prevent all zooming through touch-action */
    touch-action: pan-x pan-y;
  }

  /* App container with keyboard awareness */
  #root {
    height: 100%;
    height: calc(100dvh - var(--keyboard-height));
    overflow: hidden;
    position: relative;
  }

  /* Allow pinch-zoom only on specific content */
  .zoomable {
    touch-action: pinch-zoom;
  }

  /* Ensure inputs don't trigger zoom */
  input, textarea, select, button {
    touch-action: manipulation;
  }

  /* Scrollable containers */
  .scrollable {
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
}
```

### 3. Visual Viewport API Implementation

**Create a React hook for viewport management:**

```typescript
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
```

### 4. Platform-Specific Handling

**Implement platform detection and conditional fixes:**

```typescript
// client/src/utils/platform.ts
export const platform = {
  isIOS: /iPhone|iPad|iPod/.test(navigator.userAgent),
  isAndroid: /Android/.test(navigator.userAgent),
  isCapacitor: typeof window !== 'undefined' && window.Capacitor !== undefined,
  isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
  
  // Detect standalone mode (PWA)
  isStandalone: window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true
};

// Apply platform-specific classes
export function applyPlatformClasses() {
  const classes = [];
  if (platform.isIOS) classes.push('ios');
  if (platform.isAndroid) classes.push('android');
  if (platform.isCapacitor) classes.push('capacitor');
  if (platform.isSafari) classes.push('safari');
  if (platform.isStandalone) classes.push('standalone');
  
  document.documentElement.classList.add(...classes);
}
```

### 5. Input Focus Management

**Implement smart input focus handling:**

```typescript
// client/src/hooks/useInputFocus.ts
import { useEffect } from 'react';
import { platform } from '@/utils/platform';

export function useInputFocus() {
  useEffect(() => {
    if (!platform.isIOS) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('input, textarea')) {
        // Ensure input is visible when keyboard appears
        setTimeout(() => {
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 300); // Delay for keyboard animation
      }
    };

    const handleBlur = () => {
      // Reset scroll position on iOS to prevent stuck viewport
      if (platform.isIOS) {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);
}
```

### 6. App.tsx Integration

**Update the main App component:**

```typescript
// client/src/App.tsx
import { useViewport } from '@/hooks/useViewport';
import { useInputFocus } from '@/hooks/useInputFocus';
import { applyPlatformClasses } from '@/utils/platform';
import { useEffect } from 'react';

export default function App() {
  // Existing code...
  
  // Add viewport management
  useViewport();
  useInputFocus();
  
  useEffect(() => {
    applyPlatformClasses();
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden fixed inset-0">
      {/* Rest of component */}
    </div>
  );
}
```

### 7. Capacitor-Specific Configuration

**Update Capacitor config for optimal viewport behavior:**

```json
// capacitor.config.json
{
  "ios": {
    "contentInset": "automatic",
    "scrollEnabled": false,
    "allowsLinkPreview": false
  },
  "android": {
    "allowMixedContent": false,
    "captureInput": false
  }
}
```

**Add keyboard plugin for better control:**

```bash
npm install @capacitor/keyboard
```

```typescript
// client/src/utils/keyboard.ts
import { Keyboard } from '@capacitor/keyboard';
import { platform } from './platform';

export async function setupKeyboard() {
  if (!platform.isCapacitor) return;

  // Prevent scroll on keyboard show
  await Keyboard.setScroll({ isDisabled: true });

  // Keep webview in place
  await Keyboard.setResizeMode({ mode: 'none' });

  // Listen to keyboard events
  Keyboard.addListener('keyboardWillShow', info => {
    document.documentElement.style.setProperty(
      '--keyboard-height', 
      `${info.keyboardHeight}px`
    );
  });

  Keyboard.addListener('keyboardWillHide', () => {
    document.documentElement.style.setProperty('--keyboard-height', '0px');
  });
}
```

### 8. Testing Checklist

**Essential tests to perform after implementation:**

- [ ] **Input Focus**: No unwanted zoom on any input field
- [ ] **Keyboard Appearance**: Content adjusts properly, header stays visible
- [ ] **Scrolling**: Only designated areas scroll, no viewport bounce
- [ ] **Safe Areas**: Content respects device notches/islands
- [ ] **Orientation**: Landscape/portrait transitions work smoothly
- [ ] **Platform Parity**: Behavior consistent across iOS/Android
- [ ] **Accessibility**: Pinch-zoom works where appropriate
- [ ] **Performance**: No janky animations or scroll lag

### 9. Monitoring and Debugging

**Add viewport debugging tools:**

```typescript
// client/src/utils/debug.ts
export function enableViewportDebug() {
  if (process.env.NODE_ENV !== 'development') return;

  const debugPanel = document.createElement('div');
  debugPanel.id = 'viewport-debug';
  debugPanel.style.cssText = `
    position: fixed;
    bottom: 10px;
    left: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    font-size: 12px;
    z-index: 9999;
    pointer-events: none;
  `;

  const update = () => {
    const vv = window.visualViewport || { height: window.innerHeight, width: window.innerWidth };
    debugPanel.innerHTML = `
      Window: ${window.innerWidth}×${window.innerHeight}<br>
      Visual: ${Math.round(vv.width)}×${Math.round(vv.height)}<br>
      Scale: ${vv.scale?.toFixed(2) || '1.00'}<br>
      Keyboard: ${document.documentElement.classList.contains('keyboard-visible') ? 'Yes' : 'No'}
    `;
  };

  document.body.appendChild(debugPanel);
  setInterval(update, 100);
}
```

## Implementation Priority

### Phase 1: Core Fixes (Immediate)
1. Update viewport meta tag
2. Implement Visual Viewport API hook
3. Add platform detection utilities
4. Update CSS with modern viewport units

### Phase 2: Enhanced UX (Week 1)
1. Implement input focus management
2. Add keyboard detection and handling
3. Platform-specific CSS adjustments
4. Testing on real devices

### Phase 3: Polish (Week 2)
1. Add Capacitor keyboard plugin
2. Implement debugging tools
3. Performance optimization
4. Documentation updates

## Key Principles

1. **Progressive Enhancement**: Start with basic functionality, enhance for modern browsers
2. **Accessibility First**: Never completely disable zoom; use CSS touch-action instead
3. **Platform Awareness**: Detect and handle iOS/Android differences explicitly
4. **Modern Standards**: Use new viewport units (dvh, svh) with fallbacks
5. **Test on Real Devices**: Simulators don't capture all viewport quirks

## Maintenance Notes

- Review viewport behavior with each iOS/Android major release
- Monitor browser compatibility for experimental features
- Keep Capacitor plugins updated for native viewport fixes
- Document any platform-specific workarounds clearly

## Conclusion

These recommendations provide a robust, maintainable solution for mobile viewport issues while preserving accessibility and cross-platform compatibility. The phased approach allows for incremental implementation with immediate benefits from Phase 1 changes.

The key insight is to embrace modern standards (Visual Viewport API, new CSS units) while maintaining fallbacks for older browsers, and to handle platform differences explicitly rather than hoping for universal solutions.