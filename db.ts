
import { Animal, Batch, CostEntry, Transaction, InventoryItem, Category, CostType, TransactionType } from './types';

const STORAGE_KEY = 'bovinofinance_data';

interface AppData {
  animals: Animal[];
  batches: Batch[];
  costs: CostEntry[];
  transactions: Transaction[];
  inventory: InventoryItem[];
}

const INITIAL_DATA: AppData = {
  animals: [
    { id: '1', tag: 'B-001', birthDate: '2023-01-15', category: Category.ENGORDA, batchId: 'batch-1', origin: 'COMPRA', purchasePrice: 2500, status: 'ACTIVE' },
    { id: '2', tag: 'B-002', birthDate: '2023-02-10', category: Category.ENGORDA, batchId: 'batch-1', origin: 'COMPRA', purchasePrice: 2600, status: 'ACTIVE' },
    { id: '3', tag: 'B-003', birthDate: '2022-11-05', category: Category.RECRIA, batchId: 'batch-2', origin: 'NASCIMENTO', purchasePrice: 0, status: 'ACTIVE' },
  ],
  batches: [
    { id: 'batch-1', name: 'Lote Confinamento A', location: 'Piquete 05', farmId: 'farm-1' },
    { id: 'batch-2', name: 'Lote Pasto Norte', location: 'Pasto 12', farmId: 'farm-1' },
  ],
  costs: [], // Começa vazio conforme solicitado
  transactions: [],
  inventory: []
};

export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return INITIAL_DATA;
  try {
    const parsed = JSON.parse(stored);
    // Garantir que se a lista de custos estiver vazia, ela continue vazia
    return parsed;
  } catch {
    return INITIAL_DATA;
  }
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
