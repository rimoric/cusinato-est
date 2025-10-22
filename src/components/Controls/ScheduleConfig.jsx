import React, { useState } from 'react';
import { Clock, Calendar, Grid } from 'lucide-react';
import { Button, Toggle } from '../Common';
import { useMqtt } from '../../hooks';
import WeeklyScheduleGrid from './WeeklyScheduleGrid';

// Template orari predefiniti
const TEMPLATES = {
  OFFICE: {
    name: 'Ufficio (Lun-Ven 8-18)',
    days: [false, true, true, true, true, true, false], // Dom, Lun, Mar, Mer, Gio, Ven, Sab
    hours: { start: 8, end: 18 },
  },
  CONTINUOUS: {
    name: 'Continuo (Tutti i giorni)',
    days: [true, true, true, true, true, true, true],
    hours: { start: 0, end: 24 },
  },
  MORNING: {
    name: 'Mattina (Lun-Ven 6-12)',
    days: [false, true, true, true, true, true, false],
    hours: { start: 6, end: 12 },
  },
  AFTERNOON: {
    name: 'Pomeriggio (Lun-Ven 14-20)',
    days: [false, true, true, true, true, true, false],
    hours: { start: 14, end: 20 },
  },
};

// Nomi giorni
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

/**
 * Converte ore start/end in array di 12 byte (24 ore in quarti d'ora)
 */
const createScheduleArray = (startHour, endHour) => {
  const schedule = new Array(12).fill(0);
  
  // Per ogni ora
  for (let hour = 0; hour < 24; hour++) {
    if (hour >= startHour && hour < endHour) {
      const byteIndex = Math.floor(hour / 2);
      const isHighNibble = hour % 2 === 1;
      
      // Imposta tutti e 4 i quarti d'ora attivi (15 bit = 0xF)
      if (isHighNibble) {
        schedule[byteIndex] |= 0xF0; // Nibble alto
      } else {
        schedule[byteIndex] |= 0x0F; // Nibble basso
      }
    }
  }
  
  return schedule;
};

/**
 * Converte array giorni in bitmask
 */
const daysToBitmask = (daysArray) => {
  let mask = 0;
  daysArray.forEach((enabled, index) => {
    if (enabled) {
      mask |= (1 << index);
    }
  });
  return mask;
};

/**
 * Componente ScheduleConfig - Configurazione orari dispositivi
 */
const ScheduleConfig = ({ device, deviceName }) => {
  const { sendScheduleConfig, connected } = useMqtt();
  
  const [showGrid, setShowGrid] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [days, setDays] = useState([false, true, true, true, true, true, false]);
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(18);
  const [saving, setSaving] = useState(false);

  // Applica template
  const applyTemplate = (templateKey) => {
    const template = TEMPLATES[templateKey];
    setSelectedTemplate(templateKey);
    setDays(template.days);
    setStartHour(template.hours.start);
    setEndHour(template.hours.end);
    setCustomMode(false);
  };

  // Toggle giorno
  const toggleDay = (index) => {
    const newDays = [...days];
    newDays[index] = !newDays[index];
    setDays(newDays);
    setSelectedTemplate(null); // Deseleziona template
    setCustomMode(true);
  };

  // Salva configurazione
  const handleSave = async () => {
    if (!connected) return;

    setSaving(true);

    // Crea schedule array
    const schedule = createScheduleArray(startHour, endHour);
    
    // Crea bitmask giorni
    const enabledDays = daysToBitmask(days);

    try {
      const result = await sendScheduleConfig(device, schedule, enabledDays);
      
      if (result.success) {
        // Feedback positivo
        setTimeout(() => setSaving(false), 1000);
      } else {
        setSaving(false);
        alert('Errore salvataggio orari');
      }
    } catch (error) {
      console.error('Errore:', error);
      setSaving(false);
      alert('Errore salvataggio orari');
    }
  };

  // Genera opzioni ore
  const hourOptions = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-lg font-bold text-gray-800">{deviceName}</h3>
          <p className="text-sm text-gray-600">Programmazione orari settimanali</p>
        </div>
      </div>

      {/* Pulsante Griglia Avanzata */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Grid className="w-8 h-8 text-primary" />
            <div>
              <h4 className="font-bold text-gray-800">Programmazione Avanzata</h4>
              <p className="text-sm text-gray-600">
                Configura orari diversi per ogni giorno con precisione di 15 minuti
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowGrid(true)}
            disabled={!connected}
            className="px-6"
          >
            <Grid className="w-4 h-4" />
            <span>Apri Griglia</span>
          </Button>
        </div>
      </div>

      {/* Template Predefiniti */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Template Rapidi
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => applyTemplate(key)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedTemplate === key
                  ? 'border-primary bg-blue-50 text-primary'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
              disabled={!connected}
            >
              <div className="text-sm font-medium">{template.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {template.hours.start}:00 - {template.hours.end}:00
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configurazione Personalizzata */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">
            Configurazione Personalizzata
          </label>
          {customMode && (
            <span className="text-xs bg-primary text-white px-2 py-1 rounded">
              Personalizzato
            </span>
          )}
        </div>

        {/* Giorni Attivi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Giorni Attivi
          </label>
          <div className="flex flex-wrap gap-2">
            {DAY_NAMES.map((dayName, index) => (
              <button
                key={index}
                onClick={() => toggleDay(index)}
                disabled={!connected}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  days[index]
                    ? 'bg-success text-white shadow-md'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {dayName}
              </button>
            ))}
          </div>
        </div>

        {/* Orari */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ora Inizio
            </label>
            <select
              value={startHour}
              onChange={(e) => {
                setStartHour(Number(e.target.value));
                setSelectedTemplate(null);
                setCustomMode(true);
              }}
              disabled={!connected}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {hourOptions.slice(0, 24).map((hour) => (
                <option key={hour} value={hour}>
                  {String(hour).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ora Fine
            </label>
            <select
              value={endHour}
              onChange={(e) => {
                setEndHour(Number(e.target.value));
                setSelectedTemplate(null);
                setCustomMode(true);
              }}
              disabled={!connected}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {hourOptions.slice(startHour + 1).map((hour) => (
                <option key={hour} value={hour}>
                  {String(hour).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview Orario */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Anteprima Configurazione
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-primary">
              {days.filter(Boolean).length} giorni attivi
            </span>
            {' • '}
            <span className="font-semibold text-primary">
              {String(startHour).padStart(2, '0')}:00 - {String(endHour).padStart(2, '0')}:00
            </span>
            {' '}
            ({endHour - startHour} ore)
          </div>
        </div>
      </div>

      {/* Pulsante Salva */}
      <div className="flex justify-end pt-2">
        <Button
          variant="success"
          onClick={handleSave}
          disabled={!connected || saving || days.filter(Boolean).length === 0}
          className="px-8"
        >
          {saving ? (
            <>
              <span className="animate-pulse">Salvataggio...</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              <span>Salva Orari</span>
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p className="font-medium">ℹ️ Come funziona</p>
        <p className="text-xs mt-1">
          Gli orari programmati attivano automaticamente il dispositivo nei giorni e fasce orarie selezionati.
          I controlli manuali hanno sempre priorità sulla programmazione.
        </p>
      </div>

      {/* Popup Griglia Avanzata */}
      {showGrid && (
        <WeeklyScheduleGrid
          device={device}
          deviceName={deviceName}
          onClose={() => setShowGrid(false)}
        />
      )}
    </div>
  );
};

export default ScheduleConfig;
