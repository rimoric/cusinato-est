import React, { useState } from 'react';
import { Calendar, Settings } from 'lucide-react';
import { Toggle, Button } from '../Common';
import { useMqtt } from '../../hooks';
import WeeklyScheduleGrid from './WeeklyScheduleGrid';

/**
 * Componente DeviceControl - Controllo manuale + Programmazione per singolo dispositivo
 */
const DeviceControl = ({ device, deviceName, icon, hasSchedule = true }) => {
  const { manualControls, toggleManualControl, connected } = useMqtt();
  const [showSchedule, setShowSchedule] = useState(false);

  const deviceKey = device.toLowerCase();
  const isActive = manualControls[deviceKey] || false;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h4 className="font-bold text-gray-800">{deviceName}</h4>
            <p className="text-xs text-gray-500">
              {hasSchedule ? 'Controllo manuale + Programmazione' : 'Solo controllo manuale'}
            </p>
          </div>
        </div>
      </div>

      {/* Controlli */}
      <div className="space-y-3">
        {/* Toggle Manuale */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Controllo Manuale
            </span>
          </div>
          <Toggle
            checked={isActive}
            onChange={() => toggleManualControl(deviceKey)}
            disabled={!connected}
            label={isActive ? 'ON' : 'OFF'}
          />
        </div>

        {/* Programmazione Orari (se disponibile) */}
        {hasSchedule && (
          <Button
            variant="primary"
            onClick={() => setShowSchedule(true)}
            disabled={!connected}
            className="w-full"
          >
            <Calendar className="w-4 h-4" />
            <span>Programmazione Orari</span>
          </Button>
        )}
      </div>

      {/* Popup Programmazione */}
      {showSchedule && (
        <WeeklyScheduleGrid
          device={device}
          deviceName={deviceName}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
};

export default DeviceControl;
