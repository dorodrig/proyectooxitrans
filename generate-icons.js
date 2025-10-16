// Generar iconos PWA básicos a partir del logo existente
// Este script genera iconos simples para PWA

import fs from 'fs/promises';
import path from 'path';

// SVG template básico para iconos PWA
const createIconSVG = (size, text = 'OX') => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#006445"/>
      <stop offset="100%" stop-color="#00ac76"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="url(#gradient)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" 
        fill="white" font-family="Arial, sans-serif" font-weight="bold" 
        font-size="${size * 0.25}">${text}</text>
</svg>`;

async function generatePWAIcons() {
  try {
    console.log('Generando iconos PWA...');
    
    // Crear iconos SVG temporales
    const icon192 = createIconSVG(192, 'OX');
    const icon512 = createIconSVG(512, 'OX');
    
    // Guardar SVGs temporales
    await fs.writeFile('public/temp-192.svg', icon192);
    await fs.writeFile('public/temp-512.svg', icon512);
    
    console.log('Iconos SVG temporales creados');
    console.log('Para convertir a PNG, ejecuta:');
    console.log('- npx svg2png-wasm public/temp-192.svg public/pwa-192x192.png');
    console.log('- npx svg2png-wasm public/temp-512.svg public/pwa-512x512.png');
    
    // También crear favicon.ico básico
    const faviconSVG = createIconSVG(32, 'OX');
    await fs.writeFile('public/favicon.svg', faviconSVG);
    
    console.log('Favicon SVG creado exitosamente');
    
  } catch (error) {
    console.error('Error generando iconos:', error);
  }
}

generatePWAIcons();