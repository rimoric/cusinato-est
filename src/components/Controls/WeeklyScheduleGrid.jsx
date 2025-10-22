import React, { useState, useRef } from 'react';
import { Clock, Copy, Trash2, Save, X } from 'lucide-react';
import { Button } from '../Common';
import { useMqtt } from '../../hooks';

// Nomi giorni
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const DAY_FULL_NAMES = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

// Ore
const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * Converte stato griglia in array di 12 byte per MQTT
 */
const gridToScheduleArray = (grid) => {
  const schedule = new Array(12).fill(0);
  
  // Per ogni giorno della settimana
  for (let day = 0; day < 7; day++) {
    // Per ogni ora
    for (let hour = 0; hour < 24; hour++) {
      const byteIndex = Math.floor(hour / 2);
      const isHighNibble = hour % 2 === 1;
      
      // Verifica i 4 quarti dell'ora
      for (let quarter = 0; quarter < 4; quarter++) {
        if (grid[day][hour][quarter]) {
          const bitPosition = quarter;
          
          if (isHighNibble) {
            schedule[byteIndex] |= (1 << (bitPosition + 4)); // Bit 4-7
          } else {
            schedule[byteIndex] |= (1 << bitPosition); // Bit 0-3
          }
        }
      }
    }
  }
  
  return schedule;
};

/**
 * Converte array 12 byte in stato griglia
 */
const scheduleArrayToGrid = (schedule) => {
  const grid = Array(7).fill(null).map(() => 
    Array(24).fill(null).map(() => Array(4).fill(false))
  );
  
  // Per ogni giorno
  for (let day = 0; day < 7; day++) {
    // Per ogni ora
    for (let hour = 0; hour < 24; hour++) {
      const byteIndex = Math.floor(hour / 2);
      const isHighNibble = hour % 2 === 1;
      
      // Leggi i 4 quarti
      for (let quarter = 0; quarter < 4; quarter++) {
        const bitPosition = quarter;
        let isActive;
        
        if (isHighNibble) {
          isActive = (schedule[byteIndex] & (1 << (bitPosition + 4))) !== 0;
        } else {
          isActive = (schedule[byteIndex] & (1 << bitPosition)) !== 0;
        }
        
        grid[day][hour][quarter] = isActive;
      }
    }
  }
  
  return grid;
};

/**
 * Calcola bitmask giorni abilitati (almeno 1 quarto attivo)
 */
const calculateEnabledDays = (grid) => {
  let mask = 0;
  
  // Mapping: grid index -> day bit
  // grid: [Lun=0, Mar=1, Mer=2, Gio=3, Ven=4, Sab=5, Dom=6]
  // bits: [Dom=0, Lun=1, Mar=2, Mer=3, Gio=4, Ven=5, Sab=6]
  const dayMapping = [1, 2, 3, 4, 5, 6, 0]; // Lun->bit1, ..., Dom->bit0
  
  grid.forEach((daySchedule, dayIndex) => {
    // Controlla se almeno un quarto è attivo
    const hasActiveQuarter = daySchedule.some(hour => 
      hour.some(quarter => quarter)
    );
    
    if (hasActiveQuarter) {
      mask |= (1 << dayMapping[dayIndex]);
    }
  });
  
  return mask;
};

/**
 * Componente WeeklyScheduleGrid - Griglia settimanale a quarti d'ora
 */
