import React from 'react';
import DeviceControl from './DeviceControl';

/**
 * Componente UnifiedControls - Controlli manuali e programmazione unificati
 */
const UnifiedControls = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Caldaia */}
      <DeviceControl
        device="Cald"
        deviceName="Caldaia"
        icon="🔥"
        hasSchedule={true}
      />

      {/* Compressore */}
      <DeviceControl
        device="Comp"
        deviceName="Compressore"
        icon="🔧"
        hasSchedule={true}
      />

      {/* Crepuscolare (solo toggle, no schedule) */}
      <DeviceControl
        device="crepuscolare"
        deviceName="Esclusione Crepuscolare"
        icon="🌙"
        hasSchedule={false}
      />
    </div>
  );
};

export default UnifiedControls;
