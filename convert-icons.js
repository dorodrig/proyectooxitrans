import fs from 'fs/promises';
import { Resvg } from '@resvg/resvg-js';

// SVG template mejorado para iconos PWA
const createIconSVG = (size, text = 'OXITRANS') => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#006445"/>
      <stop offset="100%" stop-color="#00ac76"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="url(#gradient)"/>
  <circle cx="${size/2}" cy="${size/2 - size*0.1}" r="${size * 0.12}" fill="white" opacity="0.9"/>
  <text x="50%" y="65%" text-anchor="middle" dominant-baseline="central" 
        fill="white" font-family="Arial, sans-serif" font-weight="bold" 
        font-size="${size * 0.12}">OX</text>
</svg>`;

async function convertSVGToPNG() {
  try {
    console.log('Convirtiendo SVG a PNG...');
    
    // Generar iconos 192x192
    const svg192 = createIconSVG(192);
    const resvg192 = new Resvg(svg192);
    const pngData192 = resvg192.render();
    const pngBuffer192 = pngData192.asPng();
    await fs.writeFile('public/pwa-192x192.png', pngBuffer192);
    
    // Generar iconos 512x512
    const svg512 = createIconSVG(512);
    const resvg512 = new Resvg(svg512);
    const pngData512 = resvg512.render();
    const pngBuffer512 = pngData512.asPng();
    await fs.writeFile('public/pwa-512x512.png', pngBuffer512);
    
    // Favicon
    const svgFavicon = createIconSVG(32);
    const resvgFavicon = new Resvg(svgFavicon);
    const pngDataFavicon = resvgFavicon.render();
    const pngBufferFavicon = pngDataFavicon.asPng();
    await fs.writeFile('public/favicon.png', pngBufferFavicon);
    
    // Apple touch icon
    const svgApple = createIconSVG(180);
    const resvgApple = new Resvg(svgApple);
    const pngDataApple = resvgApple.render();
    const pngBufferApple = pngDataApple.asPng();
    await fs.writeFile('public/apple-touch-icon.png', pngBufferApple);
    
    console.log('✅ Iconos PWA generados exitosamente:');
    console.log('- pwa-192x192.png');
    console.log('- pwa-512x512.png');
    console.log('- favicon.png');
    console.log('- apple-touch-icon.png');
    
  } catch (error) {
    console.error('Error convirtiendo SVG a PNG:', error);
  }
}

convertSVGToPNG();