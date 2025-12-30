
import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Search, X, Trash2, Info, DollarSign, Calendar, Layers, Beef, ArrowUpRight, TrendingUp, TrendingDown, Scale, AlertCircle } from 'lucide-react';
import { Animal, Batch, Category, CostEntry } from '../types';

interface AnimalsProps {
  data: { animals: Animal[]; batches: Batch[]; costs: CostEntry[] };
  setData: (data: any) => void;
}

const Animals: React.FC<AnimalsProps> = ({ data, setData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);

  const [newAnimal, setNewAnimal] = useState<Partial<Animal>>({
    tag: '',
    birthDate: new Date().toISOString().split('T')[0],
    category: Category.CRIA,
    batchId: data.batches[0]?.id || '',
    origin: 'COMPRA',
    purchasePrice: 0,
    weightAtEntry: 0,
    status: 'ACTIVE'
  });

  const [saleData, setSaleData] = useState({ price: 0, weight: 0, date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setSelectedAnimal(null);
        setIsSaleModalOpen(false);
        setIsDeleteModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleAddAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    const animalToAdd: Animal = {
      ...newAnimal,
      id: Math.random().toString(36).substr(2, 9),
      weightAtEntry: Number(newAnimal.weightAtEntry) || 0
    } as Animal;
    setData({ ...data, animals: [...data.animals, animalToAdd] });
    setIsModalOpen(false);
    setNewAnimal({ tag: '', birthDate: new Date().toISOString().split('T')[0], category: Category.CRIA, batchId: data.batches[0]?.id || '', origin: 'COMPRA', purchasePrice: 0, weightAtEntry: 0, status: 'ACTIVE' });
  };

  const handleRegisterSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;
    const updatedAnimals = data.animals.map(a => a.id === selectedAnimal.id ? {
      ...a,
      status: 'SOLD' as const,
      salePrice: saleData.price,
      saleDate: saleData.date,
      weightAtExit: saleData.weight
    } : a);
    setData({ ...data, animals: updatedAnimals });
    setIsSaleModalOpen(false);
    setSelectedAnimal(null);
    setSaleData({ price: 0, weight: 0, date: new Date().toISOString().split('T')[0] });
  };

  const handleDeleteConfirm = () => {
    if (!animalToDelete) return;
    const updatedAnimals = data.animals.filter(a => a.id !== animalToDelete.id);
    // Também remove custos vinculados para integridade
    const updatedCosts = data.costs.filter(c => c.animalId !== animalToDelete.id);
    setData({ ...data, animals: updatedAnimals, costs: updatedCosts });
    setIsDeleteModalOpen(false);
    setAnimalToDelete(null);
    if (selectedAnimal?.id === animalToDelete.id) setSelectedAnimal(null);
  };

  const filteredAnimals = data.animals.filter(a =>
    a.status === 'ACTIVE' &&
    ((a.tag || "").toLowerCase().includes(searchTerm.toLowerCase()) || a.id.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Beef className="text-emerald-600" size={28} />
            Gestão de Rebanho
          </h2>
          <p className="text-gray-500">Controle completo do plantel ativo.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 transition-colors"><PlusCircle size={20} /> Novo Animal</button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input placeholder="Buscar por brinco..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all" />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filteredAnimals.length} Animais Ativos</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Brinco / ID</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Lote</th>
                <th className="px-6 py-4">Peso Entrada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAnimals.map((animal) => {
                const batch = data.batches.find(b => b.id === animal.batchId);
                return (
                  <tr key={animal.id} className="hover:bg-emerald-50/50 cursor-pointer transition-colors" onClick={() => setSelectedAnimal(animal)}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{animal.tag || 'S/B'}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {animal.id.slice(0, 6)}</div>
                    </td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${animal.category === Category.CRIA ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{animal.category}</span></td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{batch?.name || '---'}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{animal.weightAtEntry ? `${animal.weightAtEntry} kg` : '---'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Confirmar Exclusão Animal */}
      {isDeleteModalOpen && animalToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Excluir Animal?</h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              Esta ação é permanente e removerá o animal <b>{animalToDelete.tag || 'S/B'}</b> e todo o seu histórico de custos do sistema.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl">Cancelar</button>
              <button onClick={handleDeleteConfirm} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Detalhes do Animal */}
      {selectedAnimal && !isSaleModalOpen && !isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 bg-emerald-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{selectedAnimal.tag || "Sem Brinco"}</h3>
                <p className="text-xs text-emerald-300 opacity-70">Sistema ID: {selectedAnimal.id}</p>
              </div>
              <button onClick={() => setSelectedAnimal(null)} className="p-2 hover:bg-emerald-800 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailItem icon={<Calendar size={16} />} label="Nascimento" value={new Date(selectedAnimal.birthDate).toLocaleDateString()} />
                <DetailItem icon={<Layers size={16} />} label="Categoria" value={selectedAnimal.category} />
                <DetailItem icon={<Scale size={16} />} label="Peso Entrada" value={`${selectedAnimal.weightAtEntry || 0} kg`} />
                <DetailItem icon={<DollarSign size={16} />} label="Investimento" value={`R$ ${selectedAnimal.purchasePrice.toLocaleString()}`} />
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-800">Custos Acumulados</h4>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg uppercase">Total: R$ {data.costs.filter(c => c.animalId === selectedAnimal.id).reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  {data.costs.filter(c => c.animalId === selectedAnimal.id).map(c => (
                    <div key={c.id} className="flex justify-between p-3 bg-white rounded-xl shadow-sm text-sm">
                      <span className="text-gray-600">{c.description}</span>
                      <span className="font-bold text-red-600">R$ {c.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setIsSaleModalOpen(true)} className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2"><ArrowUpRight size={20} /> Registrar Saída</button>
                <button onClick={() => { setAnimalToDelete(selectedAnimal); setIsDeleteModalOpen(true); }} className="py-4 px-6 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Saída/Venda */}
      {isSaleModalOpen && selectedAnimal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-emerald-800"><ArrowUpRight size={28} /> Registrar Saída: {selectedAnimal.tag}</h3>

            <div className="bg-emerald-50 p-4 rounded-2xl mb-6 border border-emerald-100">
              <div className="flex justify-between text-sm mb-1 text-emerald-700"><span>Custo de Aquisição:</span> <span className="font-bold">R$ {selectedAnimal.purchasePrice.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-emerald-700"><span>Custos de Manejo:</span> <span className="font-bold">R$ {data.costs.filter(c => c.animalId === selectedAnimal.id).reduce((a, b) => a + b.amount, 0).toLocaleString()}</span></div>
              <div className="border-t border-emerald-200 mt-2 pt-2 flex justify-between font-black text-emerald-900 uppercase text-xs"><span>Total Investido:</span> <span>R$ {(selectedAnimal.purchasePrice + data.costs.filter(c => c.animalId === selectedAnimal.id).reduce((a, b) => a + b.amount, 0)).toLocaleString()}</span></div>
            </div>

            <form onSubmit={handleRegisterSale} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Valor Venda (R$)</label>
                  <input type="number" required step="0.01" className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-xl font-black text-emerald-700" value={saleData.price || ''} onChange={e => setSaleData({ ...saleData, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Peso Saída (kg)</label>
                  <input type="number" required step="0.1" className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-xl font-black text-blue-700" value={saleData.weight || ''} onChange={e => setSaleData({ ...saleData, weight: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {saleData.price - (selectedAnimal.purchasePrice + data.costs.filter(c => c.animalId === selectedAnimal.id).reduce((a, b) => a + b.amount, 0)) >= 0 ? <TrendingUp className="text-emerald-600" /> : <TrendingDown className="text-red-600" />}
                  <span className="text-sm font-bold text-gray-600">Lucro Líquido:</span>
                </div>
                <span className={`text-lg font-black ${saleData.price - (selectedAnimal.purchasePrice + data.costs.filter(c => c.animalId === selectedAnimal.id).reduce((a, b) => a + b.amount, 0)) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  R$ {(saleData.price - (selectedAnimal.purchasePrice + data.costs.filter(c => c.animalId === selectedAnimal.id).reduce((a, b) => a + b.amount, 0))).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setIsSaleModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl">Voltar</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg">Confirmar Saída</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Animal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6">Novo Animal</h3>
            <form onSubmit={handleAddAnimal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-400 uppercase">Brinco</label><input className="w-full p-3 bg-gray-50 rounded-xl" placeholder="B-204" value={newAnimal.tag} onChange={e => setNewAnimal({ ...newAnimal, tag: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-gray-400 uppercase">Categoria</label>
                  <select className="w-full p-3 bg-gray-50 rounded-xl font-bold" value={newAnimal.category} onChange={e => setNewAnimal({ ...newAnimal, category: e.target.value as Category })}>
                    <option value={Category.CRIA}>Bezerro (Cria)</option>
                    <option value={Category.RECRIA}>Boi (Recria)</option>
                    <option value={Category.ENGORDA}>Boi (Engorda)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Preço Aquisição (R$)</label>
                  <input type="number" step="0.01" className="w-full p-4 bg-emerald-50 rounded-xl font-black text-emerald-700" value={newAnimal.purchasePrice || ''} placeholder="0,00" onChange={e => setNewAnimal({ ...newAnimal, purchasePrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Peso Inicial (kg)</label>
                  <input type="number" step="0.1" className="w-full p-4 bg-blue-50 rounded-xl font-black text-blue-700" value={newAnimal.weightAtEntry || ''} placeholder="0,0" onChange={e => setNewAnimal({ ...newAnimal, weightAtEntry: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-400 uppercase">Lote</label>
                  <select className="w-full p-3 bg-gray-50 rounded-xl" value={newAnimal.batchId} onChange={e => setNewAnimal({ ...newAnimal, batchId: e.target.value })}>
                    {data.batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-gray-400 uppercase">Nascimento</label><input type="date" className="w-full p-3 bg-gray-50 rounded-xl" value={newAnimal.birthDate} onChange={e => setNewAnimal({ ...newAnimal, birthDate: e.target.value })} /></div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg">Salvar Animal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
    <div className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-bold mb-1">{icon} {label}</div>
    <div className="text-sm font-black text-gray-900">{value}</div>
  </div>
);

export default Animals;
