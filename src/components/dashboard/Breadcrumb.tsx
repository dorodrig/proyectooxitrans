import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * 🎯 BREADCRUMB NAVIGATION
 * Navegación de ruta actual con estilo premium
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  return (
    <nav className={`breadcrumb-nav ${className}`} aria-label="breadcrumb">
      <ol className="breadcrumb flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item flex items-center">
            {item.href && !item.active ? (
              <a 
                href={item.href}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className={item.active ? "text-gray-500" : "text-gray-800"}>
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <i className="icon-chevron-right mx-2 text-gray-400"></i>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
