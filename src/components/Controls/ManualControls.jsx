import React from 'react';
import { Flame, Settings, Sun } from 'lucide-react';
import { Toggle } from '../Common';
import { useMqtt } from '../../hooks';

// Configurazione controlli manuali
const MANUAL_CONTROLS = [
  {
    id: 'caldaia',
    name: 'Caldaia',
    icon: Flame,
    description: 'Forzatura manuale riscaldamento',
    color: 'text-orange-500',
  },
  {
    id: 'compressore',
    name: 'Compressore',
    icon: Settings,
    description: 'Forzatura manuale compressore',
    color: 'text-blue-500',
  },
  {
    id: 'crepuscolare',
    name: 'Esclusione Crepuscolare',
    icon: Sun,
    description: 'Disabilita sensore luce esterna',
    color: 'text-yellow-500',
  },
];

/**
 * Componente ManualControls - Toggle manuali per caldaia/compressore/crepuscolare
 */
const ManualControls = () => {
  const { manualControls, toggleManualControl, connected } = useMqtt();

  const handleToggle = async (deviceId) => {
    if (!connected) return;
    await toggleManualControl(deviceId);
  };

  return (
    <div className="space-y-4">
      {MANUAL_CONTROLS.map((control) => {
        const Icon = control.icon;
        const isActive = manualControls[control.id];

        return (
          <div
            key={control.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`p-2 bg-white rounded-lg ${control.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {control.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {control.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${isActive ? 'text-success' : 'text-gray-500'}`}>
                {isActive ? 'Attivo' : 'Spento'}
              </span>
              <Toggle
                checked={isActive}
                onChange={() => handleToggle(control.id)}
                disabled={!connected}
              />
            </div>
          </div>
        );
      })}

      {/* Info aggiuntiva */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p className="font-medium">ℹ️ Informazioni</p>
        <p className="text-xs mt-1">
          I controlli manuali forzano l'attivazione ignorando la programmazione automatica.
        </p>
      </div>
    </div>
  );
};

export default ManualControls;
