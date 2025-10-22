import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mqttService } from '../services/mqttService';

const MqttContext = createContext(null);

export const MqttProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  
  // Stati locali per UI (ottimistici)
  const [indoorLights, setIndoorLights] = useState({
    1: false, // Zona Blu
    2: false, // Zona Rossa
    3: false, // Zona Verde
    4: false, // Zona Gialla
    5: false, // Zona Lem
  });

  const [manualControls, setManualControls] = useState({
    caldaia: false,
    compressore: false,
    crepuscolare: false,
  });

  const [commandLog, setCommandLog] = useState([]);

  // Aggiungi comando al log
  const addToLog = useCallback((type, description) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('it-IT'),
      type,
      description,
    };
    
    setCommandLog(prev => [logEntry, ...prev].slice(0, 10)); // Mantieni solo ultimi 10
  }, []);

  // Connessione al broker
  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      setError(null);
      console.log('🟢 Dashboard connessa a MQTT');
    };

    const handleError = (err) => {
      setConnected(false);
      setError(err.message || 'Errore connessione MQTT');
      console.error('🔴 Errore MQTT:', err);
    };

    const handleMessage = (topic, payload) => {
      setLastMessage({ topic, payload, timestamp: Date.now() });
      console.log('📨 Messaggio ricevuto:', topic, payload);
    };

    mqttService.connect(handleConnect, handleError, handleMessage);

    return () => {
      mqttService.disconnect();
    };
  }, []);

  // Invia comando accesso
  const sendAccessCommand = useCallback(async (commandId, name) => {
    try {
      const result = await mqttService.sendAccessCommand(commandId);
      if (result.success) {
        addToLog('access', `${name} - Comando inviato`);
      }
      return result;
    } catch (error) {
      console.error('Errore invio comando accesso:', error);
      return { success: false, error: error.message };
    }
  }, [addToLog]);

  // Toggle luce interna
  const toggleIndoorLight = useCallback(async (zoneId, zoneName) => {
    // Aggiorna UI immediatamente (ottimistico)
    setIndoorLights(prev => ({
      ...prev,
      [zoneId]: !prev[zoneId]
    }));

    try {
      const result = await mqttService.sendIndoorLightCommand(zoneId, zoneName);
      if (result.success) {
        addToLog('light', `${zoneName} - ${indoorLights[zoneId] ? 'Spenta' : 'Accesa'}`);
      }
      return result;
    } catch (error) {
      // Rollback in caso di errore
      setIndoorLights(prev => ({
        ...prev,
        [zoneId]: !prev[zoneId]
      }));
      console.error('Errore toggle luce:', error);
      return { success: false, error: error.message };
    }
  }, [indoorLights, addToLog]);

  // Spegni tutte le luci
  const turnOffAllLights = useCallback(async () => {
    // Aggiorna UI immediatamente
    setIndoorLights({
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
    });

    try {
      const result = await mqttService.sendGlobalOffCommand();
      if (result.success) {
        addToLog('global', 'Tutte le luci spente');
      }
      return result;
    } catch (error) {
      console.error('Errore spegni tutto:', error);
      return { success: false, error: error.message };
    }
  }, [addToLog]);

  // Toggle controllo manuale
  const toggleManualControl = useCallback(async (device) => {
    const newState = !manualControls[device];
    
    // Aggiorna UI immediatamente
    setManualControls(prev => ({
      ...prev,
      [device]: newState
    }));

    try {
      const result = await mqttService.sendManualToggle(device, newState);
      if (result.success) {
        const deviceNames = {
          caldaia: 'Caldaia',
          compressore: 'Compressore',
          crepuscolare: 'Esclusione Crepuscolare'
        };
        addToLog('control', `${deviceNames[device]} - ${newState ? 'Attivato' : 'Disattivato'}`);
      }
      return result;
    } catch (error) {
      // Rollback in caso di errore
      setManualControls(prev => ({
        ...prev,
        [device]: !newState
      }));
      console.error('Errore toggle manuale:', error);
      return { success: false, error: error.message };
    }
  }, [manualControls, addToLog]);

  // Invia configurazione luce esterna
  const sendOutdoorLightConfig = useCallback(async (target, mode, onTime, offTime) => {
    try {
      const result = await mqttService.sendOutdoorLightConfig(target, mode, onTime, offTime);
      if (result.success) {
        addToLog('outdoor', `${target} - Configurazione aggiornata`);
      }
      return result;
    } catch (error) {
      console.error('Errore configurazione luce esterna:', error);
      return { success: false, error: error.message };
    }
  }, [addToLog]);

  const value = {
    // Stato connessione
    connected,
    error,
    lastMessage,
    
    // Stati locali
    indoorLights,
    manualControls,
    commandLog,
    
    // Azioni
    sendAccessCommand,
    toggleIndoorLight,
    turnOffAllLights,
    toggleManualControl,
    sendOutdoorLightConfig,
  };

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
};

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) {
    throw new Error('useMqtt deve essere usato all\'interno di MqttProvider');
  }
  return context;
};

export default MqttContext;