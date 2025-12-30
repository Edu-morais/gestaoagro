import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const DownloadModal: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if running in Electron
        const isElectron = typeof window !== 'undefined' && window.ipcRenderer;

        // Only show if NOT in Electron and hasn't been dismissed recently (optional logic)
        if (!isElectron) {
            const dismissed = localStorage.getItem('download_modal_dismissed');
            if (!dismissed) {
                // Show after a short delay
                const timer = setTimeout(() => setIsVisible(true), 2000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('download_modal_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] animate-fade-in-up">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm flex items-start gap-4">
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <Download size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Baixe o App Desktop</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Para maior segurança e performance, instale a versão Desktop. Os dados ficarão salvos no seu computador.
                    </p>
                    <div className="flex gap-2">
                        <a
                            href="https://github.com/tomate-adm/gestaoagro/releases/latest"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                        >
                            Baixar Agora
                        </a>
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

export default DownloadModal;
