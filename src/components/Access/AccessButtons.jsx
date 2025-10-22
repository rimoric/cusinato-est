import React, { useState } from 'react';
import { DoorOpen } from 'lucide-react';
import { Button } from '../Common';
import { useMqtt } from '../../hooks';

// Mappatura accessi
const ACCESS_COMMANDS = [
  { id: 40, name: 'Portone Sud Ovest', position: 'south-west' },
  { id: 41, name: 'Portone Sud Est', position: 'south-east' },
  { id: 42, name: 'Portone Est', position: 'east' },
  { id: 43, name: 'Portone Ovest', position: 'west' },
  { id: 44, name: 'Cancello Sud', position: 'south' },
  { id: 45, name: 'Cancello Nord', position: 'north' },
  { id: 46, name: 'Cancelletto', position: 'pedestrian' },
  { id: 47, name: 'Porta Uffici', position: 'office' },
];

/**
 * Componente AccessButtons - Controllo accessi (portoni/cancelli)
 */
const AccessButtons = () => {
  const { sendAccessCommand, connected } = useMqtt();
  const [loadingId, setLoadingId] = useState(null);
  const [justClickedId, setJustClickedId] = useState(null);

  const handleAccessClick = async (id, name) => {
    if (!connected || loadingId) return;

    setLoadingId(id);
    setJustClickedId(id);

    try {
      await sendAccessCommand(id, name);
      
      // Feedback visivo: ritorna normale dopo 2 secondi
      setTimeout(() => {
        setJustClickedId(null);
      }, 2000);
    } catch (error) {
      console.error('Errore invio comando:', error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {ACCESS_COMMANDS.map((access) => {
        const isLoading = loadingId === access.id;
        const isJustClicked = justClickedId === access.id;

        return (
          <Button
            key={access.id}
            variant={isJustClicked ? 'success' : 'primary'}
            onClick={() => handleAccessClick(access.id, access.name)}
            disabled={!connected || isLoading}
            className="min-h-[80px] flex-col"
          >
            <DoorOpen className="w-6 h-6" />
            <span className="text-sm font-semibold text-center">
              {access.name}
            </span>
            <span className="text-xs opacity-75">
              [{access.id}]
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default AccessButtons;
