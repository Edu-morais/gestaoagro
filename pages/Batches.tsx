
import React, { useState, useEffect, useMemo } from 'react';
import { Layers, MapPin, PlusCircle, ArrowRightLeft, X, Users, DollarSign, Beef, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Batch, Animal, CostEntry } from '../types';

interface BatchesProps {
  data: { batches: Batch[]; animals: Animal[]; costs: CostEntry[] };
  setData: (data: any) => void;
}

const Batches: React.FC<BatchesProps> = ({ data, setData }) => {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [targetBatchId, setTargetBatchId] = useState('');

  const [newBatch, setNewBatch] = useState({ name: '', location: '' });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') {
        setSelectedBatch(null);
        setIsCreateModalOpen(false);
        setIsDeleteConfirmOpen(false);
        setIsTransferModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const batchToAdd: Batch = {
      ...newBatch,
      id: Math.random().toString(36).substr(2, 9),
      farmId: 'farm-1'
    };
    setData({ ...data, batches: [...data.batches, batchToAdd] });
    setIsCreateModalOpen(false);
    setNewBatch({ name: '', location: '' });
  };

  const handleTransferAll = (fromId: string, toId: string) => {
    if (!toId) return alert("Selecione um lote de destino.");
    
    const updatedAnimals = data.animals.map(a => 
      a.batchId === fromId ? { ...a, batchId: toId } : a
    );
    
    setData({ ...data, animals: updatedAnimals });
    setIsTransferModalOpen(false);
    setIsDeleteConfirmOpen(false);
    
    if (isDeleteConfirmOpen) {
      handleDeleteBatch(fromId);
    }
  };

  const handleDeleteBatch = (id: string) => {
    const batchAnimals = data.animals.filter(a => a.batchId === id && a.status === 'ACTIVE');
    
    if (batchAnimals.length > 0 && data.batches.length > 1) {
      setIsDeleteConfirmOpen(true);
      return;
    }

    const updatedBatches = data.batches.filter(b => b.id !== id);
    setData({ ...data, batches: updatedBatches });
    setSelectedBatch(null);
    setIsDeleteConfirmOpen(false);
  };

  const otherBatches = useMemo(() => 
    data.batches.filter(b => b.id !== selectedBatch?.id), 
  [data.batches, selectedBatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Lotes</h2>
          <p className="text-gray-500">Agrupe animais para facilitar o manejo e rateio de custos.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 transition-all">
          <PlusCircle size={20} /> Novo Lote
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.batches.map(batch => {
          const batchAnimals = data.animals.filter(a => a.batchId === batch.id && a.status === 'ACTIVE');
          
          return (
            <div 
              key={batch.id} 
              onClick={() => setSelectedBatch(batch)}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Layers size={28} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{batch.name}</h3>
              <div className="flex items-center gap-2 text-gray-500 mb-6">
                <MapPin size={16} /> <span className="text-sm font-medium">{batch.location}</span>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div>
                  <p className="text-3xl font-black text-emerald-600">{batchAnimals.length}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase">Cabeças Ativas</p>
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Beef size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Criar Lote */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6">Novo Lote / Piquete</h3>
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Lote</label>
                <input required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl" placeholder="Ex: Lote Engorda A" value={newBatch.name} onChange={e => setNewBatch({...newBatch, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Localização / Pasto</label>
                <input required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl" placeholder="Ex: Piquete 12" value={newBatch.location} onChange={e => setNewBatch({...newBatch, location: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg">Criar Lote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detalhes do Lote */}
      {selectedBatch && !isDeleteConfirmOpen && !isTransferModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 bg-emerald-800 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{selectedBatch.name}</h3>
                <p className="text-emerald-300 text-sm flex items-center gap-1"><MapPin size={14}/> {selectedBatch.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDeleteBatch(selectedBatch.id)} className="p-2 hover:bg-red-600 rounded-full transition-colors text-emerald-200 hover:text-white" title="Excluir Lote">
                   <Trash2 size={20} />
                </button>
                <button onClick={() => setSelectedBatch(null)} className="p-2 hover:bg-emerald-700 rounded-full"><X size={24} /></button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-6 rounded-2xl text-center border border-emerald-100">
                  <Beef className="mx-auto mb-2 text-emerald-600" size={32} />
                  <p className="text-2xl font-black text-emerald-900">{data.animals.filter(a => a.batchId === selectedBatch.id && a.status === 'ACTIVE').length}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Animais Ativos</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl text-center border border-blue-100">
                  <DollarSign className="mx-auto mb-2 text-blue-600" size={32} />
                  <p className="text-2xl font-black text-blue-900">R$ {data.costs.filter(c => c.batchId === selectedBatch.id).reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Investimento no Lote</p>
                </div>
                <button 
                  onClick={() => setIsTransferModalOpen(true)}
                  className="bg-orange-50 p-6 rounded-2xl text-center border border-orange-100 hover:bg-orange-100 transition-all group"
                >
                  <ArrowRightLeft className="mx-auto mb-2 text-orange-600 group-hover:rotate-180 transition-transform duration-500" size={32} />
                  <p className="text-sm font-bold text-orange-900">Remanejar Tudo</p>
                  <p className="text-[10px] font-bold text-orange-600 uppercase">Mover Animais</p>
                </button>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Beef size={18}/> Lista de Animais no Lote</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {data.animals.filter(a => a.batchId === selectedBatch.id && a.status === 'ACTIVE').map(a => (
                    <div key={a.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <p className="font-bold text-gray-800 text-sm">{a.tag || "S/B"}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{a.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão com Remanejamento */}
      {isDeleteConfirmOpen && selectedBatch && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Excluir Lote: {selectedBatch.name}?</h3>
            <p className="text-gray-500 mb-6">
              Este lote possui <b>{data.animals.filter(a => a.batchId === selectedBatch.id && a.status === 'ACTIVE').length} animais ativos</b>. Para onde deseja remanejar o plantel?
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Lote de Destino</label>
                <select 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500"
                  value={targetBatchId}
                  onChange={e => setTargetBatchId(e.target.value)}
                >
                  <option value="">Selecione um lote destino...</option>
                  {otherBatches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.location})</option>)}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl">Voltar</button>
                <button 
                  disabled={!targetBatchId}
                  onClick={() => handleTransferAll(selectedBatch.id, targetBatchId)} 
                  className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50"
                >
                  Remanejar e Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Remanejamento Simples */}
      {isTransferModalOpen && selectedBatch && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><ArrowRightLeft size={24} className="text-orange-600"/> Transferir Animais</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Mover todos os animais do <b>{selectedBatch.name}</b> para outro lote.
            </p>
            
            <div className="space-y-4">
              <select 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700"
                value={targetBatchId}
                onChange={e => setTargetBatchId(e.target.value)}
              >
                <option value="">Destino...</option>
                {otherBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              
              <div className="flex gap-3">
                <button onClick={() => setIsTransferModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancelar</button>
                <button 
                  disabled={!targetBatchId}
                  onClick={() => handleTransferAll(selectedBatch.id, targetBatchId)} 
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                >
                  Confirmar Transferência
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;
