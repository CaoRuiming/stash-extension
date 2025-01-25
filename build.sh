#!/bin/bash

if [ ! -d "node_modules" ]; then
    echo "Installing dependenies..."
    npm ci --only=production
fi

echo "Running build"
npx tsc

rm -f extension/manifest.json
if [[ "$1" == "firefox" ]]; then
    cp src/manifest/firefox-manifest.json extension/manifest.json
    cd extension ; zip -r ../stash-extension.firefox.xpi *
    echo "Firefox build complete"
else
    cp src/manifest/chrome-manifest.json extension/manifest.json
    cd extension ; zip -r ../stash-extension.chrome.zip *
    echo "Chrome build complete"
fi
