import mqtt from 'mqtt';

// Configurazione broker MQTT
const BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
const TOPIC_BASE = 'cusinato-est';

// Topic structure
export const TOPICS = {
  ACCESS: `${TOPIC_BASE}/command/access`,
  LIGHTS_INDOOR: `${TOPIC_BASE}/command/lights/indoor`,
  LIGHTS_OUTDOOR: `${TOPIC_BASE}/command/lights/outdoor`,
  MANUAL: `${TOPIC_BASE}/command/manual`,
  BACKUP: `${TOPIC_BASE}/command/backup`,
  STATUS: `${TOPIC_BASE}/status`,
};

class MqttService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscribers = new Set();
  }

  /**
   * Connessione al broker MQTT
   */
  connect(onConnect, onError, onMessage) {
    try {
      this.client = mqtt.connect(BROKER_URL, {
        clientId: `cusinato_dashboard_${Math.random().toString(16).substring(2, 8)}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
      });

      this.client.on('connect', () => {
        console.log('✅ MQTT Connesso a', BROKER_URL);
        this.connected = true;
        
        // Sottoscrivi ai topic di interesse (opzionale per status future)
        this.client.subscribe(TOPICS.STATUS, (err) => {
          if (!err) {
            console.log('📡 Sottoscritto a', TOPICS.STATUS);
          }
        });

        if (onConnect) onConnect();
      });

      this.client.on('error', (error) => {
        console.error('❌ MQTT Errore:', error);
        this.connected = false;
        if (onError) onError(error);
      });

      this.client.on('offline', () => {
        console.warn('⚠️ MQTT Offline');
        this.connected = false;
      });

      this.client.on('reconnect', () => {
        console.log('🔄 MQTT Reconnecting...');
      });

      this.client.on('message', (topic, message) => {
        try {
          const payload = JSON.parse(message.toString());
          console.log('📨 Messaggio ricevuto:', topic, payload);
          if (onMessage) onMessage(topic, payload);
        } catch (e) {
          console.error('Errore parsing messaggio:', e);
        }
      });

    } catch (error) {
      console.error('❌ Errore connessione MQTT:', error);
      if (onError) onError(error);
    }
  }

  /**
   * Disconnessione dal broker
   */
  disconnect() {
    if (this.client) {
      this.client.end();
      this.connected = false;
      console.log('🔌 MQTT Disconnesso');
    }
  }

  /**
   * Verifica stato connessione
   */
  isConnected() {
    return this.connected && this.client && !this.client.reconnecting;
  }

  /**
   * Pubblica messaggio generico
   */
  publish(topic, payload) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('MQTT non connesso'));
        return;
      }

      const message = JSON.stringify(payload);
      
      this.client.publish(topic, message, { qos: 1 }, (error) => {
        if (error) {
          console.error('❌ Errore pubblicazione:', error);
          reject(error);
        } else {
          console.log('✉️ Messaggio inviato:', topic, payload);
          resolve();
        }
      });
    });
  }

  /**
   * Invia comando accesso (portoni/cancelli)
   */
  async sendAccessCommand(commandId) {
    const payload = {
      cmd: commandId,
      type: 'access',
      timestamp: new Date().toISOString(),
    };
    
    try {
      await this.publish(TOPICS.ACCESS, payload);
      return { success: true, commandId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Invia comando luci interne (toggle)
   */
  async sendIndoorLightCommand(zoneId, zoneName) {
    const payload = {
      cmd: zoneId,
      type: 'light_indoor_toggle',
      zone: zoneName,
      timestamp: new Date().toISOString(),
    };
    
    try {
      await this.publish(TOPICS.LIGHTS_INDOOR, payload);
      return { success: true, zoneId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Invia comando globale "Spegni Tutto"
   */
  async sendGlobalOffCommand() {
    const payload = {
      cmd: 99,
      type: 'global_off',
      timestamp: new Date().toISOString(),
    };
    
    try {
      await this.publish(TOPICS.LIGHTS_INDOOR, payload);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Invia comando toggle manuale (caldaia/compressore/crepuscolare)
   */
  async sendManualToggle(device, state) {
    const payload = {
      device,
      manual: state,
      timestamp: new Date().toISOString(),
    };
    
    try {
      await this.publish(TOPICS.MANUAL, payload);
      return { success: true, device, state };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Invia comando luci esterne (configurazione)
   */
  async sendOutdoorLightConfig(target, mode, onTime, offTime) {
    const payload = {
      target,
      mode,
      onTime,
      offTime,
      timestamp: new Date().toISOString(),
    };
    
    try {
      await this.publish(TOPICS.LIGHTS_OUTDOOR, payload);
      return { success: true, target };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger backup configurazione PLC
   */
  async triggerBackup() {
    const payload = {
      action: 'backup',
      timestamp: new Date().toISOString(),
    };
    
    try {
      await this.publish(TOPICS.BACKUP, payload);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton
export const mqttService = new MqttService();
export default mqttService;
