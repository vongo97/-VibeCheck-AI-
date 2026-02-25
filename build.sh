#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
cd server && npm install
cd ..

# Install Chrome for Puppeteer
# Note: Render provides a pre-installed version in some environments, 
# but this ensures dependencies are met.
if [ ! -d "./cache" ]; then
  mkdir ./cache
fi

# Store the browser in a cache folder to avoid re-downloading
export PUPPETEER_CACHE_DIR=$(pwd)/cache

# Install dependencies for Puppeteer
# In Render, we often need to use a Dockerfile for better control, 
# but for Web Services, we can try to install Chromium via npm.
