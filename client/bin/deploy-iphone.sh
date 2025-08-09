#!/bin/bash

# Deploy to Shawn's iPhone
# This script builds the app and deploys it to a connected iPhone

set -e

echo "🏗️  Building client app..."
npm run build

echo "📱 Syncing with iOS project..."
npx cap sync ios

echo "🔍 Looking for connected devices..."

# Check for physical devices with "Shawn" in name using xctrace (which shows the actual UDID)
DEVICE_ID=$(xcrun xctrace list devices 2>/dev/null | grep -i "Shawn" | grep -oE '[0-9A-F]{8}-[0-9A-F]{16}' | head -1)

if [ -z "$DEVICE_ID" ]; then
    echo "📱 No physical device with 'Shawn' found, checking simulators..."
    DEVICE_ID=$(xcrun simctl list devices available | grep -E "iPhone.*Shawn" | head -1 | grep -oE '[A-F0-9-]{36}')
fi

if [ -z "$DEVICE_ID" ]; then
    echo "❌ No device found with 'Shawn' in the name"
    echo ""
    echo "Available physical devices:"
    xcrun devicectl list devices 2>/dev/null || echo "No physical devices connected"
    echo ""
    echo "Available simulators:"
    xcrun simctl list devices available | grep iPhone
    echo ""
    echo "Make sure your iPhone is:"
    echo "  1. Connected via USB"
    echo "  2. Unlocked"
    echo "  3. Trusts this computer"
    echo "  4. Has Developer Mode enabled (Settings > Privacy & Security > Developer Mode)"
    exit 1
fi

echo "✅ Found device: $DEVICE_ID"

# Check if it's a physical device (format: XXXXXXXX-XXXXXXXXXXXXXXXX)
if [[ "$DEVICE_ID" =~ ^[0-9A-F]{8}-[0-9A-F]{16}$ ]]; then
    echo "📱 Physical device detected, using xcodebuild..."
    
    cd ios/App
    
    # Build and install using xcodebuild
    xcodebuild -workspace App.xcworkspace \
               -scheme App \
               -destination "id=$DEVICE_ID" \
               -configuration Debug \
               -derivedDataPath build \
               clean build
    
    # Install and run the app
    xcrun devicectl device install app --device "$DEVICE_ID" build/Build/Products/Debug-iphoneos/App.app
    xcrun devicectl device process launch --device "$DEVICE_ID" com.glassroot.app
    
    cd ../..
    echo "✨ Deployment complete!"
else
    echo "🚀 Deploying to simulator..."
    npx cap run ios --target "$DEVICE_ID"
    echo "✨ Deployment complete!"
fi