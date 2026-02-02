import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockPurchases, mockInventory, mockSuppliers } from '@/data/mockData';
import { Purchase } from '@/types/inventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function Purchases() {
  const { isAdmin } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [deletePurchase, setDeletePurchase] = useState<Purchase | null>(null);

  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    itemId: '',
    itemName: '',
    quantity: 0,
    unitCost: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const filteredPurchases = useMemo(() => {
    return purchases.filter(
      (p) =>
        p.itemName.includes(search) ||
        p.supplierName.includes(search)
    );
  }, [purchases, search]);

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
      supplierId: '',
      supplierName: '',
      itemId: '',
      itemName: '',
      quantity: 0,
      unitCost: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (purchase: Purchase) => {
    setFormData({
      supplierId: purchase.supplierId,
      supplierName: purchase.supplierName,
      itemId: purchase.itemId,
      itemName: purchase.itemName,
      quantity: purchase.quantity,
      unitCost: purchase.unitCost,
      date: format(purchase.date, 'yyyy-MM-dd'),
      notes: purchase.notes || '',
    });
    setEditPurchase(purchase);
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplier = mockSuppliers.find((s) => s.id === supplierId);
    setFormData({
      ...formData,
      supplierId,
      supplierName: supplier?.name || '',
    });
  };

  const handleItemChange = (itemId: string) => {
    const item = mockInventory.find((i) => i.id === itemId);
    setFormData({
      ...formData,
      itemId,
      itemName: item ? `${item.name} - ${item.size}` : '',
      unitCost: item?.unitCost || 0,
    });
  };

  const handleSave = () => {
    const totalCost = formData.quantity * formData.unitCost;

    if (editPurchase) {
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === editPurchase.id
            ? {
                ...p,
                ...formData,
                totalCost,
                date: new Date(formData.date),
              }
            : p
        )
      );
      setEditPurchase(null);
    } else {
      const newPurchase: Purchase = {
        id: Date.now().toString(),
        ...formData,
        totalCost,
        date: new Date(formData.date),
      };
      setPurchases((prev) => [newPurchase, ...prev]);
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const handleDelete = () => {
    if (deletePurchase) {
      setPurchases((prev) => prev.filter((p) => p.id !== deletePurchase.id));
      setDeletePurchase(null);
    }
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: 'date',
        header: 'التاريخ',
        render: (item: Purchase) => (
          <span className="text-muted-foreground">
            {format(item.date, 'dd MMM yyyy', { locale: ar })}
          </span>
        ),
      },
      {
        key: 'supplierName',
        header: 'المورد',
        render: (item: Purchase) => (
          <span className="font-medium text-foreground">{item.supplierName}</span>
        ),
      },
      {
        key: 'itemName',
        header: 'الصنف',
        render: (item: Purchase) => (
          <span className="text-foreground">{item.itemName}</span>
        ),
      },
      {
        key: 'quantity',
        header: 'الكمية',
        render: (item: Purchase) => (
          <span className="num font-medium">{formatNumber(item.quantity)}</span>
        ),
      },
    ];

    if (isAdmin) {
      baseColumns.push(
        {
          key: 'unitCost',
          header: 'سعر الوحدة',
          render: (item: Purchase) => (
            <span className="num">{formatCurrency(item.unitCost)}</span>
          ),
        },
        {
          key: 'totalCost',
          header: 'الإجمالي',
          render: (item: Purchase) => (
            <span className="num font-medium text-success">
              {formatCurrency(item.totalCost)}
            </span>
          ),
        }
      );
    }

    baseColumns.push({
      key: 'actions',
      header: 'الإجراءات',
      render: (item: Purchase) => (
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
              setDeletePurchase(item);
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
            المورد <span className="text-destructive">*</span>
          </label>
          <select
            value={formData.supplierId}
            onChange={(e) => handleSupplierChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">اختر المورد</option>
            {mockSuppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            التاريخ <span className="text-destructive">*</span>
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            dir="ltr"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          الصنف <span className="text-destructive">*</span>
        </label>
        <select
          value={formData.itemId}
          onChange={(e) => handleItemChange(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">اختر الصنف</option>
          {mockInventory.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} - {item.size}
            </option>
          ))}
        </select>
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
            min="1"
          />
        </div>
        {isAdmin && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              سعر الوحدة (ج.م)
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
      </div>

      {isAdmin && formData.quantity > 0 && formData.unitCost > 0 && (
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <p className="text-sm text-muted-foreground">الإجمالي:</p>
          <p className="text-2xl font-bold text-success num">
            {formatCurrency(formData.quantity * formData.unitCost)}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          ملاحظات
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          rows={3}
          placeholder="ملاحظات إضافية..."
        />
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="المشتريات"
        description="تسجيل ومتابعة فواتير الشراء"
        actions={
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 ml-2" />
            تسجيل فاتورة
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="بحث بالمورد أو الصنف..."
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredPurchases}
        keyExtractor={(item) => item.id}
        emptyMessage="لا توجد فواتير شراء"
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="تسجيل فاتورة شراء"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.supplierId || !formData.itemId || formData.quantity <= 0}
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
        isOpen={!!editPurchase}
        onClose={() => setEditPurchase(null)}
        title="تعديل فاتورة الشراء"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditPurchase(null)}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>حفظ التغييرات</Button>
          </>
        }
      >
        <FormContent />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletePurchase}
        onClose={() => setDeletePurchase(null)}
        onConfirm={handleDelete}
        title="حذف فاتورة الشراء"
        message="هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        variant="danger"
      />
    </div>
  );
}
