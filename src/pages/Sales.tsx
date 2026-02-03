import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSales, mockInventory, mockDoctors, mockSurgeries } from '@/data/mockData';
import { Sale, MATERIAL_LABELS, validateMargin } from '@/types/inventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, TrendingDown, ShoppingBag, Activity, Lock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Sales() {
  const { hasPermission, user } = useAuth();
  const canCreate = hasPermission('canCreateStockOut');
  const canEdit = hasPermission('canEditAfterSubmit');
  const canDelete = hasPermission('canDeleteRecords');
  const canViewPrices = hasPermission('canViewPrices');
  const canViewProfit = hasPermission('canViewProfit');

  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'usage' | 'surgery'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [deleteSale, setDeleteSale] = useState<Sale | null>(null);
  const [marginError, setMarginError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    itemId: '',
    itemName: '',
    quantity: 0,
    basePrice: 0,
    sellingPrice: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'surgery' as 'sale' | 'usage' | 'surgery',
    doctorId: '',
    doctorName: '',
    patientName: '',
    notes: '',
  });

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch = s.itemName.includes(search) || (s.patientName?.includes(search) ?? false);
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

  const getItemDisplayName = (item: typeof mockInventory[0]) => {
    const parts = [item.name];
    if (item.material) parts.push(MATERIAL_LABELS[item.material]);
    if (item.diameter) parts.push(item.diameter);
    if (item.length) parts.push(item.length);
    return parts.join(' - ');
  };

  const resetForm = () => {
    setFormData({
      itemId: '',
      itemName: '',
      quantity: 0,
      basePrice: 0,
      sellingPrice: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'surgery',
      doctorId: '',
      doctorName: '',
      patientName: '',
      notes: '',
    });
    setMarginError(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (sale: Sale) => {
    if (sale.isLocked && !canEdit) {
      toast.error('لا يمكن تعديل هذا السجل بعد الحفظ');
      return;
    }
    setFormData({
      itemId: sale.itemId,
      itemName: sale.itemName,
      quantity: sale.quantity,
      basePrice: sale.basePrice,
      sellingPrice: sale.sellingPrice,
      date: format(sale.date, 'yyyy-MM-dd'),
      type: sale.type,
      doctorId: sale.doctorId || '',
      doctorName: sale.doctorName || '',
      patientName: sale.patientName || '',
      notes: sale.notes || '',
    });
    setEditSale(sale);
    setMarginError(null);
  };

  const handleItemChange = (itemId: string) => {
    const item = mockInventory.find((i) => i.id === itemId);
    if (item) {
      setFormData({
        ...formData,
        itemId,
        itemName: getItemDisplayName(item),
        basePrice: item.basePrice,
        sellingPrice: item.sellingPrice,
      });
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = mockDoctors.find((d) => d.id === doctorId);
    setFormData({
      ...formData,
      doctorId,
      doctorName: doctor?.name || '',
    });
  };

  const handleSellingPriceChange = (value: number) => {
    setFormData({ ...formData, sellingPrice: value });
    const validation = validateMargin(formData.basePrice, value);
    if (!validation.isValid) {
      setMarginError(validation.message || null);
    } else {
      setMarginError(null);
    }
  };

  const handleSave = () => {
    // Validate margin
    const validation = validateMargin(formData.basePrice, formData.sellingPrice);
    if (!validation.isValid && formData.type !== 'usage') {
      toast.error('تحذير حرج: سعر البيع أقل من السعر الأساسي!');
      return;
    }

    const totalBaseValue = formData.quantity * formData.basePrice;
    const totalSellingValue = formData.quantity * formData.sellingPrice;

    if (editSale) {
      setSales((prev) =>
        prev.map((s) =>
          s.id === editSale.id
            ? {
                ...s,
                ...formData,
                totalBaseValue,
                totalSellingValue,
                date: new Date(formData.date),
              }
            : s
        )
      );
      setEditSale(null);
      toast.success('تم تحديث العملية');
    } else {
      const newSale: Sale = {
        id: Date.now().toString(),
        itemId: formData.itemId,
        itemName: formData.itemName,
        quantity: formData.quantity,
        basePrice: formData.basePrice,
        sellingPrice: formData.sellingPrice,
        totalBaseValue,
        totalSellingValue,
        date: new Date(formData.date),
        type: formData.type,
        doctorId: formData.doctorId || undefined,
        doctorName: formData.doctorName || undefined,
        patientName: formData.patientName || undefined,
        notes: formData.notes || undefined,
        createdBy: user?.id || '',
        createdAt: new Date(),
        isLocked: true,
      };
      setSales((prev) => [newSale, ...prev]);
      setIsAddModalOpen(false);
      toast.success('تم تسجيل العملية');
    }
    resetForm();
  };

  const handleDelete = () => {
    if (deleteSale) {
      setSales((prev) => prev.filter((s) => s.id !== deleteSale.id));
      setDeleteSale(null);
      toast.success('تم حذف العملية');
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
                : item.type === 'surgery'
                ? 'bg-success/10 text-success'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {item.type === 'sale' ? (
              <>
                <ShoppingBag className="w-3 h-3" />
                بيع
              </>
            ) : item.type === 'surgery' ? (
              <>
                <Activity className="w-3 h-3" />
                جراحة
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
        key: 'patient',
        header: 'المريض/الطبيب',
        render: (item: Sale) => (
          <div className="text-sm">
            {item.patientName && <p className="text-foreground">{item.patientName}</p>}
            {item.doctorName && <p className="text-xs text-muted-foreground">{item.doctorName}</p>}
          </div>
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

    if (canViewPrices) {
      baseColumns.push({
        key: 'totalValue',
        header: 'الإجمالي',
        render: (item: Sale) => (
          <span className="num font-medium">
            {formatCurrency(item.totalSellingValue)}
          </span>
        ),
      });
    }

    if (canViewProfit) {
      baseColumns.push({
        key: 'profit',
        header: 'الربح',
        render: (item: Sale) => (
          <span className="num font-medium text-success">
            {formatCurrency(item.totalSellingValue - item.totalBaseValue)}
          </span>
        ),
      });
    }

    baseColumns.push({
      key: 'actions',
      header: 'الإجراءات',
      render: (item: Sale) => (
        <div className="flex items-center gap-2">
          {item.isLocked && !canEdit ? (
            <Lock className="w-4 h-4 text-muted-foreground" />
          ) : (
            <>
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
                    setDeleteSale(item);
                  }}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      ),
    });

    return baseColumns;
  }, [canViewPrices, canViewProfit, canEdit, canDelete]);

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
              value="surgery"
              checked={formData.type === 'surgery'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm">عملية جراحية</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="usage"
              checked={formData.type === 'usage'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
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
              onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm">بيع خارجي</span>
          </label>
        </div>
      </div>

      {formData.type === 'surgery' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              الطبيب <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">اختر الطبيب</option>
              {mockDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              اسم المريض <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="اسم المريض"
            />
          </div>
        </div>
      )}

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
                {getItemDisplayName(item)} (متاح: {item.quantity})
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
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring num"
            dir="ltr"
            min="1"
          />
        </div>
        {canViewPrices && formData.type !== 'usage' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              سعر البيع (ج.م)
            </label>
            <input
              type="number"
              value={formData.sellingPrice}
              onChange={(e) => handleSellingPriceChange(Number(e.target.value))}
              className={`w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring num ${
                marginError ? 'border-destructive' : 'border-input'
              }`}
              dir="ltr"
              min="0"
              step="0.01"
            />
          </div>
        )}
      </div>

      {marginError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{marginError}</span>
        </div>
      )}

      {canViewPrices && formData.type !== 'usage' && formData.quantity > 0 && formData.sellingPrice > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">إجمالي البيع:</p>
            <p className="text-xl font-bold text-primary num">
              {formatCurrency(formData.quantity * formData.sellingPrice)}
            </p>
          </div>
          {canViewProfit && (
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-muted-foreground">الربح:</p>
              <p className="text-xl font-bold text-success num">
                {formatCurrency(formData.quantity * (formData.sellingPrice - formData.basePrice))}
              </p>
            </div>
          )}
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
          placeholder="مثال: تثبيت كسر عظمة الفخذ..."
        />
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="العمليات الجراحية والمبيعات"
        description="تسجيل استخدام المستلزمات والعمليات الجراحية"
        actions={
          canCreate && (
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 ml-2" />
              تسجيل عملية
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="بحث بالصنف أو المريض..."
          className="flex-1 max-w-md"
        />
        <div className="flex gap-2">
          {(['all', 'surgery', 'usage', 'sale'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                typeFilter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {type === 'all' ? 'الكل' : type === 'surgery' ? 'جراحة' : type === 'usage' ? 'استهلاك' : 'بيع'}
            </button>
          ))}
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
              disabled={!formData.itemId || formData.quantity <= 0 || !!marginError}
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
            <Button onClick={handleSave} disabled={!!marginError}>
              حفظ التغييرات
            </Button>
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
