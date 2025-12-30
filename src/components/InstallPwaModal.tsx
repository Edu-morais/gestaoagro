import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPwaModal: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            console.log("PWA: beforeinstallprompt event fired!");
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);

            // Check if dismissed previously
            const dismissed = localStorage.getItem('install_pwa_dismissed');
            if (!dismissed) {
                setIsVisible(true);
            } else {
                console.log("PWA: Prompt dismissed by user preference");
            }
        };

        console.log("PWA: Adding event listener");
        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('install_pwa_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] animate-fade-in-up">
            <div className="bg-white rounded-lg shadow-xl border border-emerald-200 p-4 max-w-sm flex items-start gap-4">
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <Download size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Instalar Aplicativo</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Instale o AgroSistem no seu computador para uma experiência tela cheia, sem barras de navegador.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleInstallClick}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                        >
                            Instalar Agora
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="text-gray-500 hover:text-gray-700 px-3 py-1.5 text-sm font-medium"
                        >
                            Agora não
                        </button>
                    </div>
                </div>
                <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default InstallPwaModal;
