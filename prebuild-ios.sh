#!/bin/bash
set -e
echo "--- RUNNING prebuild-ios.sh for pre-install hook ---"
node ./scripts/write-google-plist.js
echo "--- prebuild-ios.sh for pre-install hook FINISHED ---"
