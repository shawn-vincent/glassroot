# iPhone Deployment Guide

## Quick Deploy

To deploy to your iPhone named "Shawn's iPhone":

```bash
npm --workspace client run dev:shawniphone
```

## Prerequisites

1. **Xcode** installed and configured
2. **Apple Developer Account** (free or paid)
3. **iPhone connected** via USB or available as simulator
4. **Device name** containing "Shawn" (for auto-detection)

## Setup Steps

### 1. First Time Setup

Open the iOS project in Xcode:
```bash
npm --workspace client run open:ios
```

In Xcode:
1. Select your development team in Signing & Capabilities
2. Trust your development certificate on the iPhone (Settings > General > Device Management)

### 2. Deploy to Physical Device

Connect your iPhone via USB and run:
```bash
npm --workspace client run dev:shawniphone
```

The script will:
1. Build the React app
2. Sync with Capacitor iOS project
3. Auto-detect your iPhone (looks for "Shawn" in device name)
4. Deploy and launch the app

### 3. Alternative Commands

```bash
# Open in Xcode for manual deployment
npm --workspace client run open:ios

# Deploy to any iOS device/simulator
npm --workspace client run dev:ios

# Just build and sync (no deploy)
npm --workspace client run build:ios
```

## Troubleshooting

### Device Not Found
If the script can't find your device:
1. Check device is connected: `xcrun devicectl list devices`
2. Rename device to include "Shawn" in Settings > General > About > Name
3. Or manually specify device ID in the deploy script

### Build Failures
1. Clean build: `rm -rf client/ios/App/build`
2. Re-sync: `npm --workspace client run sync`
3. Check Xcode for signing issues

### Certificate Issues
1. Open Xcode and check Signing & Capabilities
2. Ensure developer certificate is trusted on device
3. May need to delete app and reinstall

## Custom Device Names

To deploy to a different device, edit `client/scripts/deploy-iphone.sh` and change the grep pattern from "Shawn" to your device name.