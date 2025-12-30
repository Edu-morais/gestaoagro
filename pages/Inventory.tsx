
import React, { useState, useEffect, useMemo } from 'react';
import { Package, PlusCircle, X, Edit3, Baby, Beef, Trash2, AlertCircle, TrendingUp, DollarSign as DollarIcon } from 'lucide-react';
import { InventoryItem, Animal, Category, CostType, CostEntry, AppState } from '../types';

interface InventoryProps {
  data: AppState;
  setData: React.Dispatch<React.SetStateAction<AppState>>;
}

const Inventory: React.FC<InventoryProps> = ({ data, setData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    type: 'FEED',
    quantity: 0,
    unit: 'kg',
    unitCost: 0,
    dailyIntakeCalf: 0,
    dailyIntakeAdult: 0
  });

  const [totalCostInput, setTotalCostInput] = useState<number>(0);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setEditingItem(null);
        setIsDeleteModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const activeAnimals = useMemo(() => data.animals.filter(a => a.status === 'ACTIVE'), [data.animals]);
  const calfCount = activeAnimals.filter(a => a.category === Category.CRIA).length;
  const adultCount = activeAnimals.filter(a => a.category !== Category.CRIA).length;

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: '', type: 'FEED', quantity: 0, unit: 'kg', unitCost: 0, dailyIntakeCalf: 0, dailyIntakeAdult: 0 });
    setTotalCostInput(0);
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData(item);
    setTotalCostInput(item.quantity * item.unitCost);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const updatedInventory = data.inventory.map(item =>
        item.id === editingItem.id ? { ...formData, id: item.id, lastStockUpdate: new Date().toISOString() } as InventoryItem : item
      );
      setData({ ...data, inventory: updatedInventory });
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      const newItem: InventoryItem = { ...formData, id: newId, lastStockUpdate: new Date().toISOString() } as InventoryItem;

      // Determina o tipo de despesa financeira: Medicamento -> MEDICINE, Alimento -> INPUT (Insumo)
      const costType = newItem.type === 'MEDICINE' ? CostType.MEDICINE : CostType.INPUT;

      // Cria automaticamente uma despesa ao cadastrar novo insumo vinculando o ID
      const newCost: CostEntry = {
        id: Math.random().toString(36).substr(2, 9),
        type: costType,
        description: `Compra: ${newItem.name}`,
        amount: newItem.quantity * newItem.unitCost,
        date: new Date().toISOString().split('T')[0],
        inventoryItemId: newId,
        isRecurring: false // Insumos são sempre avulsos
      };

      setData({
        ...data,
        inventory: [...data.inventory, newItem],
        costs: [newCost, ...data.costs]
      });
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteClick = () => {
    if (!editingItem) return;
    setItemToDelete(editingItem);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    // Atualiza inventário E despesas vinculadas
    const updatedInventory = data.inventory.filter(i => i.id !== itemToDelete.id);
    const updatedCosts = data.costs.filter(c => c.inventoryItemId !== itemToDelete.id);

    setData({
      ...data,
      inventory: updatedInventory,
      costs: updatedCosts
    });

    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleNumberInput = (value: string, field: 'quantity' | 'unitCost' | 'totalCost') => {
    const numValue = parseFloat(value) || 0;

    setFormData(prev => {
      const updated = { ...prev };

      if (field === 'quantity') {
        updated.quantity = numValue;
        setTotalCostInput(numValue * (prev.unitCost || 0));
      } else if (field === 'unitCost') {
        updated.unitCost = numValue;
        setTotalCostInput((prev.quantity || 0) * numValue);
      } else if (field === 'totalCost') {
        setTotalCostInput(numValue);
        if (prev.quantity && prev.quantity > 0) {
          updated.unitCost = numValue / prev.quantity;
        } else {
          updated.unitCost = 0;
        }
      }

      return updated;
    });
  };

  const getPricePerKg = (item: InventoryItem | Partial<InventoryItem>) => {
    if (!item.unitCost) return 0;
    if (item.unit === 'g') return item.unitCost * 1000;
    return item.unitCost;
  };

  const filtered = data.inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Estoque de Insumos</h2>
          <p className="text-gray-500 font-medium">{calfCount} Bezerros | {adultCount} Adultos ativos</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95">
          <PlusCircle size={20} /> Novo Insumo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => (
          <div key={item.id} onClick={() => openEditModal(item)} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm cursor-pointer hover:border-blue-400 transition-all group relative overflow-hidden">
            {item.type === 'FEED' && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <TrendingUp size={10} /> R$ {getPricePerKg(item).toFixed(2)}/kg
              </div>
            )}

            <div className="flex justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><Package size={24} /></div>
              <Edit3 size={16} className="text-gray-300" />
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2 truncate pr-16">{item.name}</h3>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase">{item.unit}</span>
              {item.type === 'FEED' ? (
                <span className="text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded text-emerald-600 uppercase">Ração/Alimento</span>
              ) : item.type === 'MEDICINE' ? (
                <span className="text-[10px] font-bold bg-amber-50 px-2 py-1 rounded text-amber-600 uppercase">Medicamento</span>
              ) : (
                <span className="text-[10px] font-bold bg-gray-50 px-2 py-1 rounded text-gray-600 uppercase">Outros</span>
              )}
            </div>

            <div className="flex justify-between items-end border-t pt-4">
              <div>
                <p className="text-2xl font-black text-gray-900">{item.quantity.toLocaleString()} <span className="text-sm font-medium text-gray-400">{item.unit}</span></p>
                <p className="text-xs text-gray-400">Total em estoque: R$ {(item.quantity * item.unitCost).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-blue-600">R$ {item.unitCost.toFixed(2)}/{item.unit}</p>
                {item.unit === 'g' && <p className="text-[10px] text-gray-400 font-medium">Equiv. R$ {(item.unitCost * 1000).toFixed(2)}/kg</p>}
              </div>
            </div>

            {item.type === 'FEED' && (
              <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-400">
                <div className="flex items-center gap-1"><Baby size={12} /> Bezerro: {item.dailyIntakeCalf}{item.unit}/dia</div>
                <div className="flex items-center gap-1"><Beef size={12} /> Adulto: {item.dailyIntakeAdult}{item.unit}/dia</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Confirmar Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full max-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Insumo?</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Confirma a remoção de <b>{itemToDelete?.name}</b>? Isso também excluirá as despesas de compra associadas no financeiro.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Excluir Tudo</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold tracking-tight">{editingItem ? 'Editar Insumo' : 'Novo Insumo'}</h3>
              {editingItem && (
                <button onClick={handleDeleteClick} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20} /></button>
              )}
            </div>
            <form onSubmit={handleSaveItem} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Nome do Produto</label>
                <input required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Tipo</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-bold" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                    <option value="FEED">Ração / Alimento</option>
                    <option value="MEDICINE">Medicamento</option>
                    <option value="OTHER">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Unidade</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-bold" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value as any })}>
                    <option value="kg">Quilograma (kg)</option>
                    <option value="g">Grama (g)</option>
                    <option value="un">Unidade (un)</option>
                    <option value="dose">Dose</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Quantidade</label>
                  <input type="number" step="0.01" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-black text-lg" value={formData.quantity || ''} onChange={e => handleNumberInput(e.target.value, 'quantity')} />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-black text-blue-500 uppercase tracking-widest mb-1 flex items-center gap-1"><DollarIcon size={10} /> Custo Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor total pago"
                    className="w-full px-4 py-3 bg-blue-50 border-none rounded-xl font-black text-lg text-blue-900 focus:ring-2 focus:ring-blue-600"
                    value={totalCostInput || ''}
                    onChange={e => handleNumberInput(e.target.value, 'totalCost')}
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Custo por {formData.unit}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-gray-400">R$</span>
                    <span className="text-2xl font-black text-gray-900">{(formData.unitCost || 0).toFixed(2)}</span>
                  </div>
                </div>
                {!editingItem && <p className="text-[10px] text-emerald-600 mt-2 font-bold uppercase tracking-tight">✓ Despesa Financeira ({formData.type === 'MEDICINE' ? 'Medicamento' : 'Insumo'}) será criada automaticamente.</p>}
              </div>

              {formData.type === 'FEED' && (
                <div className="p-5 bg-emerald-50 rounded-2xl space-y-4 border border-emerald-100">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">Consumo Diário Esperado</h4>
                    <div className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      R$ {getPricePerKg(formData).toFixed(2)}/kg
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1 flex items-center gap-1"><Baby size={10} /> Bezerros ({formData.unit}/dia)</label>
                      <input type="number" step="0.001" className="w-full px-4 py-2 bg-white border-none rounded-xl text-sm font-bold" value={formData.dailyIntakeCalf || ''} onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, dailyIntakeCalf: val });
                      }} placeholder="0.000" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1 flex items-center gap-1"><Beef size={10} /> Adultos ({formData.unit}/dia)</label>
                      <input type="number" step="0.001" className="w-full px-4 py-2 bg-white border-none rounded-xl text-sm font-bold" value={formData.dailyIntakeAdult || ''} onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, dailyIntakeAdult: val });
                      }} placeholder="0.000" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors uppercase text-xs tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all hover:scale-[1.01] uppercase text-xs tracking-widest">Salvar Estoque</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
