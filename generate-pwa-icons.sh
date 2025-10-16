#!/bin/bash

# Crear iconos PWA a partir del logo SVG existente
# Usando ImageMagick para generar los iconos

echo "Generando iconos PWA..."

# Crear directorio para iconos temporales
mkdir -p public/icons

# Convertir SVG a PNG 192x192 (usando rsvg-convert si está disponible, sino usar convert de ImageMagick)
if command -v rsvg-convert >/dev/null 2>&1; then
    echo "Usando rsvg-convert..."
    rsvg-convert -w 192 -h 192 public/assets/images/logo-dark.svg -o public/pwa-192x192.png
    rsvg-convert -w 512 -h 512 public/assets/images/logo-dark.svg -o public/pwa-512x512.png
elif command -v convert >/dev/null 2>&1; then
    echo "Usando ImageMagick convert..."
    convert -background transparent -size 192x192 public/assets/images/logo-dark.svg public/pwa-192x192.png
    convert -background transparent -size 512x512 public/assets/images/logo-dark.svg public/pwa-512x512.png
else
    echo "Ni rsvg-convert ni ImageMagick están disponibles. Creando iconos de fallback..."
fi

echo "Iconos PWA generados exitosamente!"