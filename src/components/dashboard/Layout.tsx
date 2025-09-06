import React from 'react';

interface CardGridProps {
  className?: string;
  children?: React.ReactNode;
}

interface DashboardContentProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * 🎯 LAYOUT PREMIUM
 * Contenedor principal del dashboard con grilla responsiva
 */
export const DashboardContent: React.FC<DashboardContentProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`app-content-area px-6 py-8 ${className}`}>
      <div className="container-fluid">
        {children}
      </div>
    </div>
  );
};

/**
 * 🎯 GRILLA DE TARJETAS
 * Sistema de grilla para organizar componentes del dashboard
 */
export const CardGrid: React.FC<CardGridProps> = ({ 
  className = "", 
  children 
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  );
};

/**
 * 🎯 SECCIÓN DE OVERVIEW
 * Contenedor para secciones grandes del dashboard
 */
export const OverviewSection: React.FC<CardGridProps> = ({ 
  className = "", 
  children 
}) => {
  return (
    <div className={`grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8 ${className}`}>
      {children}
    </div>
  );
};

/**
 * 🎯 CONTENEDOR DE PÁGINA
 * Layout principal que envuelve toda la página
 */
export const PageContainer: React.FC<DashboardContentProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`page-container min-h-screen bg-gray-50 ${className}`}>
      {children}
    </div>
  );
};

/**
 * 🎯 WRAPPER DE APLICACIÓN
 * Contenedor principal para el layout de la aplicación
 */
export const AppWrapper: React.FC<DashboardContentProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`app-wrapper d-flex ${className}`}>
      {children}
    </div>
  );
};