const WeeklyScheduleGrid = ({ device, deviceName, onClose }) => {
  const { sendScheduleConfig, connected } = useMqtt();
  
  // Stato griglia: [giorno][ora][quarto]
  // 7 giorni × 24 ore × 4 quarti = 672 celle
  const [grid, setGrid] = useState(() => 
    Array(7).fill(null).map(() => 
      Array(24).fill(null).map(() => Array(4).fill(false))
    )
  );
  
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(false);
  const gridRef = useRef(null);

  // Toggle singolo quarto
  const toggleQuarter = (day, hour, quarter) => {
    const newGrid = [...grid];
    newGrid[day] = [...newGrid[day]];
    newGrid[day][hour] = [...newGrid[day][hour]];
    newGrid[day][hour][quarter] = !newGrid[day][hour][quarter];
    setGrid(newGrid);
  };

  // Gestione drag
  const handleMouseDown = (day, hour, quarter) => {
    setIsDragging(true);
    const currentValue = grid[day][hour][quarter];
    setDragValue(!currentValue);
    toggleQuarter(day, hour, quarter);
  };

  const handleMouseEnter = (day, hour, quarter) => {
    if (isDragging) {
      const newGrid = [...grid];
      newGrid[day] = [...newGrid[day]];
      newGrid[day][hour] = [...newGrid[day][hour]];
      newGrid[day][hour][quarter] = dragValue;
      setGrid(newGrid);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Copia giorno precedente
  const copyPreviousDay = (targetDay) => {
    if (targetDay === 0) return; // Non copiare per Lunedì
    
    const newGrid = [...grid];
    newGrid[targetDay] = JSON.parse(JSON.stringify(grid[targetDay - 1]));
    setGrid(newGrid);
  };

  // Copia Lunedì a tutti i feriali (Mar-Ven)
  const copyMondayToWeekdays = () => {
    const newGrid = [...grid];
    const mondaySchedule = JSON.parse(JSON.stringify(grid[0]));
    
    for (let day = 1; day <= 4; day++) { // Mar, Mer, Gio, Ven
      newGrid[day] = JSON.parse(JSON.stringify(mondaySchedule));
    }
    
    setGrid(newGrid);
  };

  // Azzera tutto
  const clearAll = () => {
    if (confirm('Azzerare tutti gli orari?')) {
      setGrid(Array(7).fill(null).map(() => 
        Array(24).fill(null).map(() => Array(4).fill(false))
      ));
    }
  };

  // Azzera giorno
  const clearDay = (day) => {
    const newGrid = [...grid];
    newGrid[day] = Array(24).fill(null).map(() => Array(4).fill(false));
    setGrid(newGrid);
  };

  // Salva
  const handleSave = async () => {
    if (!connected) return;

    setSaving(true);

    try {
      // Converti griglia in schedule array
      const schedule = gridToScheduleArray(grid);
      
      // Calcola giorni abilitati
      const enabledDays = calculateEnabledDays(grid);

      const result = await sendScheduleConfig(device, schedule, enabledDays);
      
      if (result.success) {
        setTimeout(() => {
          setSaving(false);
          if (onClose) onClose();
        }, 1000);
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

  // Conta quarti attivi
  const countActiveQuarters = () => {
    let count = 0;
    grid.forEach(day => {
      day.forEach(hour => {
        hour.forEach(quarter => {
          if (quarter) count++;
        });
      });
    });
    return count;
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onMouseUp={handleMouseUp}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">{deviceName}</h2>
              <p className="text-sm text-blue-100">Programmazione orari settimanali a quarti d'ora</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-600 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="border-b border-gray-200 p-3 bg-gray-50 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={copyMondayToWeekdays}
            disabled={!connected}
          >
            <Copy className="w-4 h-4" />
            <span>Lun → Mar-Ven</span>
          </Button>
          
          <Button
            variant="danger"
            size="sm"
            onClick={clearAll}
            disabled={!connected}
          >
            <Trash2 className="w-4 h-4" />
            <span>Azzera Tutto</span>
          </Button>

          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">
              {countActiveQuarters()} quarti attivi
            </span>
            <span className="text-gray-400">|</span>
            <span>
              {(countActiveQuarters() * 15 / 60).toFixed(1)} ore/settimana
            </span>
          </div>
        </div>

        {/* Grid Container */}
        <div className="flex-1 overflow-auto p-4">
          <div className="min-w-max">
            {/* Header Ore */}
            <div className="flex mb-2 sticky top-0 bg-white z-10 pb-2">
              <div className="w-20"></div>
              <div className="flex-1 flex">
                {HOURS.map(hour => (
                  <div key={hour} className="flex-1 text-center">
                    <div className="text-xs font-semibold text-gray-700">
                      {String(hour).padStart(2, '0')}
                    </div>
                    <div className="flex justify-center gap-px mt-1">
                      <span className="text-[8px] text-gray-400">00</span>
                      <span className="text-[8px] text-gray-400">15</span>
                      <span className="text-[8px] text-gray-400">30</span>
                      <span className="text-[8px] text-gray-400">45</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Righe Giorni */}
            {grid.map((daySchedule, dayIndex) => (
              <div key={dayIndex} className="flex items-center mb-1 group">
                {/* Nome Giorno + Azioni */}
                <div className="w-20 pr-2">
                  <div className="font-semibold text-sm text-gray-700">
                    {DAY_NAMES[dayIndex]}
                  </div>
                  <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {dayIndex > 0 && (
                      <button
                        onClick={() => copyPreviousDay(dayIndex)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                        title={`Copia da ${DAY_NAMES[dayIndex - 1]}`}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => clearDay(dayIndex)}
                      className="text-xs text-red-600 hover:text-red-800"
                      title="Azzera giorno"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Quarti d'ora */}
                <div className="flex-1 flex gap-px" ref={gridRef}>
                  {daySchedule.map((hour, hourIndex) => (
                    <div key={hourIndex} className="flex-1 flex gap-px">
                      {hour.map((quarter, quarterIndex) => (
                        <button
                          key={quarterIndex}
                          onMouseDown={() => handleMouseDown(dayIndex, hourIndex, quarterIndex)}
                          onMouseEnter={() => handleMouseEnter(dayIndex, hourIndex, quarterIndex)}
                          className={`
                            aspect-square w-full min-w-[12px] rounded-sm transition-colors cursor-pointer
                            ${quarter 
                              ? 'bg-success hover:bg-green-600' 
                              : 'bg-gray-200 hover:bg-gray-300'
                            }
                          `}
                          title={`${DAY_FULL_NAMES[dayIndex]} ${String(hourIndex).padStart(2, '0')}:${String(quarterIndex * 15).padStart(2, '0')}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="inline-block w-3 h-3 bg-success rounded mr-2"></span>
            Attivo
            <span className="inline-block w-3 h-3 bg-gray-200 rounded ml-4 mr-2"></span>
            Spento
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              <X className="w-4 h-4" />
              <span>Annulla</span>
            </Button>

            <Button
              variant="success"
              onClick={handleSave}
              disabled={!connected || saving}
            >
              {saving ? (
                <>
                  <span className="animate-pulse">Salvataggio...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salva Orari</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyScheduleGrid;
