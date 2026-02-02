export interface InventoryItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  unitCost: number;
  minStock: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  date: Date;
  notes?: string;
}

export interface Sale {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  date: Date;
  type: 'sale' | 'usage';
  notes?: string;
}

export interface DashboardStats {
  totalInventoryValue: number;
  totalSKUs: number;
  lowStockCount: number;
  totalPurchases: number;
  totalSales: number;
}

export type StockStatus = 'low' | 'medium' | 'good';

export function getStockStatus(quantity: number, minStock: number): StockStatus {
  if (quantity <= minStock) return 'low';
  if (quantity <= minStock * 2) return 'medium';
  return 'good';
}
