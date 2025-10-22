import React from 'react';
import { MqttProvider, useMqtt } from './context/MqttContext';
import { useResponsive, useAccordion } from './hooks';
import { Header, Section } from './components/Layout/index';
import { CommandLog } from './components/Common/index';
import { AccessButtons } from './components/Access/index';
import { IndoorLights, OutdoorLights } from './components/Lights';
import { ManualControls } from './components/Controls';

/**
 * Componente Dashboard principale
 */
const Dashboard = () => {
  const { connected, commandLog } = useMqtt();
  const { isMobile } = useResponsive();
  
  // Gestione accordion per mobile
  const { isOpen, toggleSection } = useAccordion(
    ['access', 'lights-indoor', 'lights-outdoor', 'controls'],
    ['access', 'lights-indoor'] // Apri di default Accessi e Luci Interne
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fisso */}
      <Header connected={connected} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Sezione Accessi */}
        <Section
          title="Accessi"
          icon="🚪"
          count={8}
          isOpen={isOpen('access')}
          onToggle={() => toggleSection('access')}
          isMobile={isMobile}
        >
          <AccessButtons />
        </Section>

        {/* Sezione Luci Interne */}
        <Section
          title="Luci Interne"
          icon="💡"
          count={5}
          isOpen={isOpen('lights-indoor')}
          onToggle={() => toggleSection('lights-indoor')}
          isMobile={isMobile}
        >
          <IndoorLights />
        </Section>

        {/* Sezione Controlli Manuali */}
        <Section
          title="Controlli Manuali"
          icon="⚙️"
          count={3}
          isOpen={isOpen('controls')}
          onToggle={() => toggleSection('controls')}
          isMobile={isMobile}
        >
          <ManualControls />
        </Section>

        {/* Sezione Luci Esterne (FASE 2) */}
        <Section
          title="Luci Esterne"
          icon="🌆"
          count={6}
          isOpen={isOpen('lights-outdoor')}
          onToggle={() => toggleSection('lights-outdoor')}
          isMobile={isMobile}
        >
          <OutdoorLights />
        </Section>

        {/* Log Comandi */}
        {commandLog.length > 0 && <CommandLog logs={commandLog} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-600">
          <p>© 2025 Cusinato Est - Dashboard Remota</p>
          <p className="text-xs text-gray-500 mt-1">
            Ampliamento • PLC Beckhoff CX7000 • MQTT
          </p>
        </div>
      </footer>
    </div>
  );
};

/**
 * App component wrapper con MqttProvider
 */
function App() {
  return (
    <MqttProvider>
      <Dashboard />
    </MqttProvider>
  );
}

export default App;
