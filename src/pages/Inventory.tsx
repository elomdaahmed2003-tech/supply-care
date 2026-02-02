import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockInventory } from '@/data/mockData';
import { InventoryItem, getStockStatus } from '@/types/inventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Filter } from 'lucide-react';

export default function Inventory() {
  const { isAdmin } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    quantity: 0,
    unitCost: 0,
    minStock: 0,
    category: '',
  });

  const categories = useMemo(() => {
    return Array.from(new Set(inventory.map((item) => item.category)));
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.includes(search) || item.size.includes(search);
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, search, categoryFilter]);

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
      size: '',
      quantity: 0,
      unitCost: 0,
      minStock: 0,
      category: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      size: item.size,
      quantity: item.quantity,
      unitCost: item.unitCost,
      minStock: item.minStock,
      category: item.category,
    });
    setEditItem(item);
  };

  const handleSave = () => {
    if (editItem) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? { ...item, ...formData, updatedAt: new Date() }
            : item
        )
      );
      setEditItem(null);
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setInventory((prev) => [...prev, newItem]);
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const handleDelete = () => {
    if (deleteItem) {
      setInventory((prev) => prev.filter((item) => item.id !== deleteItem.id));
      setDeleteItem(null);
    }
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: 'name',
        header: 'الصنف',
        render: (item: InventoryItem) => (
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.category}</p>
          </div>
        ),
      },
      {
        key: 'size',
        header: 'المقاس',
        render: (item: InventoryItem) => (
          <span className="text-foreground">{item.size}</span>
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

    if (isAdmin) {
      baseColumns.push(
        {
          key: 'unitCost',
          header: 'السعر الثابت',
          render: (item: InventoryItem) => (
            <span className="num">{formatCurrency(item.unitCost)}</span>
          ),
        },
        {
          key: 'totalValue',
          header: 'القيمة الإجمالية',
          render: (item: InventoryItem) => (
            <span className="num font-medium text-primary">
              {formatCurrency(item.quantity * item.unitCost)}
            </span>
          ),
        }
      );
    }

    baseColumns.push({
      key: 'actions',
      header: 'الإجراءات',
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(item);
            }}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteItem(item);
            }}
            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    });

    return baseColumns;
  }, [isAdmin]);

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
            placeholder="مثال: قفازات جراحية"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            المقاس <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="مثال: مقاس 7"
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
            onChange={(e) =>
              setFormData({ ...formData, quantity: Number(e.target.value) })
            }
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring num"
            dir="ltr"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            الحد الأدنى للمخزون
          </label>
          <input
            type="number"
            value={formData.minStock}
            onChange={(e) =>
              setFormData({ ...formData, minStock: Number(e.target.value) })
            }
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring num"
            dir="ltr"
            min="0"
          />
        </div>
      </div>

      {isAdmin && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            السعر الثابت (ج.م)
          </label>
          <input
            type="number"
            value={formData.unitCost}
            onChange={(e) =>
              setFormData({ ...formData, unitCost: Number(e.target.value) })
            }
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring num"
            dir="ltr"
            min="0"
            step="0.01"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          الفئة
        </label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="مثال: قفازات"
          list="categories"
        />
        <datalist id="categories">
          {categories.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="إدارة المخزون"
        description="عرض وإدارة جميع أصناف المستلزمات الجراحية"
        actions={
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة صنف
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="بحث بالاسم أو المقاس..."
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">جميع الفئات</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
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
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.size}>
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
        footer={
          <>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.size}>
              حفظ التغييرات
            </Button>
          </>
        }
      >
        <FormContent />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="حذف الصنف"
        message={`هل أنت متأكد من حذف "${deleteItem?.name} - ${deleteItem?.size}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        variant="danger"
      />
    </div>
  );
}
