import React, { type ReactNode } from 'react';
import '../styles/components/_forms.scss';

interface ResponsiveFormProps {
  children: ReactNode;
  variant?: 'default' | 'horizontal' | 'grid' | 'modal';
  onSubmit?: (e: React.FormEvent) => void;
  loading?: boolean;
  className?: string;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      disabled?: boolean;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
    danger?: {
      label: string;
      onClick: () => void;
    };
  };
}

/**
 * 📝 FORMULARIO RESPONSIVE WRAPPER
 * Componente que envuelve cualquier formulario para hacerlo responsive
 */
const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  variant = 'default',
  onSubmit,
  loading = false,
  className = '',
  actions
}) => {
  const getFormClass = () => {
    const baseClass = 'form-responsive';
    let variantClass = '';
    
    switch (variant) {
      case 'horizontal':
        variantClass = 'form-horizontal-responsive';
        break;
      case 'grid':
        variantClass = 'form-grid-responsive';
        break;
      case 'modal':
        variantClass = 'form-modal-responsive';
        break;
      default:
        variantClass = '';
    }
    
    const loadingClass = loading ? 'form-loading' : '';
    
    return `${baseClass} ${variantClass} ${loadingClass} ${className}`.trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && !loading) {
      onSubmit(e);
    }
  };

  return (
    <form className={getFormClass()} onSubmit={handleSubmit}>
      {children}
      
      {/* Botones de acción opcionales */}
      {actions && (
        <div className="form-actions-responsive">
          {actions.danger && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={actions.danger.onClick}
              disabled={loading}
            >
              {actions.danger.label}
            </button>
          )}
          
          {actions.secondary && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={actions.secondary.onClick}
              disabled={loading}
            >
              {actions.secondary.label}
            </button>
          )}
          
          {actions.primary && (
            <button
              type="submit"
              className="btn btn-primary"
              onClick={actions.primary.onClick}
              disabled={loading || actions.primary.disabled}
            >
              {loading ? 'Procesando...' : actions.primary.label}
            </button>
          )}
        </div>
      )}
    </form>
  );
};

/**
 * 📝 GRUPO DE CAMPO RESPONSIVE
 * Componente para campos de formulario individuales
 */
interface ResponsiveFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const ResponsiveField: React.FC<ResponsiveFieldProps> = ({
  label,
  required = false,
  error,
  helpText,
  children,
  className = '',
  fullWidth = false
}) => {
  const fieldClass = fullWidth ? 'form-group form-group-full' : 'form-group';
  
  return (
    <div className={`${fieldClass} ${className} ${error ? 'invalid' : ''}`}>
      <label className={required ? 'required' : ''}>
        {label}
      </label>
      {children}
      {error && <div className="error-message">{error}</div>}
      {helpText && !error && <div className="help-text">{helpText}</div>}
    </div>
  );
};

/**
 * 📝 CAMPO DE ARCHIVO RESPONSIVE
 */
interface ResponsiveFileFieldProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  onChange: (files: FileList | null) => void;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export const ResponsiveFileField: React.FC<ResponsiveFileFieldProps> = ({
  label,
  accept,
  multiple = false,
  onChange,
  required = false,
  error,
  helpText
}) => {
  const [hasFile, setHasFile] = React.useState(false);
  const [fileName, setFileName] = React.useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    onChange(files);
    
    if (files && files.length > 0) {
      setHasFile(true);
      setFileName(multiple ? `${files.length} archivo(s) seleccionado(s)` : files[0].name);
    } else {
      setHasFile(false);
      setFileName('');
    }
  };

  return (
    <ResponsiveField label={label} required={required} error={error} helpText={helpText}>
      <div className="form-file-responsive">
        <div className={`file-input ${hasFile ? 'has-file' : ''}`}>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
          />
          <div className="file-label">
            <span>{hasFile ? fileName : 'Seleccionar archivo(s)'}</span>
          </div>
        </div>
      </div>
    </ResponsiveField>
  );
};

/**
 * 📝 CAMPO DE BÚSQUEDA RESPONSIVE
 */
interface ResponsiveSearchFieldProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export const ResponsiveSearchField: React.FC<ResponsiveSearchFieldProps> = ({
  placeholder = 'Buscar...',
  value,
  onChange,
  onClear,
  className = ''
}) => {
  return (
    <div className={`form-search-responsive ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <button 
          type="button" 
          className="clear-btn"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
        >
          ✕
        </button>
      ) : (
        <span className="search-icon">🔍</span>
      )}
    </div>
  );
};

export default ResponsiveForm;