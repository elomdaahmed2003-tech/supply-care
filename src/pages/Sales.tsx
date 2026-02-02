import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSales, mockInventory } from '@/data/mockData';
import { Sale } from '@/types/inventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, TrendingDown, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/utils';

export default function Sales() {
  const { isAdmin } = useAuth();
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'usage'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [deleteSale, setDeleteSale] = useState<Sale | null>(null);

  const [formData, setFormData] = useState({
    itemId: '',
    itemName: '',
    quantity: 0,
    unitPrice: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'usage' as 'sale' | 'usage',
    notes: '',
  });

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch = s.itemName.includes(search);
      const matchesType = typeFilter === 'all' || s.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [sales, search, typeFilter]);

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
      itemId: '',
      itemName: '',
      quantity: 0,
      unitPrice: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'usage',
      notes: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (sale: Sale) => {
    setFormData({
      itemId: sale.itemId,
      itemName: sale.itemName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice || 0,
      date: format(sale.date, 'yyyy-MM-dd'),
      type: sale.type,
      notes: sale.notes || '',
    });
    setEditSale(sale);
  };

  const handleItemChange = (itemId: string) => {
    const item = mockInventory.find((i) => i.id === itemId);
    setFormData({
      ...formData,
      itemId,
      itemName: item ? `${item.name} - ${item.size}` : '',
    });
  };

  const handleSave = () => {
    const totalPrice = formData.type === 'sale' ? formData.quantity * formData.unitPrice : undefined;

    if (editSale) {
      setSales((prev) =>
        prev.map((s) =>
          s.id === editSale.id
            ? {
                ...s,
                ...formData,
                totalPrice,
                date: new Date(formData.date),
              }
            : s
        )
      );
      setEditSale(null);
    } else {
      const newSale: Sale = {
        id: Date.now().toString(),
        ...formData,
        totalPrice,
        date: new Date(formData.date),
      };
      setSales((prev) => [newSale, ...prev]);
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const handleDelete = () => {
    if (deleteSale) {
      setSales((prev) => prev.filter((s) => s.id !== deleteSale.id));
      setDeleteSale(null);
    }
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: 'date',
        header: 'التاريخ',
        render: (item: Sale) => (
          <span className="text-muted-foreground">
            {format(item.date, 'dd MMM yyyy', { locale: ar })}
          </span>
        ),
      },
      {
        key: 'type',
        header: 'النوع',
        render: (item: Sale) => (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
              item.type === 'sale'
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {item.type === 'sale' ? (
              <>
                <ShoppingBag className="w-3 h-3" />
                بيع
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3" />
                استهلاك
              </>
            )}
          </span>
        ),
      },
      {
        key: 'itemName',
        header: 'الصنف',
        render: (item: Sale) => (
          <span className="font-medium text-foreground">{item.itemName}</span>
        ),
      },
      {
        key: 'quantity',
        header: 'الكمية',
        render: (item: Sale) => (
          <span className="num font-medium text-destructive">
            -{formatNumber(item.quantity)}
          </span>
        ),
      },
    ];

    if (isAdmin) {
      baseColumns.push({
        key: 'totalPrice',
        header: 'الإجمالي',
        render: (item: Sale) => (
          <span className="num font-medium">
            {item.totalPrice ? formatCurrency(item.totalPrice) : '-'}
          </span>
        ),
      });
    }

    baseColumns.push(
      {
        key: 'notes',
        header: 'ملاحظات',
        render: (item: Sale) => (
          <span className="text-muted-foreground text-xs truncate max-w-[150px] block">
            {item.notes || '-'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'الإجراءات',
        render: (item: Sale) => (
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
                setDeleteSale(item);
              }}
              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      }
    );

    return baseColumns;
  }, [isAdmin]);

  const FormContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          نوع العملية <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="usage"
              checked={formData.type === 'usage'}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as 'usage' | 'sale' })
              }
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm">استهلاك داخلي</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="sale"
              checked={formData.type === 'sale'}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as 'usage' | 'sale' })
              }
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm">بيع خارجي</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {item.name} - {item.size} (متاح: {item.quantity})
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
        {isAdmin && formData.type === 'sale' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              سعر البيع (ج.م)
            </label>
            <input
              type="number"
              value={formData.unitPrice}
              onChange={(e) =>
                setFormData({ ...formData, unitPrice: Number(e.target.value) })
              }
              className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring num"
              dir="ltr"
              min="0"
              step="0.01"
            />
          </div>
        )}
      </div>

      {isAdmin && formData.type === 'sale' && formData.quantity > 0 && formData.unitPrice > 0 && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm text-muted-foreground">إجمالي البيع:</p>
          <p className="text-2xl font-bold text-primary num">
            {formatCurrency(formData.quantity * formData.unitPrice)}
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
          placeholder="مثال: غرفة العمليات رقم 3..."
        />
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="الاستهلاك والمبيعات"
        description="تسجيل استخدام المستلزمات والمبيعات الخارجية"
        actions={
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 ml-2" />
            تسجيل عملية
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="بحث بالصنف..."
          className="flex-1 max-w-md"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              typeFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            الكل
          </button>
          <button
            onClick={() => setTypeFilter('usage')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              typeFilter === 'usage'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            استهلاك
          </button>
          <button
            onClick={() => setTypeFilter('sale')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              typeFilter === 'sale'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            بيع
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredSales}
        keyExtractor={(item) => item.id}
        emptyMessage="لا توجد عمليات مسجلة"
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="تسجيل عملية جديدة"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.itemId || formData.quantity <= 0}
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
        isOpen={!!editSale}
        onClose={() => setEditSale(null)}
        title="تعديل العملية"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditSale(null)}>
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
        isOpen={!!deleteSale}
        onClose={() => setDeleteSale(null)}
        onConfirm={handleDelete}
        title="حذف العملية"
        message="هل أنت متأكد من حذف هذه العملية؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        variant="danger"
      />
    </div>
  );
}
