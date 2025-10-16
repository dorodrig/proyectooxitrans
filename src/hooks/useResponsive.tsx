import { useState, useEffect } from 'react';

interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
}

/**
 * 📱 Hook para manejo de responsividad
 * Breakpoints: mobile (<768px), tablet (768px-1024px), desktop (>1024px)
 */
export const useResponsive = (): UseResponsiveReturn => {
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth
  };
};

/**
 * 🎨 Estilos responsive para el layout principal
 */
export const getResponsiveLayoutStyles = (isMobile: boolean) => ({
  mainContent: {
    marginLeft: isMobile ? 0 : '16rem',
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
    transition: 'margin-left 0.3s ease-in-out'
  },
  
  pageContent: {
    padding: isMobile ? '1rem' : '1.5rem',
    minHeight: 'calc(100vh - 70px)',
    backgroundColor: '#f8fafc'
  }
});