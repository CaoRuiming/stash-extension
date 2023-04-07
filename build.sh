#!/bin/bash

if [ ! -d "node_modules" ]; then
    echo "Installing dependenies..."
    npm ci --only=production
fi

echo "Running build"
npx tsc

rm -f extension/manifest.json
if [[ "$1" == "firefox" ]]; then
    echo "Building for Firefox"
    cp src/manifest/firefox-manifest.json extension/manifest.json
else
    cp src/manifest/chrome-manifest.json extension/manifest.json
fi
