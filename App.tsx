LayoutDashboard,
  Layers,
  History,
  DollarSign,
  Package,
  BarChart3,
  Menu,
  X,
  Download,
  User
} from 'lucide-react';
import { loadData, saveData, INITIAL_DATA } from './db';
import Dashboard from './pages/Dashboard';
import Animals from './pages/Animals';
import SoldAnimals from './pages/SoldAnimals';
import Costs from './pages/Costs';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import type { AppState } from './types';
import InstallPwaModal from './src/components/InstallPwaModal';
import ReloadPrompt from './src/components/ReloadPrompt';

function App() {
  const [data, setData] = useState<AppState>(INITIAL_DATA as unknown as AppState);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallAvailable, setIsInstallAvailable] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const state = await loadData();
      setData(state as unknown as AppState);
      setIsLoading(false);
    };
    initData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveData(data);
    }
  }, [data, isLoading]);

  useEffect(() => {
    const handler = (e: Event) => {
      console.log("PWA: event fired in App");
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallAvailable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallAvailable(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', name: 'Visão Geral', icon: LayoutDashboard },
    { id: 'animals', name: 'Rebanho', icon: Layers },
    { id: 'sold_animals', name: 'Histórico de Vendas', icon: History },
    { id: 'costs', name: 'Despesas', icon: DollarSign },
    { id: 'inventory', name: 'Estoque', icon: Package },
    { id: 'reports', name: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-emerald-900 text-white transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-lg">
              <img src="/logo.png" alt="AgroSistem Logo" className="w-12 h-12 object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight">AgroSistem</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden p-2 hover:bg-emerald-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
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
                    : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                {activeTab === 'dashboard' && 'Visão Geral'}
                {activeTab === 'animals' && 'Gestão de Rebanho'}
                {activeTab === 'sold_animals' && 'Histórico de Vendas'}
                {activeTab === 'costs' && 'Controle de Despesas'}
                {activeTab === 'inventory' && 'Estoque de Insumos'}
                {activeTab === 'reports' && 'Relatórios Gerenciais'}
              </h1>
              <p className="hidden md:block text-gray-400 text-sm">Bem-vindo ao AgroSistem</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isInstallAvailable && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all hover:scale-105"
              >
                <Download size={20} />
                <span className="hidden sm:inline">Instalar App</span>
              </button>
            )}
            <div className="flex items-center gap-2 pl-4 border-l">
              <div className="text-right hidden lg:block">
                <div className="text-sm font-bold text-gray-900">Eduardo</div>
                <div className="text-xs text-gray-400">Administrador</div>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border">
                <User className="text-gray-500" size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto pb-20">
            {activeTab === 'dashboard' && <Dashboard data={data} />}
            {activeTab === 'animals' && <Animals data={data} setData={setData} />}
            {activeTab === 'sold_animals' && <SoldAnimals data={data} />}
            {activeTab === 'costs' && <Costs data={data} setData={setData} />}
            {activeTab === 'inventory' && <Inventory data={data} setData={setData} />}
            {activeTab === 'reports' && <Reports data={data} />}
          </div>
        </main>
      </div>

      <InstallPwaModal />
      <ReloadPrompt />
    </div>
  );
}

export default App;
