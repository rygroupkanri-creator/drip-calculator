/**
 * Icon Generator Script
 *
 * This script generates PWA icons from an SVG source.
 *
 * To use:
 * 1. Install dependencies: npm install sharp
 * 2. Place your icon.svg in the /public directory
 * 3. Run: node scripts/generate-icons.js
 *
 * Alternatively, you can use online tools like:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 *
 * Upload your icon and download the generated icons to /public
 */

const fs = require('fs');
const path = require('path');

console.log('PWA Icon Generator');
console.log('==================\n');
console.log('To generate PWA icons, please use one of these methods:\n');
console.log('Method 1: Using sharp (recommended for developers)');
console.log('  1. npm install sharp');
console.log('  2. Place your 512x512 icon.png in /public');
console.log('  3. Run this script with sharp code\n');
console.log('Method 2: Using online tools (easiest)');
console.log('  1. Visit https://www.pwabuilder.com/imageGenerator');
console.log('  2. Upload your icon (minimum 512x512px)');
console.log('  3. Download generated icons to /public\n');
console.log('Method 3: Using Figma/Photoshop');
console.log('  1. Design your icon');
console.log('  2. Export at sizes: 72, 96, 128, 144, 152, 192, 384, 512px');
console.log('  3. Save to /public with naming: icon-{size}.png\n');

// Create a simple placeholder SVG if none exists
const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563eb"/>
  <g transform="translate(256, 256)">
    <!-- Droplet Icon -->
    <path d="M 0,-120 C -40,-80 -80,-40 -80,20 C -80,75 -45,110 0,110 C 45,110 80,75 80,20 C 80,-40 40,-80 0,-120 Z"
          fill="#ffffff" stroke="#ffffff" stroke-width="8"/>
    <!-- Inner droplet -->
    <ellipse cx="0" cy="20" rx="35" ry="45" fill="#93c5fd"/>
  </g>
</svg>
`;

const svgPath = path.join(__dirname, '../public/icon.svg');
if (!fs.existsSync(svgPath)) {
  fs.writeFileSync(svgPath, svgContent.trim());
  console.log('✓ Created placeholder icon.svg in /public');
  console.log('  You can replace this with your custom icon design\n');
}

console.log('Icon generation setup complete!');
console.log('Run the appropriate method above to generate your PWA icons.');
