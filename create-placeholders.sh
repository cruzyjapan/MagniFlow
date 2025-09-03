#!/bin/bash

# プレースホルダー画像生成スクリプト
# 実際のスクリーンショットの代わりに使用できる画像を生成

echo "Creating placeholder images for screenshots..."

# screenshots ディレクトリ作成
mkdir -p screenshots

# Node.jsを使用してプレースホルダー画像を生成
cat > generate-placeholders.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Simple SVG placeholder generator
function createPlaceholderSVG(title, width = 1920, height = 1080) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#f3f4f6"/>
  <rect x="20" y="20" width="${width-40}" height="${height-40}" fill="white" stroke="#d1d5db" stroke-width="2"/>
  <text x="${width/2}" y="${height/2}" font-family="Arial, sans-serif" font-size="48" fill="#6b7280" text-anchor="middle">
    ${title}
  </text>
  <text x="${width/2}" y="${height/2 + 60}" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af" text-anchor="middle">
    Placeholder Image
  </text>
</svg>`;
}

// Create placeholder images
const placeholders = [
  { name: 'dashboard.png', title: 'MagniFlow Dashboard' },
  { name: 'signin.png', title: 'Sign In Page' },
  { name: 'settings.png', title: 'Settings Modal' },
  { name: 'advanced-search.png', title: 'Advanced Search Settings' }
];

// Note: This creates SVG files. To convert to PNG, you'll need a tool like ImageMagick
placeholders.forEach(({ name, title }) => {
  const svgContent = createPlaceholderSVG(title);
  const svgName = name.replace('.png', '.svg');
  fs.writeFileSync(path.join('screenshots', svgName), svgContent);
  console.log(`Created: screenshots/${svgName}`);
});

console.log('\nPlaceholder SVG files created successfully!');
console.log('To convert to PNG, you can use online tools or install ImageMagick:');
console.log('  Ubuntu/Debian: sudo apt-get install imagemagick');
console.log('  Mac: brew install imagemagick');
console.log('  Then run: for f in screenshots/*.svg; do convert "$f" "${f%.svg}.png"; done');
EOF

# Node.jsが利用可能か確認
if command -v node &> /dev/null; then
    node generate-placeholders.js
    rm generate-placeholders.js
else
    echo "Node.js is not installed. Creating text file placeholders instead..."
    
    # テキストファイルでプレースホルダーを作成
    echo "Dashboard Screenshot Placeholder" > screenshots/dashboard.txt
    echo "Sign In Screenshot Placeholder" > screenshots/signin.txt
    echo "Settings Screenshot Placeholder" > screenshots/settings.txt
    echo "Advanced Search Screenshot Placeholder" > screenshots/advanced-search.txt
    
    echo "Created text placeholders in screenshots/"
    echo "Please replace with actual screenshots or use an image editor to create PNG files."
fi

echo "Done!"