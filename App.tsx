
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Beef,
  DollarSign,
  Package,
  BarChart3,
  Menu,
  X,
  History
} from 'lucide-react';
import { loadData, saveData } from './db';
import Dashboard from './pages/Dashboard';
import Animals from './pages/Animals';
import Costs from './pages/Costs';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import SoldAnimals from './pages/SoldAnimals';
import InstallPwaModal from './src/components/InstallPwaModal';
import ReloadPrompt from './src/components/ReloadPrompt';

const App: React.FC = () => {
  const [data, setData] = useState<any>(null); // Initial null to wait for load
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const loaded = await loadData();
      setData(loaded);
      setIsLoading(false);
    };
    initData();
  }, []);

  useEffect(() => {
    if (data) {
      saveData(data); // Will be async safe (fire and forget for now, or handle promise if critical)
    }
  }, [data]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'animals', name: 'Animais', icon: Beef },
    { id: 'sold_animals', name: 'Vendas/Abates', icon: History },
    { id: 'costs', name: 'Despesas', icon: DollarSign },
    { id: 'inventory', name: 'Estoque', icon: Package },
    { id: 'reports', name: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-emerald-800 text-white shadow-md">
        <div className="flex items-center gap-2">
          <Beef className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tight">BovinoFinance</span>
        </div>
        <button onClick={toggleSidebar} className="p-2">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-emerald-900 text-white transition-transform duration-300 ease-in-out transform
        md:translate-x-0 md:static md:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-2 p-6 mb-4">
          <Beef className="w-10 h-10 text-emerald-400" />
          <span className="font-bold text-2xl tracking-tight">BovinoFinance</span>
        </div>

        <nav className="px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${activeTab === item.id
                    ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-950/20'
                    : 'text-emerald-100 hover:bg-emerald-800/50'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative bg-gray-50/50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard data={data} />}
          {activeTab === 'animals' && <Animals data={data} setData={setData} />}
          {activeTab === 'sold_animals' && <SoldAnimals data={data} />}
          {activeTab === 'costs' && <Costs data={data} setData={setData} />}
          {activeTab === 'inventory' && <Inventory data={data} setData={setData} />}
          {activeTab === 'reports' && <Reports data={data} />}
        </div>
      </main>

      <InstallPwaModal />
      <ReloadPrompt />
    </div>
  );
};

export default App;
