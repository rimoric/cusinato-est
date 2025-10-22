import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Componente Section con supporto accordion mobile
 * @param {string} title - Titolo sezione
 * @param {string} icon - Emoji o icona
 * @param {React.ReactNode} children - Contenuto
 * @param {boolean} isOpen - Stato aperto/chiuso (per mobile)
 * @param {function} onToggle - Handler toggle
 * @param {boolean} isMobile - Se è visualizzato su mobile
 * @param {number} count - Badge count opzionale
 */
const Section = ({ 
  title, 
  icon, 
  children, 
  isOpen = true, 
  onToggle, 
  isMobile = false,
  count
}) => {
  // Desktop: sempre aperto
  if (!isMobile) {
    return (
      <section className="section-card">
        <div className="flex items-center gap-3 mb-4">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {count !== undefined && (
            <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        <div>{children}</div>
      </section>
    );
  }

  // Mobile: accordion
  return (
    <section className="section-card">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 text-left"
      >
        {icon && <span className="text-2xl">{icon}</span>}
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {count !== undefined && (
          <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
            {count}
          </span>
        )}
        <span className="ml-auto">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </span>
      </button>
      
      {isOpen && (
        <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </section>
  );
};

export default Section;
