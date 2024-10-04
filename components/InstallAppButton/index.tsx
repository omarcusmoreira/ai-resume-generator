'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallAppButton: React.FC = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Verifica se o dispositivo é iOS
    //eslint-disable-next-line
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou o prompt de instalação');
        } else {
          console.log('Usuário recusou o prompt de instalação');
        }
        setDeferredPrompt(null);
      });
    }
  };

  if (isIOS) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Para instalar este app no seu iPhone:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Toque no botão de compartilhar no Safari</li>
          <li>Role para baixo e toque em  `&#34;`Adicionar à Tela de Início `&#34;`</li>
          <li>Toque em  `&#34;`Adicionar `&#34;` no canto superior direito</li>
        </ol>
      </div>
    );
  }

  if (!deferredPrompt) {
    return null;
  }

  return (
    <Button variant='ai' onClick={handleInstallClick} className="install-button">
      Instalar App
    </Button>
  );
};

export default InstallAppButton;