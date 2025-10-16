#!/bin/bash

# Script para hacer responsive todas las páginas que usan SidebarNew
# Este script actualiza las páginas que tienen el patrón: marginLeft: '16rem'

# Páginas a actualizar
PAGES=(
  "src/pages/AlertasPage.tsx"
  "src/pages/ConfiguracionPage.tsx" 
  "src/pages/LogsPage.tsx"
  "src/pages/ReportesPage.tsx"
  "src/pages/VisitantesPage.tsx"
)

for page in "${PAGES[@]}"; do
  echo "Actualizando $page..."
  
  # 1. Agregar import del hook responsive
  sed -i '/import.*useAuthStore/a import { useResponsive, getResponsiveLayoutStyles } from '\''../hooks/useResponsive'\'';' "$page"
  
  # 2. Agregar hook en el componente
  sed -i '/const \[sidebarOpen/a \ \ const { isMobile } = useResponsive();' "$page"
  
  # 3. Agregar layoutStyles
  sed -i '/const toggleSidebar/a \ \ const layoutStyles = getResponsiveLayoutStyles(isMobile);' "$page"
  
  # 4. Reemplazar marginLeft fijo con responsive
  sed -i "s/marginLeft: '16rem',/...layoutStyles.mainContent,/" "$page"
  
  # 5. Reemplazar padding fijo con responsive (si existe)
  sed -i "/padding: '1\.5rem',/,+2c\\
        <div style={layoutStyles.pageContent}>" "$page"
  
  echo "✅ $page actualizado"
done

echo "🎉 Todas las páginas han sido actualizadas para ser responsive"