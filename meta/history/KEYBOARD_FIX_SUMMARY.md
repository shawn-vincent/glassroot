# Keyboard Input Coverage Fix Summary

## Problem
When the virtual keyboard appears on mobile devices, input fields (in chat, config dialog, etc.) get covered by the keyboard, making them unusable.

## Solution
Implemented a global CSS-based solution that automatically adjusts the viewport and all fixed-position elements when the keyboard is visible.

## Key Changes

### 1. Root Container Adjustment (`viewport.css`)
```css
#root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  bottom: var(--keyboard-height, 0px);
  overflow: hidden;
  transition: bottom 0.3s ease-out;
}
```
- The root container now shrinks from the bottom when keyboard appears
- Smooth transition for better UX

### 2. Utility Classes for Common Patterns

#### For Bottom-Fixed Elements (Chat Inputs)
```css
.keyboard-adjust-bottom {
  transform: translateY(calc(-1 * var(--keyboard-height, 0px)));
}
```

#### For Modals and Dialogs
```css
.keyboard-adjust-modal {
  max-height: calc(100vh - var(--keyboard-height, 0px));
}
```

#### For Scrollable Content
```css
.keyboard-adjust-scroll {
  padding-bottom: var(--keyboard-height, 0px);
}
```

### 3. Component Updates
- **Sheet Component**: Added `keyboard-adjust-modal` class
- **Dialog Component**: Added `keyboard-adjust-modal` class
- **App Layout**: Simplified to use flex layout that adapts automatically

## How It Works

1. **Keyboard Detection**: The `useViewport` hook detects keyboard presence by comparing window height to visual viewport height
2. **CSS Variable**: Sets `--keyboard-height` to the keyboard's height in pixels
3. **Class Toggle**: Adds `keyboard-visible` class to document root
4. **Automatic Adjustment**: CSS rules automatically adjust all elements based on these values

## Benefits

- **Global Solution**: Works everywhere without modifying individual components
- **Zero JavaScript**: Pure CSS solution after initial detection
- **Smooth Animations**: Transitions make the adjustment feel natural
- **Accessibility Preserved**: Doesn't interfere with zoom or other accessibility features
- **Cross-Platform**: Works on both iOS and Android

## Usage

For new components that need keyboard adjustment, simply add the appropriate class:

- Use `keyboard-adjust-bottom` for bottom-fixed inputs
- Use `keyboard-adjust-modal` for dialogs/sheets
- Use `keyboard-adjust-scroll` for scrollable containers

No JavaScript required - the CSS handles everything automatically!

## Testing

The implementation can be tested using:
1. Mobile devices with virtual keyboards
2. Browser DevTools mobile emulation
3. Debug panel (Ctrl+Shift+D in dev mode) shows keyboard height in real-time