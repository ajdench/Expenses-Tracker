#!/bin/bash

ENV=$1

INDEX_FILE="index.html"

if [ "$ENV" == "deploy" ]; then
  echo "Preparing for GitHub Pages deployment..."
  # Add base tag for GitHub Pages subpath
  sed -i '' 's|<meta name="viewport" content="width=device-width, initial-scale=1.0" />|<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <base href="/Expenses-Tracker/">|g' "$INDEX_FILE"
  # Adjust favicon path for base tag
  sed -i '' 's|<link rel="icon" type="image/png" href="/favicon.png">|<link rel="icon" type="image/png" href="favicon.png">|g' "$INDEX_FILE"
elif [ "$ENV" == "local" ]; then
  echo "Preparing for local development..."
  # Remove base tag
  sed -i '' '/<base href="\/Expenses-Tracker\/">/d' "$INDEX_FILE"
  # Revert favicon path
  sed -i '' 's|<link rel="icon" type="image/png" href="favicon.png">|<link rel="icon" type="image/png" href="/favicon.png">|g' "$INDEX_FILE"
else
  echo "Usage: ./build.sh [local|deploy]"
  exit 1
fi

echo "Build script finished for $ENV environment."

