import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockInventory, mockPurchases, mockSales } from '@/data/mockData';
import { getStockStatus } from '@/types/inventory';
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
  TrendingDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Dashboard() {
  const { isAdmin } = useAuth();

  const stats = useMemo(() => {
    const totalValue = mockInventory.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0
    );
    const lowStockCount = mockInventory.filter(
      (item) => getStockStatus(item.quantity, item.minStock) === 'low'
    ).length;
    const totalPurchases = mockPurchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalSales = mockSales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);

    return {
      totalValue,
      totalSKUs: mockInventory.length,
      lowStockCount,
      totalPurchases,
      totalSales,
    };
  }, []);

  const lowStockItems = useMemo(() => {
    return mockInventory
      .filter((item) => getStockStatus(item.quantity, item.minStock) === 'low')
      .slice(0, 5);
  }, []);

  const recentPurchases = useMemo(() => {
    return [...mockPurchases]
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

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="لوحة التحكم"
        description="نظرة عامة على المخزون والعمليات"
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

        {isAdmin && (
          <>
            <StatsCard
              title="إجمالي قيمة المخزون"
              value={formatCurrency(stats.totalValue)}
              icon={DollarSign}
              variant="success"
            />
            <StatsCard
              title="إجمالي المشتريات"
              value={formatCurrency(stats.totalPurchases)}
              icon={ShoppingCart}
            />
          </>
        )}

        {!isAdmin && (
          <>
            <StatsCard
              title="إجمالي الكميات"
              value={formatNumber(mockInventory.reduce((sum, i) => sum + i.quantity, 0))}
              icon={TrendingUp}
            />
            <StatsCard
              title="الفئات"
              value={formatNumber(new Set(mockInventory.map(i => i.category)).size)}
              icon={Package}
            />
          </>
        )}
      </div>

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
                    <p className="text-xs text-muted-foreground">{item.size}</p>
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

        {/* Recent Purchases */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              آخر المشتريات
            </h2>
          </div>
          <DataTable
            columns={[
              {
                key: 'itemName',
                header: 'الصنف',
                render: (item) => (
                  <p className="font-medium text-foreground truncate max-w-[150px]">
                    {item.itemName}
                  </p>
                ),
              },
              {
                key: 'quantity',
                header: 'الكمية',
                render: (item) => (
                  <span className="num">{formatNumber(item.quantity)}</span>
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
              ...(isAdmin
                ? [
                    {
                      key: 'totalCost',
                      header: 'الإجمالي',
                      render: (item: any) => (
                        <span className="num font-medium text-success">
                          {formatCurrency(item.totalCost)}
                        </span>
                      ),
                    },
                  ]
                : []),
            ]}
            data={recentPurchases}
            keyExtractor={(item) => item.id}
            emptyMessage="لا توجد مشتريات"
          />
        </div>
      </div>
    </div>
  );
}
