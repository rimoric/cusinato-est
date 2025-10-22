import React from 'react';

/**
 * Componente Button con varianti e stati
 * @param {string} variant - Tipo: 'primary', 'success', 'inactive', 'active'
 * @param {boolean} active - Stato attivo (per toggle buttons)
 * @param {boolean} disabled - Disabilitato
 * @param {function} onClick - Handler click
 * @param {React.ReactNode} children - Contenuto
 * @param {string} className - Classi CSS aggiuntive
 */
const Button = ({ 
  variant = 'primary', 
  active = false,
  disabled = false,
  onClick, 
  children, 
  className = '',
  ...props 
}) => {
  
  const baseClasses = 'btn-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'btn-access',
    success: 'bg-success text-white hover:bg-green-600 active:scale-95',
    inactive: 'btn-inactive',
    active: 'btn-active',
  };

  const activeClasses = active ? 'btn-active' : 'btn-inactive';
  
  const finalClasses = variant === 'inactive' || variant === 'active' 
    ? `${baseClasses} ${activeClasses} ${className}`
    : `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button
      className={finalClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
