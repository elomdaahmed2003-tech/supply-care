// ============= Material Types =============
export type MaterialType = 'titanium' | 'stainless';

export const MATERIAL_LABELS: Record<MaterialType, string> = {
  titanium: 'تيتانيوم',
  stainless: 'ستانلس ستيل',
};

// ============= Item Categories =============
export type ItemCategory = 
  | 'screws' 
  | 'plates' 
  | 'rods' 
  | 'wires' 
  | 'nails' 
  | 'instruments' 
  | 'consumables';

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  screws: 'براغي',
  plates: 'شرائح',
  rods: 'قضبان',
  wires: 'أسلاك',
  nails: 'مسامير نخاعية',
  instruments: 'أدوات جراحية',
  consumables: 'مستهلكات',
};

// ============= Diameter Options =============
export const DIAMETER_OPTIONS = [
  '2.0mm', '2.4mm', '2.7mm', '3.5mm', '4.0mm', '4.5mm', '5.0mm', '6.5mm'
] as const;

// ============= Length Options =============
export const LENGTH_OPTIONS = [
  '12mm', '14mm', '16mm', '18mm', '20mm', '22mm', '24mm', '26mm', 
  '28mm', '30mm', '32mm', '34mm', '36mm', '38mm', '40mm', '45mm', 
  '50mm', '55mm', '60mm'
] as const;

// ============= Plate Length Options =============
export const PLATE_LENGTH_OPTIONS = [
  '4-hole', '6-hole', '8-hole', '10-hole', '12-hole', '14-hole', '16-hole'
] as const;

// ============= Inventory Item =============
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: ItemCategory;
  
  // Multi-variant attributes
  material?: MaterialType;
  diameter?: string;
  length?: string;
  
  // Stock
  quantity: number;
  minStock: number;
  
  // Dual Pricing
  basePrice: number; // Fixed - minimum threshold
  sellingPrice: number; // Variable - negotiated price
  
  // Tracking
  lastMovementDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// ============= Stock Status =============
export type StockStatus = 'low' | 'medium' | 'good';

export function getStockStatus(quantity: number, minStock: number): StockStatus {
  if (quantity <= minStock) return 'low';
  if (quantity <= minStock * 2) return 'medium';
  return 'good';
}

// ============= Dead Stock Calculation =============
export function isDeadStock(lastMovementDate: Date, thresholdMonths: number): boolean {
  const now = new Date();
  const diffMonths = (now.getFullYear() - lastMovementDate.getFullYear()) * 12 
    + (now.getMonth() - lastMovementDate.getMonth());
  return diffMonths >= thresholdMonths;
}

// ============= Plate Cutting =============
export interface PlateCuttingResult {
  originalItem: InventoryItem;
  newItem: InventoryItem;
  originalNewQuantity: number;
  newItemQuantity: number;
  costAdjustment: number;
}

export function calculatePlateCuttingCost(
  originalLength: string, 
  newLength: string, 
  basePrice: number
): number {
  // Extract hole count from length strings
  const originalHoles = parseInt(originalLength.replace('-hole', ''));
  const newHoles = parseInt(newLength.replace('-hole', ''));
  
  if (isNaN(originalHoles) || isNaN(newHoles) || newHoles >= originalHoles) {
    return basePrice;
  }
  
  // Proportional cost calculation
  return Math.round((basePrice * newHoles / originalHoles) * 100) / 100;
}

// ============= Supplier =============
export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

// ============= Doctor/Surgeon =============
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
}

// ============= Surgery Record =============
export interface Surgery {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  date: Date;
  type: string;
  items: SurgeryItem[];
  totalBaseValue: number;
  totalSellingValue: number;
  profit: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface SurgeryItem {
  itemId: string;
  itemName: string;
  quantity: number;
  basePrice: number;
  sellingPrice: number;
}

// ============= Purchase =============
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
  createdBy: string;
  createdAt: Date;
  isLocked: boolean;
}

// ============= Sale/Consumption =============
export interface Sale {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  basePrice: number;
  sellingPrice: number;
  totalBaseValue: number;
  totalSellingValue: number;
  date: Date;
  type: 'sale' | 'usage' | 'surgery';
  surgeryId?: string;
  doctorId?: string;
  doctorName?: string;
  patientName?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  isLocked: boolean;
}

// ============= Dashboard Stats =============
export interface DashboardStats {
  totalInventoryValue: number;
  totalSKUs: number;
  lowStockCount: number;
  deadStockCount: number;
  totalPurchases: number;
  totalSales: number;
  totalProfit: number;
}

// ============= Margin Validation =============
export interface MarginValidation {
  isValid: boolean;
  message?: string;
  marginPercentage: number;
}

export function validateMargin(basePrice: number, sellingPrice: number): MarginValidation {
  if (sellingPrice < basePrice) {
    return {
      isValid: false,
      message: 'تحذير حرج: سعر البيع أقل من السعر الأساسي!',
      marginPercentage: ((sellingPrice - basePrice) / basePrice) * 100,
    };
  }
  return {
    isValid: true,
    marginPercentage: ((sellingPrice - basePrice) / basePrice) * 100,
  };
}

// ============= System Settings =============
export interface SystemSettings {
  deadStockThresholdMonths: number;
  lowStockAlertEnabled: boolean;
  marginWarningEnabled: boolean;
}
