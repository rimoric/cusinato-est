import React from 'react';
import { Lightbulb, PowerOff } from 'lucide-react';
import { Button } from '../Common';
import { useMqtt } from '../../hooks';

// Configurazione zone luci
const LIGHT_ZONES = [
  { id: 1, name: 'Zona Blu', icon: '🔵', color: 'blue' },
  { id: 2, name: 'Zona Rossa', icon: '🔴', color: 'red' },
  { id: 3, name: 'Zona Verde', icon: '🟢', color: 'green' },
  { id: 4, name: 'Zona Gialla', icon: '🟡', color: 'yellow' },
  { id: 5, name: 'Zona Lem', icon: '⚪', color: 'gray' },
];

/**
 * Componente IndoorLights - Controllo luci interne
 */
const IndoorLights = () => {
  const { 
    indoorLights, 
    toggleIndoorLight, 
    turnOffAllLights,
    connected 
  } = useMqtt();

  const handleZoneToggle = async (zoneId, zoneName) => {
    if (!connected) return;
    await toggleIndoorLight(zoneId, zoneName);
  };

  const handleTurnOffAll = async () => {
    if (!connected) return;
    await turnOffAllLights();
  };

  return (
    <div className="space-y-4">
      {/* Zone Luci */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {LIGHT_ZONES.map((zone) => {
          const isActive = indoorLights[zone.id];

          return (
            <Button
              key={zone.id}
              active={isActive}
              onClick={() => handleZoneToggle(zone.id, zone.name)}
              disabled={!connected}
              className="min-h-[90px] flex-col"
            >
              <span className="text-3xl">{zone.icon}</span>
              <span className="text-sm font-semibold text-center">
                {zone.name}
              </span>
              <div className="flex items-center gap-1 text-xs">
                <Lightbulb className="w-3 h-3" />
                <span>{isActive ? 'ON' : 'OFF'}</span>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Pulsante Spegni Tutto */}
      <div className="flex justify-center pt-2">
        <Button
          variant="success"
          onClick={handleTurnOffAll}
          disabled={!connected}
          className="w-full sm:w-auto px-8 py-4"
        >
          <PowerOff className="w-5 h-5" />
          <span className="font-bold">SPEGNI TUTTO</span>
        </Button>
      </div>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        💡 Auto-spegnimento dopo 15min con luce diurna
      </p>
    </div>
  );
};

export default IndoorLights;
