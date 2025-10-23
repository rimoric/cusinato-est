import React, { useState } from 'react';
import { Sun, Moon, Power, Clock, Save } from 'lucide-react';
import { Button } from '../Common';
import { useMqtt } from '../../hooks';

// Modalità luci
const MODES = {
  OFF: { value: 0, label: 'Spento', icon: Power, color: 'text-gray-500' },
  AUTO: { value: 1, label: 'Auto', icon: Clock, color: 'text-blue-600' },
  MANUAL_ON: { value: 2, label: 'Sempre ON', icon: Sun, color: 'text-yellow-500' },
};

/**
 * Componente OutdoorLightSchedule - Configurazione singola luce esterna
 */
const OutdoorLightSchedule = ({ target, name, icon }) => {
  const { sendOutdoorLightConfig, connected } = useMqtt();
  
  const [mode, setMode] = useState(1); // Default: AUTO
  const [onHour, setOnHour] = useState(18);
  const [onMinute, setOnMinute] = useState(0);
  const [offHour, setOffHour] = useState(22);
  const [offMinute, setOffMinute] = useState(0);
  const [saving, setSaving] = useState(false);

  // Genera opzioni ore e minuti
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  // Calcola minuti da mezzanotte
  const calculateMinutes = (hour, minute) => hour * 60 + minute;

  // Salva configurazione
  const handleSave = async () => {
    if (!connected) return;

    setSaving(true);

    const onTime = calculateMinutes(onHour, onMinute);
    const offTime = calculateMinutes(offHour, offMinute);

    try {
      const result = await sendOutdoorLightConfig(target, mode, onTime, offTime);
      
      if (result.success) {
        setTimeout(() => setSaving(false), 1000);
      } else {
        setSaving(false);
        alert('Errore salvataggio configurazione');
      }
    } catch (error) {
      console.error('Errore:', error);
      setSaving(false);
      alert('Errore salvataggio configurazione');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className="font-bold text-gray-800">{name}</h4>
          <p className="text-xs text-gray-500">Programmazione accensione/spegnimento</p>
        </div>
      </div>

      {/* Selezione Modalità */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Modalità
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(MODES).map(([key, modeData]) => {
            const Icon = modeData.icon;
            const isSelected = mode === modeData.value;
            
            return (
              <button
                key={key}
                onClick={() => setMode(modeData.value)}
                disabled={!connected}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${isSelected
                    ? 'border-primary bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-primary' : modeData.color}`} />
                <div className="text-xs font-medium text-gray-700">
                  {modeData.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orari (solo se modalità AUTO) */}
      {mode === 1 && (
        <div className="space-y-3 bg-gray-50 rounded-lg p-3">
          {/* Orario Accensione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              Accensione
            </label>
            <div className="flex gap-2">
              <select
                value={onHour}
                onChange={(e) => setOnHour(Number(e.target.value))}
                disabled={!connected}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {hours.map(h => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                ))}
              </select>
              <span className="self-center text-gray-600 font-bold">:</span>
              <select
                value={onMinute}
                onChange={(e) => setOnMinute(Number(e.target.value))}
                disabled={!connected}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {minutes.map(m => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Orario Spegnimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Moon className="w-4 h-4 text-blue-600" />
              Spegnimento
            </label>
            <div className="flex gap-2">
              <select
                value={offHour}
                onChange={(e) => setOffHour(Number(e.target.value))}
                disabled={!connected}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {hours.map(h => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                ))}
              </select>
              <span className="self-center text-gray-600 font-bold">:</span>
              <select
                value={offMinute}
                onChange={(e) => setOffMinute(Number(e.target.value))}
                disabled={!connected}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {minutes.map(m => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Anteprima */}
          <div className="bg-white rounded-lg p-2 border border-gray-200 text-sm text-gray-600 text-center">
            Attivo dalle {String(onHour).padStart(2, '0')}:{String(onMinute).padStart(2, '0')} 
            {' '}alle {String(offHour).padStart(2, '0')}:{String(offMinute).padStart(2, '0')}
          </div>
        </div>
      )}

      {/* Pulsante Salva */}
      <div className="mt-4">
        <Button
          variant="success"
          onClick={handleSave}
          disabled={!connected || saving}
          className="w-full"
        >
          {saving ? (
            <span className="animate-pulse">Salvataggio...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Salva Configurazione</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default OutdoorLightSchedule;
