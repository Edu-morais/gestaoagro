
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Calculator, 
  Download, 
  X, 
  FileText, 
  Beef, 
  TrendingUp, 
  ClipboardList,
  Filter,
  FileSearch,
  DollarSign,
  Printer
} from 'lucide-react';
import { Animal, CostEntry, CostType, Category } from '../types';

interface ReportsProps {
  data: { animals: Animal[]; costs: CostEntry[] };
}

type DatePreset = 'today' | 'week' | 'month' | 'year' | 'custom';

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [datePreset, setDatePreset] = useState<DatePreset>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const now = new Date();
    let start = new Date();
    const end = now.toISOString().split('T')[0];

    if (datePreset === 'today') start = now;
    else if (datePreset === 'week') start.setDate(now.getDate() - 7);
    else if (datePreset === 'month') start.setMonth(now.getMonth() - 1);
    else if (datePreset === 'year') start.setFullYear(now.getFullYear() - 1);

    if (datePreset !== 'custom') {
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end);
    }
  }, [datePreset]);

  const reportData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);

    const periodCosts = data.costs.filter(c => {
      const d = new Date(c.date);
      return d >= start && d <= end;
    });

    const activeAnimals = data.animals.filter(a => a.status === 'ACTIVE');
    const soldInPeriod = data.animals.filter(a => a.status === 'SOLD' && a.saleDate && new Date(a.saleDate) >= start && new Date(a.saleDate) <= end);
    
    const directCosts = periodCosts.filter(c => c.animalId || c.batchId).reduce((a, b) => a + b.amount, 0);
    const fixedCosts = periodCosts.filter(c => !c.animalId && !c.batchId).reduce((a, b) => a + b.amount, 0);
    const totalRevenue = soldInPeriod.reduce((a, b) => a + (b.salePrice || 0), 0);
    const totalInvested = directCosts + fixedCosts;
    const avgCostPerHead = activeAnimals.length > 0 ? totalInvested / activeAnimals.length : 0;
    
    const costsByCategory = Object.values(CostType).map(type => ({
      type,
      amount: periodCosts.filter(c => c.type === type).reduce((sum, c) => sum + c.amount, 0)
    }));

    return { 
      avgCostHead: avgCostPerHead, 
      totalAnimals: activeAnimals.length, 
      soldInPeriod: soldInPeriod.length,
      directCosts, 
      fixedCosts,
      totalInvested,
      totalRevenue,
      costsByCategory
    };
  }, [data, startDate, endDate]);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm print:hidden">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FileSearch className="text-emerald-600" /> Relatório Executivo
          </h2>
          <p className="text-gray-500 font-medium">Análise financeira por período.</p>
        </div>
        
        <div className="flex flex-wrap items-end gap-4">
          <select 
            className="bg-gray-50 border-none rounded-xl px-4 py-2 font-bold"
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value as DatePreset)}
          >
            <option value="today">Hoje</option>
            <option value="week">7 dias</option>
            <option value="month">Mês</option>
            <option value="year">Ano</option>
            <option value="custom">Custom</option>
          </select>

          <button 
            onClick={() => setIsPreviewModalOpen(true)} 
            className="px-6 py-2.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <Download size={18} /> Ver Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReportCard title="Custo Total" value={`R$ ${reportData.totalInvested.toLocaleString()}`} icon={<TrendingUp className="text-orange-600"/>} color="bg-orange-50" />
            <ReportCard title="Receita Vendas" value={`R$ ${reportData.totalRevenue.toLocaleString()}`} icon={<DollarSign className="text-emerald-600"/>} color="bg-emerald-50" />
            <ReportCard title="Custo Médio/Cab." value={`R$ ${reportData.avgCostHead.toLocaleString()}`} icon={<Calculator className="text-blue-600"/>} color="bg-blue-50" />
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Demonstrativo (DRE)</h3>
            <div className="space-y-3">
              <DRELine label="(+) Receita Bruta" value={reportData.totalRevenue} />
              <DRELine label="(-) Custos Operacionais" value={-reportData.directCosts} isNegative />
              <DRELine label="(-) Custos Fixos" value={-reportData.fixedCosts} isNegative />
              <div className="flex justify-between py-5 mt-4 border-t-2 border-emerald-900 font-black text-2xl">
                <span>Saldo Líquido</span>
                <span className={reportData.totalRevenue - reportData.totalInvested >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  R$ {(reportData.totalRevenue - reportData.totalInvested).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">Composição de Gastos</h3>
          <div className="space-y-6">
            {reportData.costsByCategory.map(cat => (
              <div key={cat.type}>
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                  <span>{cat.type}</span>
                  <span>{reportData.totalInvested > 0 ? ((cat.amount / reportData.totalInvested) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${reportData.totalInvested > 0 ? (cat.amount / reportData.totalInvested) * 100 : 0}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center print:hidden">
              <span className="font-bold text-gray-500 text-sm">Documento Oficial de Prestação de Contas</span>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black flex items-center gap-2">
                   <Printer size={16}/> Imprimir PDF
                </button>
                <button onClick={() => setIsPreviewModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-100 p-12 flex justify-center scroll-smooth">
              <div className="bg-white w-full max-w-[210mm] shadow-xl p-16 font-sans print:shadow-none print:p-0">
                <div className="flex items-center gap-2 text-emerald-800 mb-12 border-b pb-8">
                  <Beef size={40} />
                  <span className="text-3xl font-black tracking-tighter">BovinoFinance</span>
                </div>
                
                <h1 className="text-4xl font-black mb-4">Relatório de Gestão</h1>
                <p className="text-gray-500 mb-12">Período: {new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}</p>

                <div className="grid grid-cols-2 gap-8 mb-16">
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Resumo Operacional</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b py-2"><span>Plantel:</span> <b>{reportData.totalAnimals}</b></div>
                      <div className="flex justify-between border-b py-2"><span>Vendas:</span> <b>{reportData.soldInPeriod}</b></div>
                    </div>
                  </div>
                  <div className="bg-emerald-900 text-white p-6 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-emerald-400 mb-2">Resultado Final</p>
                    <p className="text-3xl font-black">R$ {(reportData.totalRevenue - reportData.totalInvested).toLocaleString()}</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-6 border-b pb-2">Demonstrativo Financeiro</h3>
                <table className="w-full mb-12">
                  <tbody className="divide-y text-sm">
                    <tr><td className="py-3">Receita Total de Vendas</td><td className="py-3 text-right font-bold">R$ {reportData.totalRevenue.toLocaleString()}</td></tr>
                    <tr><td className="py-3">Custos Operacionais Incorridos</td><td className="py-3 text-right text-red-600">- R$ {reportData.directCosts.toLocaleString()}</td></tr>
                    <tr><td className="py-3">Custos Fixos e Administrativos</td><td className="py-3 text-right text-red-600">- R$ {reportData.fixedCosts.toLocaleString()}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReportCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
      <p className="text-xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

const DRELine = ({ label, value, isNegative }: any) => (
  <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-gray-500 font-bold text-sm">{label}</span>
    <span className={`font-black ${isNegative ? 'text-red-500' : 'text-gray-900'}`}>R$ {Math.abs(value).toLocaleString()}</span>
  </div>
);

export default Reports;
