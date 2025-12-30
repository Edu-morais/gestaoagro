
import React, { useMemo } from 'react';
import { 
  TrendingDown, 
  Users, 
  DollarSign, 
  Beef
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Animal, CostEntry, CostType } from '../types';

interface DashboardProps {
  data: {
    animals: Animal[];
    costs: CostEntry[];
  };
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const stats = useMemo(() => {
    const activeAnimals = data.animals.filter(a => a.status === 'ACTIVE');
    const totalAnimals = activeAnimals.length;
    const totalCost = data.costs.reduce((acc, curr) => acc + curr.amount, 0);
    const avgCostPerAnimal = totalAnimals > 0 ? totalCost / totalAnimals : 0;
    
    // Agregação explícita separando Insumo de Medicamento
    const initialAcc = {
      [CostType.INPUT]: 0,
      [CostType.MEDICINE]: 0,
      [CostType.LABOR]: 0,
      [CostType.FIXED]: 0
    };

    const costByType = data.costs.reduce((acc: any, curr) => {
      const type = curr.type;
      if (acc[type] !== undefined) {
        acc[type] += curr.amount;
      } else {
        acc['Outros'] = (acc['Outros'] || 0) + curr.amount;
      }
      return acc;
    }, initialAcc);

    const chartData = Object.entries(costByType)
      .map(([name, value]) => ({ name, value }))
      .filter(item => (item.value as number) > 0)
      .sort((a, b) => (b.value as number) - (a.value as number));

    return { totalAnimals, totalCost, avgCostPerAnimal, chartData };
  }, [data.costs, data.animals]);

  const COLORS = ['#059669', '#fbbf24', '#10b981', '#3b82f6', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel de Controle</h1>
        <p className="text-gray-500 font-medium">Resumo financeiro do plantel.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Animais Ativos" value={stats.totalAnimals.toString()} icon={<Users className="text-blue-600" />} color="bg-blue-50" description="No plantel" />
        <StatCard title="Custo Total" value={`R$ ${stats.totalCost.toLocaleString()}`} icon={<DollarSign className="text-red-600" />} color="bg-red-50" description="Despesas registradas" />
        <StatCard title="Custo Médio Animal" value={`R$ ${stats.avgCostPerAnimal.toFixed(2)}`} icon={<TrendingDown className="text-orange-600" />} color="bg-orange-50" description="Rateio por cabeça" />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-lg text-gray-800 uppercase tracking-widest">Distribuição de Custos (R$)</h3>
          <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase">Dados Reais</div>
        </div>
        <div className="h-80 w-full">
          {stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={140} axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 11, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Valor']}
                />
                <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={40}>
                  {stats.chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 italic">
              <DollarSign size={48} className="opacity-10" />
              <p className="text-sm font-medium">Aguardando novos registros para gerar o gráfico.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string, value: string, icon: React.ReactNode, color: string, description: string}> = ({ title, value, icon, color, description }) => (
  <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 group transition-all duration-300">
    <div className={`${color} p-4 rounded-2xl w-fit mb-5 shadow-sm`}>{icon}</div>
    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
    <h4 className="text-3xl font-black text-gray-900 mb-1">{value}</h4>
    <p className="text-xs text-gray-400 font-medium">{description}</p>
  </div>
);

export default Dashboard;
