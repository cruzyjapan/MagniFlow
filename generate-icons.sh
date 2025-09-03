#!/bin/bash

# Generate icons from SVG favicon
# Requires ImageMagick or similar tool

echo "Generating icons from favicon.svg..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it first:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    echo "  Windows: Download from https://imagemagick.org/script/download.php"
    exit 1
fi

# Generate PNG icons from SVG
convert -background transparent -resize 192x192 public/favicon.svg public/icon-192.png
convert -background transparent -resize 512x512 public/favicon.svg public/icon-512.png
convert -background transparent -resize 180x180 public/favicon.svg public/apple-touch-icon.png

# Generate favicon.ico with multiple sizes
convert -background transparent public/favicon.svg -resize 16x16 -gravity center -extent 16x16 public/favicon-16.png
convert -background transparent public/favicon.svg -resize 32x32 -gravity center -extent 32x32 public/favicon-32.png
convert -background transparent public/favicon.svg -resize 48x48 -gravity center -extent 48x48 public/favicon-48.png

# Combine into ico file
convert public/favicon-16.png public/favicon-32.png public/favicon-48.png public/favicon.ico

# Clean up temporary files
rm public/favicon-16.png public/favicon-32.png public/favicon-48.png

echo "Icons generated successfully!"