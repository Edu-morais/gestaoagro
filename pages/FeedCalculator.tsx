
import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Beef, 
  Layers, 
  Package, 
  TrendingUp, 
  AlertCircle, 
  Info,
  ChevronRight,
  Calendar,
  DollarSign,
  X,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Animal, Batch, InventoryItem, Category, CostType, CostEntry } from '../types';

interface FeedCalculatorProps {
  data: {
    animals: Animal[];
    batches: Batch[];
    inventory: InventoryItem[];
    costs: CostEntry[];
  };
  setData: (data: any) => void;
}

const FeedCalculator: React.FC<FeedCalculatorProps> = ({ data, setData }) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(data.batches[0]?.id || '');
  const [selectedFeedId, setSelectedFeedId] = useState<string>(data.inventory.find(i => i.type === 'FEED')?.id || '');
  const [overrideIntake, setOverrideIntake] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedBatch = useMemo(() => 
    data.batches.find(b => b.id === selectedBatchId),
  [data.batches, selectedBatchId]);

  const selectedFeed = useMemo(() => 
    data.inventory.find(i => i.id === selectedFeedId),
  [data.inventory, selectedFeedId]);

  const batchAnimals = useMemo(() => 
    data.animals.filter(a => a.batchId === selectedBatchId && a.status === 'ACTIVE'),
  [data.animals, selectedBatchId]);

  const stats = useMemo(() => {
    const calves = batchAnimals.filter(a => a.category === Category.CRIA);
    const adults = batchAnimals.filter(a => a.category !== Category.CRIA);
    
    const intakeCalf = overrideIntake !== null ? overrideIntake : (selectedFeed?.dailyIntakeCalf || 0);
    const intakeAdult = overrideIntake !== null ? overrideIntake : (selectedFeed?.dailyIntakeAdult || 0);

    const dailyTotal = (calves.length * intakeCalf) + (adults.length * intakeAdult);
    const monthlyTotal = dailyTotal * 30.44;
    const dailyCost = dailyTotal * (selectedFeed?.unitCost || 0);
    
    const daysOfStockLeft = dailyTotal > 0 ? (selectedFeed?.quantity || 0) / dailyTotal : 0;
    const depletionDate = new Date();
    depletionDate.setDate(depletionDate.getDate() + Math.floor(daysOfStockLeft));

    return {
      calfCount: calves.length,
      adultCount: adults.length,
      dailyTotal,
      monthlyTotal,
      dailyCost,
      daysOfStockLeft,
      depletionDate,
      intakeCalf,
      intakeAdult
    };
  }, [batchAnimals, selectedFeed, overrideIntake]);

  const handleRegisterTrato = () => {
    if (!selectedFeed || !selectedBatch || stats.dailyTotal <= 0) return;

    if (selectedFeed.quantity < stats.dailyTotal) {
      alert("Estoque insuficiente para realizar o trato completo!");
      return;
    }

    // 1. Atualizar Estoque (Baixa física apenas)
    const updatedInventory = data.inventory.map(item => {
      if (item.id === selectedFeed.id) {
        return { ...item, quantity: item.quantity - stats.dailyTotal, lastStockUpdate: new Date().toISOString() };
      }
      return item;
    });

    // Nota: Removido a geração de despesa financeira aqui.
    // A despesa agora é registrada no momento da compra (Estoque -> Cadastro Novo).

    setData({
      ...data,
      inventory: updatedInventory
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Calculadora de Ração</h1>
          <p className="text-gray-500">Gestão automática de consumo e custos.</p>
        </div>
        
        {showSuccess && (
          <div className="flex items-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-2xl font-bold border border-emerald-200 animate-in zoom-in slide-in-from-top-4">
            <CheckCircle2 size={20} /> Trato registrado com sucesso! (Baixa no estoque concluída)
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configurações */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Layers className="text-emerald-600" size={20} /> Seleção de Lote
            </h3>
            <select 
              value={selectedBatchId} 
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500"
            >
              {data.batches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-blue-600" size={20} /> Seleção de Alimento
            </h3>
            <select 
              value={selectedFeedId} 
              onChange={(e) => {
                setSelectedFeedId(e.target.value);
                setOverrideIntake(null);
              }}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              {data.inventory.filter(i => i.type === 'FEED').map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.unit})</option>
              ))}
            </select>
            
            {selectedFeed && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-700 uppercase mb-2">Padrão p/ {selectedFeed.name}</p>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-600">Bezerro/Cria:</span>
                  <span className="font-bold text-blue-900">{selectedFeed.dailyIntakeCalf} {selectedFeed.unit}/dia</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Recria/Engorda:</span>
                  <span className="font-bold text-blue-900">{selectedFeed.dailyIntakeAdult} {selectedFeed.unit}/dia</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
             <div className="flex items-center gap-2 text-emerald-400">
               <Zap size={24} className="fill-emerald-400" />
               <h4 className="font-black text-lg uppercase tracking-widest">Registrar Trato</h4>
             </div>
             <p className="text-sm opacity-80 leading-relaxed font-medium">
               Com base nos {batchAnimals.length} animais do lote <b>{selectedBatch?.name}</b>, o consumo calculado é de <b>{stats.dailyTotal.toFixed(1)} {selectedFeed?.unit}</b>.
             </p>
             <button 
              onClick={handleRegisterTrato}
              disabled={!selectedFeed || stats.dailyTotal <= 0}
              className="w-full py-5 bg-emerald-400 text-emerald-950 font-black rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:bg-emerald-300 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
             >
               DAR BAIXA NO ESTOQUE
             </button>
             <p className="text-[10px] text-center text-emerald-400/60 font-bold uppercase tracking-widest">
               O custo financeiro já foi reconhecido na compra do insumo.
             </p>
          </div>
        </div>

        {/* Resultados e Projeções */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Projeção do Trato Automática</h3>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-black uppercase">
                <Calculator size={14}/> Cálculo Real-Time
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2 group">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Consumo Hoje</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors">{stats.dailyTotal.toFixed(1)}</span>
                  <span className="text-gray-400 font-bold text-xl">{selectedFeed?.unit || 'kg'}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                  <TrendingUp size={10}/> Total Lote
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Investimento Diário</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-400 text-xl font-bold">R$</span>
                  <span className="text-5xl font-black text-emerald-600">{stats.dailyCost.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold">Custo médio: R$ {selectedFeed?.unitCost.toFixed(2)}/{selectedFeed?.unit}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Consumo 30 dias</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-blue-600">{stats.monthlyTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  <span className="text-gray-400 font-bold">{selectedFeed?.unit || 'kg'}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Projeção de Abastecimento</p>
              </div>
            </div>

            <div className="mt-10 p-8 bg-gray-50 rounded-3xl border border-gray-100">
               <div className="flex items-center justify-between mb-6">
                 <h4 className="font-black text-gray-800 uppercase tracking-tight flex items-center gap-2"><Beef size={20}/> Detalhamento por Animal</h4>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Média do Lote</div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between border border-transparent hover:border-emerald-200 transition-all">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center font-black text-lg">C</div>
                     <div>
                       <p className="text-sm font-black text-gray-900">Bezerros / Cria</p>
                       <p className="text-xs text-gray-500 font-medium">{stats.calfCount} animais</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-black text-lg text-gray-900">{(stats.calfCount * stats.intakeCalf).toFixed(1)} <span className="text-[10px] text-gray-400">{selectedFeed?.unit}</span></p>
                     <p className="text-[10px] font-bold text-emerald-600 uppercase">{stats.intakeCalf} /cab/dia</p>
                   </div>
                 </div>

                 <div className="bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between border border-transparent hover:border-emerald-200 transition-all">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-lg">A</div>
                     <div>
                       <p className="text-sm font-black text-gray-900">Recria / Engorda</p>
                       <p className="text-xs text-gray-500 font-medium">{stats.adultCount} animais</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-black text-lg text-gray-900">{(stats.adultCount * stats.intakeAdult).toFixed(1)} <span className="text-[10px] text-gray-400">{selectedFeed?.unit}</span></p>
                     <p className="text-[10px] font-bold text-emerald-600 uppercase">{stats.intakeAdult} /cab/dia</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Card de Alerta de Estoque Dinâmico */}
          {selectedFeed && (
            <div className={`p-8 rounded-3xl shadow-lg border-2 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${stats.daysOfStockLeft < 7 ? 'bg-red-50 border-red-200 shadow-red-100' : 'bg-white border-blue-50'}`}>
              <div className="flex items-center gap-6 text-center md:text-left">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${stats.daysOfStockLeft < 7 ? 'bg-red-200 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  {stats.daysOfStockLeft < 7 ? <AlertCircle size={40} className="animate-bounce" /> : <Calendar size={40} />}
                </div>
                <div>
                  <h4 className={`text-2xl font-black ${stats.daysOfStockLeft < 7 ? 'text-red-900' : 'text-blue-900'}`}>
                    {stats.daysOfStockLeft < 7 ? 'Ruptura Próxima!' : 'Estoque Saudável'}
                  </h4>
                  <p className={`text-sm font-medium ${stats.daysOfStockLeft < 7 ? 'text-red-700' : 'text-blue-700 opacity-70'}`}>
                    Duração estimada do estoque de <b>{selectedFeed.name}</b>: <b>{Math.floor(stats.daysOfStockLeft)} dias</b>.
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right px-8 py-4 bg-white/50 rounded-2xl">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${stats.daysOfStockLeft < 7 ? 'text-red-500' : 'text-blue-500'}`}>Data de Reposição</p>
                <p className={`text-3xl font-black ${stats.daysOfStockLeft < 7 ? 'text-red-900' : 'text-blue-900'}`}>
                  {stats.depletionDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedCalculator;
