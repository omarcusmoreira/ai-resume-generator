'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { BeforeInstallPromptEvent } from '@/types';

const InstallAppButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);


  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <Button variant='ai' onClick={handleInstallClick} className="install-button">
      Instalar App
    </Button>
  );
};

export default InstallAppButton;
