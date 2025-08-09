import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.glassroot.app',
  appName: 'Glassroot',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    scrollEnabled: false,
    allowsLinkPreview: false,
    overrideUserAgent: 'Glassroot iOS App',
    limitsNavigationsToAppBoundDomains: true,
    preferredContentMode: 'mobile'
  },
  android: {
    allowMixedContent: false,
    captureInput: false,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    Keyboard: {
      resize: 'none',
      resizeOnFullScreen: true
    }
  }
};

export default config;
