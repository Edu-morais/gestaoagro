
import React, { useMemo, useState, useEffect } from 'react';
import { History, TrendingUp, TrendingDown, DollarSign, Calendar, Beef, ArrowUpRight, Scale, X, Layers, Info } from 'lucide-react';
import { Animal, CostEntry, AppState } from '../types';

interface SoldAnimalsProps {
  data: AppState;
}

const SoldAnimals: React.FC<SoldAnimalsProps> = ({ data }) => {
  const [selectedSoldAnimal, setSelectedSoldAnimal] = useState<Animal | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedSoldAnimal(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const soldAnimals = useMemo(() =>
    data.animals.filter(a => a.status === 'SOLD').sort((a, b) =>
      new Date(b.saleDate || 0).getTime() - new Date(a.saleDate || 0).getTime()
    ),
    [data.animals]);

  const stats = useMemo(() => {
    let totalProfit = 0;
    let totalRevenue = 0;
    soldAnimals.forEach(animal => {
      const directCosts = data.costs.filter(c => c.animalId === animal.id).reduce((a, b) => a + b.amount, 0);
      const totalInvestment = animal.purchasePrice + directCosts;
      const profit = (animal.salePrice || 0) - totalInvestment;
      totalProfit += profit;
      totalRevenue += (animal.salePrice || 0);
    });
    return { totalProfit, totalRevenue, count: soldAnimals.length };
  }, [soldAnimals, data.costs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Histórico de Vendas & Abates</h2>
          <p className="text-gray-500">Performance financeira detalhada por animal.</p>
        </div>
        <div className="bg-emerald-900 text-white p-4 rounded-2xl flex items-center gap-6 shadow-lg">
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-300">Lucro Total Acumulado</p>
            <p className="text-xl font-black">R$ {stats.totalProfit.toLocaleString()}</p>
          </div>
          <div className="h-8 w-px bg-emerald-700" />
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-300">Total de Saídas</p>
            <p className="text-xl font-black">{stats.count} cabeças</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {soldAnimals.length > 0 ? soldAnimals.map(animal => {
          const directCosts = data.costs.filter(c => c.animalId === animal.id).reduce((a, b) => a + b.amount, 0);
          const totalInvested = animal.purchasePrice + directCosts;
          const profit = (animal.salePrice || 0) - totalInvested;
          const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

          return (
            <div
              key={animal.id}
              onClick={() => setSelectedSoldAnimal(animal)}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:border-emerald-500 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Beef size={28} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-lg flex items-center gap-2">
                    {animal.tag || "S/B"}
                    <span className="text-xs font-bold uppercase px-2 py-0.5 bg-gray-100 rounded-lg text-gray-500">{animal.category}</span>
                  </h4>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> Saída: {new Date(animal.saleDate || "").toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Gasto</p>
                  <p className="font-bold text-gray-700">R$ {totalInvested.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Venda</p>
                  <p className="font-bold text-emerald-600">R$ {(animal.salePrice || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Lucro Líquido</p>
                  <p className={`font-black text-lg ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    R$ {profit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Peso Saída</p>
                  <p className="font-bold text-blue-700">{animal.weightAtExit || '---'} kg</p>
                </div>
              </div>

              <div className={`p-3 rounded-2xl ${profit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {profit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              </div>
            </div>
          );
        }) : (
          <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
            <History size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium italic">Nenhum registro de venda ou abate encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal Detalhes Animal Vendido */}
      {selectedSoldAnimal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 bg-emerald-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Relatório: {selectedSoldAnimal.tag || "Sem Brinco"}</h3>
                <p className="text-emerald-300 text-sm">Vendido em {new Date(selectedSoldAnimal.saleDate || "").toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedSoldAnimal(null)} className="p-2 hover:bg-emerald-800 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryBox label="Peso Entrada" value={`${selectedSoldAnimal.weightAtEntry || 0} kg`} color="bg-gray-50 text-gray-900" />
                <SummaryBox label="Peso Saída" value={`${selectedSoldAnimal.weightAtExit || 0} kg`} color="bg-blue-50 text-blue-800" />
                <SummaryBox label="Ganho Peso" value={`${(selectedSoldAnimal.weightAtExit || 0) - (selectedSoldAnimal.weightAtEntry || 0)} kg`} color="bg-emerald-50 text-emerald-800" />
                <SummaryBox label="Categoria" value={selectedSoldAnimal.category} color="bg-amber-50 text-amber-800" />
              </div>

              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Resumo Econômico</p>
                  <p className="text-sm text-emerald-600 mb-1">Custo Aquisição: R$ {selectedSoldAnimal.purchasePrice.toLocaleString()}</p>
                  <p className="text-sm text-emerald-600 mb-1">Custo Manejo: R$ {data.costs.filter(c => c.animalId === selectedSoldAnimal.id).reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
                  <p className="text-lg font-black text-emerald-900 mt-2">Investimento: R$ {(selectedSoldAnimal.purchasePrice + data.costs.filter(c => c.animalId === selectedSoldAnimal.id).reduce((a, b) => a + b.amount, 0)).toLocaleString()}</p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Valor Venda</p>
                  <p className="text-3xl font-black text-emerald-900">R$ {selectedSoldAnimal.salePrice?.toLocaleString()}</p>
                  <p className={`text-sm font-bold mt-2 ${((selectedSoldAnimal.salePrice || 0) - (selectedSoldAnimal.purchasePrice + data.costs.filter(c => c.animalId === selectedSoldAnimal.id).reduce((a, b) => a + b.amount, 0))) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    Lucro: R$ {((selectedSoldAnimal.salePrice || 0) - (selectedSoldAnimal.purchasePrice + data.costs.filter(c => c.animalId === selectedSoldAnimal.id).reduce((a, b) => a + b.amount, 0))).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2"><History size={18} /> Histórico de Custos Diretos</h4>
                <div className="space-y-2">
                  {data.costs.filter(c => c.animalId === selectedSoldAnimal.id).length > 0 ?
                    data.costs.filter(c => c.animalId === selectedSoldAnimal.id).map(c => (
                      <div key={c.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl text-sm hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                        <div>
                          <p className="font-bold text-gray-900">{c.description}</p>
                          <p className="text-[10px] text-gray-400">{new Date(c.date).toLocaleDateString()} • {c.type}</p>
                        </div>
                        <span className="font-black text-red-600">R$ {c.amount.toLocaleString()}</span>
                      </div>
                    )) : (
                      <p className="text-center text-gray-400 py-6 italic text-sm">Sem custos diretos registrados além da compra.</p>
                    )}
                </div>
              </div>

              <button onClick={() => setSelectedSoldAnimal(null)} className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors">Fechar Detalhes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryBox = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className={`${color} p-4 rounded-2xl text-center border border-black/5 shadow-sm`}>
    <p className="text-[10px] font-bold uppercase opacity-60 mb-1">{label}</p>
    <p className="text-sm font-black leading-none">{value}</p>
  </div>
);

export default SoldAnimals;
