import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

const ReloadPrompt: React.FC = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    if (!needRefresh) return null;

    return (
        <div className="fixed bottom-4 left-4 z-[100] animate-fade-in-up">
            <div className="bg-white rounded-lg shadow-xl border border-blue-200 p-4 max-w-sm flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <RefreshCw size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                        Nova Atualização Disponível
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Uma nova versão do sistema está pronta. Clique para atualizar.
                    </p>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors w-full"
                        onClick={() => updateServiceWorker(true)}
                    >
                        Atualizar e Recarregar
                    </button>
                </div>
                <button className="text-gray-400 hover:text-gray-600" onClick={() => setNeedRefresh(false)}>
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default ReloadPrompt;
