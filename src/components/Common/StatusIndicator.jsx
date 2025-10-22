import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * Componente StatusIndicator per connessione MQTT
 * @param {boolean} connected - Stato connessione
 * @param {string} broker - Nome broker
 */
const StatusIndicator = ({ connected = false, broker = 'broker.emqx.io' }) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-2">
        {connected ? (
          <>
            <Wifi className="w-4 h-4 text-success" />
            <span className="text-success font-medium">Connesso</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-danger" />
            <span className="text-danger font-medium">Disconnesso</span>
          </>
        )}
      </div>
      <span className="text-gray-500 text-xs hidden sm:inline">
        {broker}
      </span>
    </div>
  );
};

export default StatusIndicator;
