#!/bin/bash
echo "Stopping Metro bundler if running..."
killall -9 node 2>/dev/null

echo "Clearing cache..."
rm -rf node_modules/.cache
rm -rf ios/build
rm -rf android/build
rm -rf android/.gradle

echo "Starting app with clean cache..."
npm start -- --reset-cache
