import React from 'react';
import { Lightbulb, Clock } from 'lucide-react';

// Configurazione luci esterne (per FASE 2)
const OUTDOOR_LIGHTS = [
  { id: 'portico', name: 'Portico', baseAddr: 150 },
  { id: 'ingresso', name: 'Ingresso Uffici', baseAddr: 130 },
  { id: 'insegna', name: 'Insegna', baseAddr: 140 },
  { id: 'aiuola', name: 'Faretti Aiuola', baseAddr: 100 },
  { id: 'est', name: 'Fari Laterali Est', baseAddr: 110 },
  { id: 'ovest', name: 'Fari Ovest', baseAddr: 120 },
];

/**
 * Componente OutdoorLights - Configurazione luci esterne
 * FASE 2 - Placeholder per implementazione futura
 */
const OutdoorLights = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <Clock className="w-5 h-5" />
          <p className="font-medium">🚧 Funzionalità in arrivo - FASE 2</p>
        </div>
        <p className="text-sm text-yellow-700 mt-2">
          La configurazione delle luci esterne (modalità automatica, orari accensione/spegnimento) 
          sarà disponibile nella prossima versione.
        </p>
      </div>

      {/* Preview luci disponibili */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {OUTDOOR_LIGHTS.map((light) => (
          <div
            key={light.id}
            className="p-4 bg-gray-100 rounded-lg text-center opacity-50 cursor-not-allowed"
          >
            <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-600">{light.name}</p>
            <p className="text-xs text-gray-500 mt-1">Non configurabile</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutdoorLights;
