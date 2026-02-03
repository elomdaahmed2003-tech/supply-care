import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockInventory } from '@/data/mockData';
import { 
  InventoryItem, 
  getStockStatus, 
  validateMargin,
  CATEGORY_LABELS,
  MATERIAL_LABELS,
  ItemCategory,
  MaterialType,
  calculatePlateCuttingCost,
  PLATE_LENGTH_OPTIONS,
} from '@/types/inventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Filter, Scissors, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Inventory() {
  const { hasPermission, user } = useAuth();
  const canCreate = hasPermission('canCreateInventory');
  const canEdit = hasPermission('canEditInventory');
  const canDelete = hasPermission('canDeleteInventory');
  const canViewPrices = hasPermission('canViewPrices');
  const canEditBasePrice = hasPermission('canEditBasePrice');
  const canEditSellingPrice = hasPermission('canEditSellingPrice');
  const canPerformPlateCutting = hasPermission('canPerformPlateCutting');

  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [materialFilter, setMaterialFilter] = useState<string>('');
  const [diameterFilter, setDiameterFilter] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [cuttingItem, setCuttingItem] = useState<InventoryItem | null>(null);
  const [marginError, setMarginError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '' as ItemCategory | '',
    material: '' as MaterialType | '',
    diameter: '',
    length: '',
    quantity: 0,
    minStock: 0,
    basePrice: 0,
    sellingPrice: 0,
  });

  // Cutting form state
  const [cuttingData, setCuttingData] = useState({
    newLength: '',
  });

  const categories = useMemo(() => {
    return Array.from(new Set(inventory.map((item) => item.category)));
  }, [inventory]);

  const materials = useMemo(() => {
    return Array.from(new Set(inventory.map((item) => item.material).filter(Boolean)));
  }, [inventory]);

  const diameters = useMemo(() => {
    return Array.from(new Set(inventory.map((item) => item.diameter).filter(Boolean)));
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.includes(search) || 
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        (item.diameter?.includes(search) ?? false) ||
        (item.length?.includes(search) ?? false);
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      const matchesMaterial = !materialFilter || item.material === materialFilter;
      const matchesDiameter = !diameterFilter || item.diameter === diameterFilter;
      return matchesSearch && matchesCategory && matchesMaterial && matchesDiameter;
    });
  }, [inventory, search, categoryFilter, materialFilter, diameterFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value) + ' ج.م';
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-EG').format(value);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      material: '',
      diameter: '',
      length: '',
      quantity: 0,
      minStock: 0,
      basePrice: 0,
      sellingPrice: 0,
    });
    setMarginError(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      material: item.material || '',
      diameter: item.diameter || '',
      length: item.length || '',
      quantity: item.quantity,
      minStock: item.minStock,
      basePrice: item.basePrice,
      sellingPrice: item.sellingPrice,
    });
    setEditItem(item);
    setMarginError(null);
  };

  const handleSellingPriceChange = (value: number) => {
    setFormData({ ...formData, sellingPrice: value });
    
    // Validate margin
    const validation = validateMargin(formData.basePrice, value);
    if (!validation.isValid) {
      setMarginError(validation.message || null);
    } else {
      setMarginError(null);
    }
  };

  const handleSave = () => {
    // Final margin validation
    const validation = validateMargin(formData.basePrice, formData.sellingPrice);
    if (!validation.isValid) {
      toast.error('تحذير حرج: سعر البيع أقل من السعر الأساسي!');
      return;
    }

    if (editItem) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? { 
                ...item, 
                ...formData,
                category: formData.category as ItemCategory,
                material: formData.material as MaterialType || undefined,
                updatedAt: new Date(),
                lastMovementDate: new Date(),
              }
            : item
        )
      );
      setEditItem(null);
      toast.success('تم تحديث الصنف بنجاح');
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: formData.name,
        sku: formData.sku,
        category: formData.category as ItemCategory,
        material: formData.material as MaterialType || undefined,
        diameter: formData.diameter || undefined,
        length: formData.length || undefined,
        quantity: formData.quantity,
        minStock: formData.minStock,
        basePrice: formData.basePrice,
        sellingPrice: formData.sellingPrice,
        lastMovementDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?.id || '',
      };
      setInventory((prev) => [...prev, newItem]);
      setIsAddModalOpen(false);
      toast.success('تم إضافة الصنف بنجاح');
    }
    resetForm();
  };

  const handleDelete = () => {
    if (deleteItem) {
      setInventory((prev) => prev.filter((item) => item.id !== deleteItem.id));
      setDeleteItem(null);
      toast.success('تم حذف الصنف');
    }
  };

  const handlePlateCutting = () => {
    if (!cuttingItem || !cuttingData.newLength) return;

    const newCost = calculatePlateCuttingCost(
      cuttingItem.length || '',
      cuttingData.newLength,
      cuttingItem.basePrice
    );

    // Deduct from original
    setInventory((prev) =>
      prev.map((item) =>
        item.id === cuttingItem.id
          ? { ...item, quantity: item.quantity - 1, lastMovementDate: new Date() }
          : item
      )
    );

    // Check if new variant exists
    const existingVariant = inventory.find(
      (item) =>
        item.category === cuttingItem.category &&
        item.material === cuttingItem.material &&
        item.diameter === cuttingItem.diameter &&
        item.length === cuttingData.newLength
    );

    if (existingVariant) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === existingVariant.id
            ? { ...item, quantity: item.quantity + 1, lastMovementDate: new Date() }
            : item
        )
      );
    } else {
      // Create new variant
      const newItem: InventoryItem = {
        ...cuttingItem,
        id: Date.now().toString(),
        length: cuttingData.newLength,
        sku: `${cuttingItem.sku.split('-').slice(0, -1).join('-')}-${cuttingData.newLength.replace('-hole', 'H')}`,
        quantity: 1,
        basePrice: newCost,
        sellingPrice: Math.round(newCost * 1.35),
        lastMovementDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?.id || '',
      };
      setInventory((prev) => [...prev, newItem]);
    }

    toast.success(`تم قطع الشريحة من ${cuttingItem.length} إلى ${cuttingData.newLength}`);
    setCuttingItem(null);
    setCuttingData({ newLength: '' });
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: 'name',
        header: 'الصنف',
        render: (item: InventoryItem) => (
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.sku}</p>
          </div>
        ),
      },
      {
        key: 'category',
        header: 'الفئة',
        render: (item: InventoryItem) => (
          <span className="text-muted-foreground text-sm">
            {CATEGORY_LABELS[item.category]}
          </span>
        ),
      },
      {
        key: 'specs',
        header: 'المواصفات',
        render: (item: InventoryItem) => (
          <div className="text-sm">
            {item.material && (
              <span className="inline-block px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs mr-1">
                {MATERIAL_LABELS[item.material]}
              </span>
            )}
            {item.diameter && <span className="text-muted-foreground">{item.diameter}</span>}
            {item.length && <span className="text-muted-foreground"> × {item.length}</span>}
          </div>
        ),
      },
      {
        key: 'quantity',
        header: 'الكمية',
        render: (item: InventoryItem) => (
          <span className="num font-medium">{formatNumber(item.quantity)}</span>
        ),
      },
      {
        key: 'status',
        header: 'الحالة',
        render: (item: InventoryItem) => (
          <StatusBadge status={getStockStatus(item.quantity, item.minStock)} />
        ),
      },
    ];

    if (canViewPrices) {
      baseColumns.push(
        {
          key: 'basePrice',
          header: 'السعر الأساسي',
          render: (item: InventoryItem) => (
            <span className="num text-muted-foreground">{formatCurrency(item.basePrice)}</span>
          ),
        },
        {
          key: 'sellingPrice',
          header: 'سعر البيع',
          render: (item: InventoryItem) => (
            <span className="num font-medium text-primary">{formatCurrency(item.sellingPrice)}</span>
          ),
        },
        {
          key: 'totalValue',
          header: 'القيمة الإجمالية',
          render: (item: InventoryItem) => (
            <span className="num font-medium text-success">
              {formatCurrency(item.quantity * item.basePrice)}
            </span>
          ),
        }
      );
    }

    baseColumns.push({
      key: 'actions',
      header: 'الإجراءات',
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-1">
          {canPerformPlateCutting && item.category === 'plates' && item.quantity > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCuttingItem(item);
              }}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-primary"
              title="قطع الشريحة"
            >
              <Scissors className="w-4 h-4" />
            </button>
          )}
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(item);
              }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteItem(item);
              }}
              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    });

    return baseColumns;
  }, [canViewPrices, canEdit, canDelete, canPerformPlateCutting]);

  const FormContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            اسم الصنف <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="مثال: برغي قشري"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            رمز الصنف (SKU) <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="CS-TI-4.5-20"
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            الفئة <span className="text-destructive">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">اختر الفئة</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">المادة</label>
          <select
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value as MaterialType })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">اختر المادة</option>
            {Object.entries(MATERIAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">القطر</label>
          <input
            type="text"
            value={formData.diameter}
            onChange={(e) => setFormData({ ...formData, diameter: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="4.5mm"
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">الطول</label>
          <input
            type="text"
            value={formData.length}
            onChange={(e) => setFormData({ ...formData, length: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="20mm أو 8-hole"
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            الكمية <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring num"
            dir="ltr"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">الحد الأدنى</label>
          <input
            type="number"
            value={formData.minStock}
            onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring num"
            dir="ltr"
            min="0"
          />
        </div>
      </div>

      {canViewPrices && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                السعر الأساسي (ج.م) {canEditBasePrice && <span className="text-destructive">*</span>}
              </label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring num disabled:opacity-50 disabled:cursor-not-allowed"
                dir="ltr"
                min="0"
                step="0.01"
                disabled={!canEditBasePrice}
              />
              {!canEditBasePrice && (
                <p className="text-xs text-muted-foreground">ليس لديك صلاحية تعديل السعر الأساسي</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                سعر البيع (ج.م) {canEditSellingPrice && <span className="text-destructive">*</span>}
              </label>
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => handleSellingPriceChange(Number(e.target.value))}
                className={`w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring num disabled:opacity-50 disabled:cursor-not-allowed ${
                  marginError ? 'border-destructive' : 'border-input'
                }`}
                dir="ltr"
                min="0"
                step="0.01"
                disabled={!canEditSellingPrice}
              />
            </div>
          </div>

          {marginError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{marginError}</span>
            </div>
          )}
        </>
      )}
    </div>
  );

  const CuttingContent = () => {
    if (!cuttingItem) return null;

    const currentHoles = parseInt(cuttingItem.length?.replace('-hole', '') || '0');
    const availableLengths = PLATE_LENGTH_OPTIONS.filter((opt) => {
      const holes = parseInt(opt.replace('-hole', ''));
      return holes < currentHoles;
    });

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-secondary/50">
          <p className="text-sm text-muted-foreground mb-2">الشريحة الأصلية:</p>
          <p className="font-medium text-foreground">
            {cuttingItem.name} - {cuttingItem.material && MATERIAL_LABELS[cuttingItem.material]} {cuttingItem.diameter} × {cuttingItem.length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            السعر الأساسي: <span className="num">{formatCurrency(cuttingItem.basePrice)}</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            الطول الجديد بعد القطع <span className="text-destructive">*</span>
          </label>
          <select
            value={cuttingData.newLength}
            onChange={(e) => setCuttingData({ newLength: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">اختر الطول</option>
            {availableLengths.map((length) => (
              <option key={length} value={length}>{length}</option>
            ))}
          </select>
        </div>

        {cuttingData.newLength && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">السعر الجديد المحسوب:</p>
            <p className="text-xl font-bold text-primary num">
              {formatCurrency(calculatePlateCuttingCost(cuttingItem.length || '', cuttingData.newLength, cuttingItem.basePrice))}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="إدارة المخزون"
        description="عرض وإدارة مستلزمات العظام"
        actions={
          canCreate && (
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة صنف
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="بحث بالاسم أو الرمز أو المواصفات..."
          className="max-w-md"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">جميع الفئات</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">جميع المواد</option>
            {materials.map((mat) => mat && (
              <option key={mat} value={mat}>{MATERIAL_LABELS[mat]}</option>
            ))}
          </select>
          <select
            value={diameterFilter}
            onChange={(e) => setDiameterFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">جميع الأقطار</option>
            {diameters.map((dia) => dia && (
              <option key={dia} value={dia}>{dia}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredInventory}
        keyExtractor={(item) => item.id}
        emptyMessage="لا توجد أصناف مطابقة للبحث"
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة صنف جديد"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.name || !formData.sku || !formData.category || !!marginError}
            >
              حفظ
            </Button>
          </>
        }
      >
        <FormContent />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title="تعديل الصنف"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.sku || !!marginError}>
              حفظ التغييرات
            </Button>
          </>
        }
      >
        <FormContent />
      </Modal>

      {/* Plate Cutting Modal */}
      <Modal
        isOpen={!!cuttingItem}
        onClose={() => setCuttingItem(null)}
        title="قطع الشريحة"
        footer={
          <>
            <Button variant="outline" onClick={() => setCuttingItem(null)}>
              إلغاء
            </Button>
            <Button onClick={handlePlateCutting} disabled={!cuttingData.newLength}>
              <Scissors className="w-4 h-4 ml-2" />
              تنفيذ القطع
            </Button>
          </>
        }
      >
        <CuttingContent />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="حذف الصنف"
        message={`هل أنت متأكد من حذف "${deleteItem?.name} - ${deleteItem?.sku}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        variant="danger"
      />
    </div>
  );
}
