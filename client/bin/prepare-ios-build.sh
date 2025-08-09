#!/bin/bash

# Prepare iOS build environment
# This script handles common iOS build issues including the Xcode build directory permissions

echo "Preparing iOS build environment..."

# Check if ios/App/build directory exists
if [ -d "ios/App/build" ]; then
    echo "Setting Xcode build directory permissions..."
    xattr -w com.apple.xcode.CreatedByBuildSystem true ios/App/build 2>/dev/null || true
fi

# Clean any existing build artifacts
if [ -d "ios/App/build" ]; then
    echo "Cleaning build directory..."
    rm -rf ios/App/build
fi

# Create build directory with proper attributes
mkdir -p ios/App/build
xattr -w com.apple.xcode.CreatedByBuildSystem true ios/App/build

echo "iOS build environment ready!"