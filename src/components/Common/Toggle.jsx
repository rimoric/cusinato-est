import React from 'react';

/**
 * Componente Toggle Switch
 * @param {boolean} checked - Stato checked
 * @param {function} onChange - Handler cambio stato
 * @param {string} label - Label opzionale
 * @param {boolean} disabled - Disabilitato
 */
const Toggle = ({ checked = false, onChange, label, disabled = false }) => {
  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="toggle-switch">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
        />
        <div className="toggle-slider"></div>
      </div>
      {label && (
        <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Toggle;
