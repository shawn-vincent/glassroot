import { useEffect } from 'react';
import { Keyboard } from '@capacitor/keyboard';

export function useCapacitorKeyboard() {
  useEffect(() => {
    const updateViewportHeight = (keyboardHeight: number) => {
      const availableHeight = window.innerHeight - keyboardHeight;
      
      // Set one CSS variable that everything can use
      document.documentElement.style.setProperty('--viewport-height', `${availableHeight}px`);
    };

    // Set initial height
    updateViewportHeight(0);

    // iOS events
    Keyboard.addListener('keyboardWillShow', (info) => {
      updateViewportHeight(info.keyboardHeight);
    });

    Keyboard.addListener('keyboardWillHide', () => {
      updateViewportHeight(0);
    });

    // Android events
    Keyboard.addListener('keyboardDidShow', (info) => {
      updateViewportHeight(info.keyboardHeight);
    });

    Keyboard.addListener('keyboardDidHide', () => {
      updateViewportHeight(0);
    });

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      updateViewportHeight(0);
    });
    
    return () => {
      window.removeEventListener('orientationchange', () => {
        updateViewportHeight(0);
      });
    };
  }, []);
}