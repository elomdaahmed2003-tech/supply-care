import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockInventory, mockPurchases, mockSales, mockSurgeries } from '@/data/mockData';
import { getStockStatus, isDeadStock, CATEGORY_LABELS } from '@/types/inventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Activity,
  Skull,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Dashboard() {
  const { hasPermission, roleLabel } = useAuth();
  const canViewPrices = hasPermission('canViewPrices');
  const canViewFinancials = hasPermission('canViewFinancials');

  const stats = useMemo(() => {
    const totalValue = mockInventory.reduce(
      (sum, item) => sum + item.quantity * item.basePrice,
      0
    );
    const lowStockCount = mockInventory.filter(
      (item) => getStockStatus(item.quantity, item.minStock) === 'low'
    ).length;
    const deadStockCount = mockInventory.filter(
      (item) => isDeadStock(item.lastMovementDate, 6)
    ).length;
    const totalPurchases = mockPurchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalProfit = mockSurgeries.reduce((sum, s) => sum + s.profit, 0);

    return {
      totalValue,
      totalSKUs: mockInventory.length,
      lowStockCount,
      deadStockCount,
      totalPurchases,
      totalProfit,
    };
  }, []);

  const lowStockItems = useMemo(() => {
    return mockInventory
      .filter((item) => getStockStatus(item.quantity, item.minStock) === 'low')
      .slice(0, 5);
  }, []);

  const recentSurgeries = useMemo(() => {
    return [...mockSurgeries]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, []);

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
    if (item.material) parts.push(item.material === 'titanium' ? 'Ti' : 'SS');
    if (item.diameter) parts.push(item.diameter);
    if (item.length) parts.push(item.length);
    return parts.join(' - ');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="شركة الدلتا للمستلزمات الطبية"
        description={`مرحباً بك - ${roleLabel}`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="عدد الأصناف"
          value={formatNumber(stats.totalSKUs)}
          icon={Package}
          variant="primary"
        />
        
        <StatsCard
          title="أصناف منخفضة المخزون"
          value={formatNumber(stats.lowStockCount)}
          icon={AlertTriangle}
          variant={stats.lowStockCount > 0 ? 'danger' : 'default'}
        />

        <StatsCard
          title="مخزون راكد"
          value={formatNumber(stats.deadStockCount)}
          icon={Skull}
          variant={stats.deadStockCount > 0 ? 'warning' : 'default'}
        />

        {canViewFinancials ? (
          <StatsCard
            title="إجمالي قيمة المخزون"
            value={formatCurrency(stats.totalValue)}
            icon={DollarSign}
            variant="success"
          />
        ) : (
          <StatsCard
            title="العمليات الجراحية"
            value={formatNumber(mockSurgeries.length)}
            icon={Activity}
          />
        )}
      </div>

      {/* Second Row Stats - Financial users only */}
      {canViewFinancials && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <StatsCard
            title="إجمالي المشتريات"
            value={formatCurrency(stats.totalPurchases)}
            icon={ShoppingCart}
          />
          <StatsCard
            title="إجمالي الأرباح"
            value={formatCurrency(stats.totalProfit)}
            icon={TrendingUp}
            variant="success"
          />
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="text-lg font-bold text-foreground">
              أصناف منخفضة المخزون
            </h2>
          </div>
          <DataTable
            columns={[
              {
                key: 'name',
                header: 'الصنف',
                render: (item) => (
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.sku}
                    </p>
                  </div>
                ),
              },
              {
                key: 'specs',
                header: 'المواصفات',
                render: (item) => (
                  <div className="text-xs text-muted-foreground">
                    {item.diameter && <span>{item.diameter}</span>}
                    {item.length && <span> × {item.length}</span>}
                  </div>
                ),
              },
              {
                key: 'quantity',
                header: 'الكمية',
                render: (item) => (
                  <span className="num font-medium text-destructive">
                    {formatNumber(item.quantity)}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'الحالة',
                render: (item) => (
                  <StatusBadge
                    status={getStockStatus(item.quantity, item.minStock)}
                  />
                ),
              },
            ]}
            data={lowStockItems}
            keyExtractor={(item) => item.id}
            emptyMessage="لا توجد أصناف منخفضة المخزون"
          />
        </div>

        {/* Recent Surgeries */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              آخر العمليات الجراحية
            </h2>
          </div>
          <DataTable
            columns={[
              {
                key: 'patient',
                header: 'المريض',
                render: (item) => (
                  <p className="font-medium text-foreground truncate max-w-[120px]">
                    {item.patientName}
                  </p>
                ),
              },
              {
                key: 'type',
                header: 'نوع العملية',
                render: (item) => (
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {item.type}
                  </p>
                ),
              },
              {
                key: 'date',
                header: 'التاريخ',
                render: (item) => (
                  <span className="text-muted-foreground text-xs">
                    {format(item.date, 'dd MMM yyyy', { locale: ar })}
                  </span>
                ),
              },
              ...(canViewFinancials
                ? [
                    {
                      key: 'profit',
                      header: 'الربح',
                      render: (item: typeof mockSurgeries[0]) => (
                        <span className="num font-medium text-success">
                          {formatCurrency(item.profit)}
                        </span>
                      ),
                    },
                  ]
                : []),
            ]}
            data={recentSurgeries}
            keyExtractor={(item) => item.id}
            emptyMessage="لا توجد عمليات"
          />
        </div>
      </div>
    </div>
  );
}
