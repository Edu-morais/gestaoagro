
export enum Category {
  CRIA = 'Bezerro/Cria',
  RECRIA = 'Gado/Recria',
  ENGORDA = 'Gado/Engorda'
}

export enum CostType {
  LABOR = 'Mão de Obra',
  INPUT = 'Insumo',
  MEDICINE = 'Medicamento',
  FIXED = 'Custo Fixo'
}

export enum TransactionType {
  BUY = 'Compra',
  SELL = 'Venda',
  ABATE = 'Abate',
  DEATH = 'Morte',
  DONATION = 'Doação'
}

export interface Animal {
  id: string;
  tag?: string;
  birthDate: string;
  category: Category;
  batchId: string;
  origin: 'COMPRA' | 'NASCIMENTO';
  purchasePrice: number;
  weightAtEntry?: number;
  weightAtExit?: number;
  status: 'ACTIVE' | 'SOLD' | 'DECEASED' | 'TRASH';
  salePrice?: number;
  saleDate?: string;
}

export interface Batch {
  id: string;
  name: string;
  location: string;
  farmId: string;
}

export interface CostEntry {
  id: string;
  type: CostType;
  description: string;
  amount: number;
  date: string;
  animalId?: string;
  batchId?: string;
  inventoryItemId?: string;
  quantity?: number;
  unit?: string;
  isRecurring?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'FEED' | 'MEDICINE' | 'OTHER';
  quantity: number;
  unit: 'g' | 'kg' | 'dose' | 'un';
  unitCost: number;
  dailyIntakeCalf?: number;  // Bezerro
  dailyIntakeAdult?: number; // Gado Adulto
  lastStockUpdate?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  animalId: string;
  date: string;
  amount: number;
  description?: string;
}
