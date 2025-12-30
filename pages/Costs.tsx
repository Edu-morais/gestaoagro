
import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  PlusCircle,
  Repeat,
  X,
  AlertCircle,
  Edit3,
  Trash2,
  Filter,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';
import { CostEntry, CostType, Animal, Batch, AppState } from '../types';

interface CostsProps {
  data: AppState;
  setData: React.Dispatch<React.SetStateAction<AppState>>;
}

type TabType = 'all' | 'one-time' | 'recurring';

const Costs: React.FC<CostsProps> = ({ data, setData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [costToDelete, setCostToDelete] = useState<CostEntry | null>(null);
  const [editingCost, setEditingCost] = useState<CostEntry | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newCost, setNewCost] = useState<Partial<CostEntry>>({
    type: CostType.INPUT,
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setEditingCost(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();

    // Classificação automática: Mão de Obra e Custo Fixo são tratados como recorrentes.
    const autoIsRecurring = newCost.type === CostType.LABOR || newCost.type === CostType.FIXED;

    setData(prev => {
      if (editingCost) {
        const updatedCosts = prev.costs.map((c: CostEntry) =>
          c.id === editingCost.id ? { ...newCost, isRecurring: autoIsRecurring, id: c.id } as CostEntry : c
        );
        return { ...prev, costs: updatedCosts };
      } else {
        const entry: CostEntry = {
          ...newCost,
          isRecurring: autoIsRecurring,
          id: Math.random().toString(36).substr(2, 9)
        } as CostEntry;
        return { ...prev, costs: [entry, ...prev.costs] };
      }
    });
    setIsModalOpen(false);
    setEditingCost(null);
  };

  const handleEdit = (cost: CostEntry) => {
    setEditingCost(cost);
    setNewCost(cost);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (!costToDelete) return;
    setData(prev => ({
      ...prev,
      costs: prev.costs.filter((c: CostEntry) => c.id !== costToDelete.id)
    }));
    setIsDeleteModalOpen(false);
    setCostToDelete(null);
    setIsModalOpen(false);
    setEditingCost(null);
  };

  const filteredCosts = useMemo(() => {
    return data.costs.filter(cost => {
      const matchesSearch = !searchTerm || cost.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Categorização automática para as abas
      const isActuallyRecurring = cost.type === CostType.LABOR || cost.type === CostType.FIXED;

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'recurring' && isActuallyRecurring) ||
        (activeTab === 'one-time' && !isActuallyRecurring);

      return matchesSearch && matchesTab;
    });
  }, [data.costs, searchTerm, activeTab]);

  const totalFiltered = useMemo(() =>
    filteredCosts.reduce((acc, curr) => acc + curr.amount, 0),
    [filteredCosts]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Financeiro</h2>
          <p className="text-gray-500 font-medium">Controle de despesas da fazenda.</p>
        </div>
        <button
          onClick={() => {
            setEditingCost(null);
            setNewCost({ type: CostType.INPUT, description: '', amount: 0, date: new Date().toISOString().split('T')[0] });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg hover:scale-[1.02]"
        >
          <PlusCircle size={20} /> Novo Lançamento
        </button>
      </div>

      <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('all')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'all' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-400'}`}>TODAS</button>
        <button onClick={() => setActiveTab('one-time')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'one-time' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-400'}`}>AVULSAS (INSUMOS/MED)</button>
        <button onClick={() => setActiveTab('recurring')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'recurring' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-400'}`}>RECORRENTES (M.O/FIXO)</button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex items-center gap-4">
        <Search className="text-gray-300" />
        <input type="text" placeholder="Pesquisar despesa..." className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-gray-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-900 text-white p-7 rounded-[2rem] shadow-lg">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Visível</p>
          <h3 className="text-4xl font-black">R$ {totalFiltered.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {filteredCosts.length > 0 ? filteredCosts.map((cost) => (
          <div key={cost.id} onClick={() => handleEdit(cost)} className="p-6 hover:bg-emerald-50/50 transition-all flex items-center justify-between group cursor-pointer border-l-4 border-transparent hover:border-emerald-500">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center ${cost.type === CostType.LABOR || cost.type === CostType.FIXED ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {cost.type === CostType.LABOR || cost.type === CostType.FIXED ? <Repeat size={24} /> : <DollarSign size={24} />}
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg tracking-tight">{cost.description}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(cost.date).toLocaleDateString()} • {cost.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <p className="text-2xl font-black text-red-600 tracking-tighter">- R$ {cost.amount.toLocaleString()}</p>
              <Edit3 size={16} className="text-gray-300 opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        )) : (
          <div className="p-24 text-center text-gray-300">
            <DollarSign size={64} className="mx-auto opacity-10 mb-4" />
            <p className="font-bold text-sm uppercase">Nenhum registro encontrado.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">{editingCost ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingCost(null); }}><X size={24} /></button>
            </div>

            <form onSubmit={handleAddCost} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Categoria</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(CostType).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewCost({ ...newCost, type })}
                        className={`p-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${newCost.type === type ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descrição</label>
                  <input required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Ex: Pagamento Mensal" value={newCost.description} onChange={e => setNewCost({ ...newCost, description: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Data</label>
                    <input type="date" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" value={newCost.date} onChange={e => setNewCost({ ...newCost, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Valor (R$)</label>
                    <input type="number" step="0.01" required className="w-full p-4 bg-emerald-50 border-none text-emerald-900 font-black rounded-2xl text-2xl" value={newCost.amount || ''} onChange={e => setNewCost({ ...newCost, amount: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {editingCost && (
                  <button type="button" onClick={() => { setCostToDelete(editingCost); setIsDeleteModalOpen(true); }} className="p-4 bg-red-50 text-red-600 rounded-2xl"><Trash2 size={24} /></button>
                )}
                <button type="submit" className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl uppercase">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-10 shadow-2xl text-center">
            <AlertCircle size={48} className="mx-auto text-red-600 mb-6" />
            <h3 className="text-2xl font-black mb-2">Excluir?</h3>
            <p className="text-gray-500 mb-8">Deseja apagar este registro permanentemente?</p>
            <div className="flex gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl">Não</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl">Sim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Costs;
