import React from 'react';
import { Clock, DoorOpen, Lightbulb, Settings } from 'lucide-react';

/**
 * Componente CommandLog per mostrare ultimi comandi inviati
 * @param {Array} logs - Array di log entries
 */
const CommandLog = ({ logs = [] }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'access':
        return <DoorOpen className="w-4 h-4" />;
      case 'light':
      case 'outdoor':
      case 'global':
        return <Lightbulb className="w-4 h-4" />;
      case 'control':
        return <Settings className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'access':
        return 'text-primary';
      case 'light':
      case 'outdoor':
        return 'text-warning';
      case 'global':
        return 'text-success';
      case 'control':
        return 'text-gray-600';
      default:
        return 'text-gray-400';
    }
  };

  if (logs.length === 0) {
    return (
      <div className="section-card">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          📋 Ultimi Comandi
        </h3>
        <p className="text-sm text-gray-500 text-center py-4">
          Nessun comando inviato ancora
        </p>
      </div>
    );
  }

  return (
    <div className="section-card">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        📋 Ultimi Comandi
      </h3>
      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg text-sm"
          >
            <span className={`mt-0.5 ${getTypeColor(log.type)}`}>
              {getIcon(log.type)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 truncate">{log.description}</p>
              <p className="text-xs text-gray-500">{log.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommandLog;
