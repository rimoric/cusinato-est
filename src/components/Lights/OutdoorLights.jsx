import React from 'react';
import OutdoorLightSchedule from './OutdoorLightSchedule';

// Configurazione luci esterne
const OUTDOOR_LIGHTS = [
  { target: 'portico', name: 'Portico', icon: '🏛️' },
  { target: 'ingresso', name: 'Ingresso', icon: '🚪' },
  { target: 'insegna', name: 'Insegna', icon: '🪧' },
  { target: 'aiuola', name: 'Aiuola', icon: '🌺' },
  { target: 'est', name: 'Zona Est', icon: '🌅' },
  { target: 'ovest', name: 'Zona Ovest', icon: '🌄' },
];

/**
 * Componente OutdoorLights - Gestione luci esterne
 */
const OutdoorLights = () => {
  return (
    <div>
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 Modalità disponibili:</span>
          <br />
          <span className="text-xs">
            <strong>Spento:</strong> Luce sempre spenta • 
            <strong> Auto:</strong> Accensione/spegnimento programmato • 
            <strong> Sempre ON:</strong> Luce sempre accesa
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {OUTDOOR_LIGHTS.map((light) => (
          <OutdoorLightSchedule
            key={light.target}
            target={light.target}
            name={light.name}
            icon={light.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default OutdoorLights;
