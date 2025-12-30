import React, { useEffect, useState } from 'react';
import { RefreshCw, Download, X } from 'lucide-react';

const UpdateModal: React.FC = () => {
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'available' | 'downloading' | 'ready'>('idle');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.ipcRenderer) {
            window.ipcRenderer.on('update-available', () => {
                setUpdateStatus('available');
            });

            window.ipcRenderer.on('update-downloaded', () => {
                setUpdateStatus('ready');
            });

            // Optional: Add progress listener if you want to show a bar
            // window.ipcRenderer.on('download-progress', (arg: any) => {
            //   setProgress(arg.percent);
            //   setUpdateStatus('downloading');
            // });
        }
    }, []);

    const handleRestart = () => {
        if (window.ipcRenderer) {
            window.ipcRenderer.send('restart_app');
        }
    };

    if (updateStatus === 'idle') return null;

    return (
        <div className="fixed bottom-4 left-4 z-[100] animate-fade-in-up">
            <div className="bg-white rounded-lg shadow-xl border border-blue-200 p-4 max-w-sm flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <RefreshCw size={24} className={updateStatus === 'downloading' ? 'animate-spin' : ''} />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                        {updateStatus === 'available' && 'Nova atualização disponível'}
                        {updateStatus === 'downloading' && 'Baixando atualização...'}
                        {updateStatus === 'ready' && 'Atualização pronta!'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                        {updateStatus === 'ready'
                            ? 'Reinicie o app para aplicar as mudanças. Seus dados estão seguros.'
                            : 'Uma nova versão está sendo baixada em segundo plano.'}
                    </p>

                    {updateStatus === 'ready' && (
                        <button
                            onClick={handleRestart}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors w-full"
                        >
                            Reiniciar e Atualizar
                        </button>
                    )}
                </div>
                <button onClick={() => setUpdateStatus('idle')} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default UpdateModal;
