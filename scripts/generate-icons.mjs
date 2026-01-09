// Script to convert SVG icons to PNG for Capacitor
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Read SVG files
const iconSvg = readFileSync(join(rootDir, 'assets/icon.svg'), 'utf8');
const splashSvg = readFileSync(join(rootDir, 'assets/splash.svg'), 'utf8');

// Ensure assets directory exists
if (!existsSync(join(rootDir, 'assets'))) {
  mkdirSync(join(rootDir, 'assets'));
}

// Convert SVG to PNG at specified size
function svgToPng(svg, width, height = width) {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

// Generate icon PNGs
console.log('Generating icon.png (1024x1024)...');
const iconPng = svgToPng(iconSvg, 1024);
writeFileSync(join(rootDir, 'assets/icon.png'), iconPng);

// For Android adaptive icons, we need icon-foreground and icon-background
// Let's create a simple foreground (just the card) and background (solid color)
console.log('Generating icon-foreground.png...');
const foregroundPng = svgToPng(iconSvg, 1024);
writeFileSync(join(rootDir, 'assets/icon-foreground.png'), foregroundPng);

// Create a solid green background for Android adaptive icons
const backgroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#1a472a"/>
</svg>`;
console.log('Generating icon-background.png...');
const backgroundPng = svgToPng(backgroundSvg, 1024);
writeFileSync(join(rootDir, 'assets/icon-background.png'), backgroundPng);

// Generate splash PNG
console.log('Generating splash.png (2732x2732)...');
const splashPng = svgToPng(splashSvg, 2732);
writeFileSync(join(rootDir, 'assets/splash.png'), splashPng);

// Create dark mode splash (same as regular for now, dark themed)
console.log('Generating splash-dark.png...');
writeFileSync(join(rootDir, 'assets/splash-dark.png'), splashPng);

console.log('Done! Generated all icon and splash assets.');
console.log('\nNow run: npx @capacitor/assets generate');
