// ============= User Roles =============
export type UserRole = 'data_entry' | 'supervisor' | 'stakeholder';

export const ROLE_LABELS: Record<UserRole, string> = {
  data_entry: 'إدخال بيانات',
  supervisor: 'مشرف',
  stakeholder: 'شريك',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  data_entry: 'يمكنه إنشاء السجلات فقط - لا يمكنه التعديل أو الحذف بعد الحفظ',
  supervisor: 'يمكنه تعديل السجلات وأسعار البيع - لا يمكنه تغيير الأسعار الأساسية',
  stakeholder: 'عرض فقط - الوصول للتحليلات والتقارير المالية',
};

// ============= Permission Types =============
export interface RolePermissions {
  // Inventory
  canViewInventory: boolean;
  canCreateInventory: boolean;
  canEditInventory: boolean;
  canDeleteInventory: boolean;
  canEditBasePrice: boolean;
  canEditSellingPrice: boolean;
  canViewPrices: boolean;
  
  // Stock Operations
  canCreateStockIn: boolean;
  canCreateStockOut: boolean;
  canEditAfterSubmit: boolean;
  canDeleteRecords: boolean;
  canPerformPlateCutting: boolean;
  
  // Financial
  canViewFinancials: boolean;
  canViewProfit: boolean;
  canViewAnalytics: boolean;
  
  // Admin
  canManageUsers: boolean;
  canManageSettings: boolean;
}

// ============= Role Permission Matrix =============
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  data_entry: {
    canViewInventory: true,
    canCreateInventory: true,
    canEditInventory: false,
    canDeleteInventory: false,
    canEditBasePrice: false,
    canEditSellingPrice: false,
    canViewPrices: false,
    
    canCreateStockIn: true,
    canCreateStockOut: true,
    canEditAfterSubmit: false,
    canDeleteRecords: false,
    canPerformPlateCutting: false,
    
    canViewFinancials: false,
    canViewProfit: false,
    canViewAnalytics: false,
    
    canManageUsers: false,
    canManageSettings: false,
  },
  
  supervisor: {
    canViewInventory: true,
    canCreateInventory: true,
    canEditInventory: true,
    canDeleteInventory: true,
    canEditBasePrice: false, // CRITICAL: Cannot change base price
    canEditSellingPrice: true,
    canViewPrices: true,
    
    canCreateStockIn: true,
    canCreateStockOut: true,
    canEditAfterSubmit: true,
    canDeleteRecords: true,
    canPerformPlateCutting: true,
    
    canViewFinancials: true,
    canViewProfit: true,
    canViewAnalytics: true,
    
    canManageUsers: false,
    canManageSettings: false,
  },
  
  stakeholder: {
    canViewInventory: true,
    canCreateInventory: false,
    canEditInventory: false,
    canDeleteInventory: false,
    canEditBasePrice: false,
    canEditSellingPrice: false,
    canViewPrices: true,
    
    canCreateStockIn: false,
    canCreateStockOut: false,
    canEditAfterSubmit: false,
    canDeleteRecords: false,
    canPerformPlateCutting: false,
    
    canViewFinancials: true,
    canViewProfit: true,
    canViewAnalytics: true,
    
    canManageUsers: false,
    canManageSettings: false,
  },
};

// ============= Helper Functions =============
export function getPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission];
}
