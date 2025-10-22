import React from 'react';
import { Building2 } from 'lucide-react';
import StatusIndicator from '../Common/StatusIndicator';

/**
 * Componente Header principale
 * @param {boolean} connected - Stato connessione MQTT
 */
const Header = ({ connected = false }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Titolo */}
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                CUSINATO EST
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Controllo Remoto Ampliamento
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <StatusIndicator connected={connected} />
        </div>
      </div>
    </header>
  );
};

export default Header;
