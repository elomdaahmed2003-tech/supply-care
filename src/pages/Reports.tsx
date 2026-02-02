import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockInventory, mockPurchases, mockSales } from '@/data/mockData';
import { getStockStatus } from '@/types/inventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { DataTable } from '@/components/ui/DataTable';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

export default function Reports() {
  const { isAdmin } = useAuth();

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const stats = useMemo(() => {
    const totalValue = mockInventory.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0
    );
    const totalPurchases = mockPurchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalSales = mockSales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const lowStockValue = mockInventory
      .filter((item) => getStockStatus(item.quantity, item.minStock) === 'low')
      .reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

    return {
      totalValue,
      totalPurchases,
      totalSales,
      lowStockValue,
      grossProfit: totalSales - totalPurchases,
    };
  }, []);

  const inventoryByCategory = useMemo(() => {
    const categories: Record<string, { count: number; value: number; quantity: number }> = {};
    
    mockInventory.forEach((item) => {
      if (!categories[item.category]) {
        categories[item.category] = { count: 0, value: 0, quantity: 0 };
      }
      categories[item.category].count++;
      categories[item.category].quantity += item.quantity;
      categories[item.category].value += item.quantity * item.unitCost;
    });

    return Object.entries(categories).map(([category, data]) => ({
      category,
      ...data,
    }));
  }, []);

  const topItems = useMemo(() => {
    return [...mockInventory]
      .sort((a, b) => b.quantity * b.unitCost - a.quantity * a.unitCost)
      .slice(0, 10);
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
        title="التقارير المالية"
        description="نظرة شاملة على الوضع المالي للمخزون"
      />

      {/* Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="إجمالي قيمة المخزون"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
          variant="primary"
        />
        <StatsCard
          title="إجمالي المشتريات"
          value={formatCurrency(stats.totalPurchases)}
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title="إجمالي المبيعات"
          value={formatCurrency(stats.totalSales)}
          icon={TrendingDown}
        />
        <StatsCard
          title="قيمة المخزون المنخفض"
          value={formatCurrency(stats.lowStockValue)}
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory by Category */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              المخزون حسب الفئة
            </h2>
          </div>
          <DataTable
            columns={[
              {
                key: 'category',
                header: 'الفئة',
                render: (item) => (
                  <span className="font-medium text-foreground">
                    {item.category}
                  </span>
                ),
              },
              {
                key: 'count',
                header: 'عدد الأصناف',
                render: (item) => (
                  <span className="num">{formatNumber(item.count)}</span>
                ),
              },
              {
                key: 'quantity',
                header: 'إجمالي الكميات',
                render: (item) => (
                  <span className="num">{formatNumber(item.quantity)}</span>
                ),
              },
              {
                key: 'value',
                header: 'القيمة',
                render: (item) => (
                  <span className="num font-medium text-primary">
                    {formatCurrency(item.value)}
                  </span>
                ),
              },
            ]}
            data={inventoryByCategory}
            keyExtractor={(item) => item.category}
            emptyMessage="لا توجد بيانات"
          />
        </div>

        {/* Top Items by Value */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              أعلى الأصناف قيمة
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
                  <span className="num">{formatNumber(item.quantity)}</span>
                ),
              },
              {
                key: 'totalValue',
                header: 'القيمة الإجمالية',
                render: (item) => (
                  <span className="num font-medium text-primary">
                    {formatCurrency(item.quantity * item.unitCost)}
                  </span>
                ),
              },
            ]}
            data={topItems}
            keyExtractor={(item) => item.id}
            emptyMessage="لا توجد أصناف"
          />
        </div>
      </div>

      {/* Financial Summary Table */}
      <div className="mt-6 bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            الملخص المالي الشامل
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
              key: 'category',
              header: 'الفئة',
              render: (item) => (
                <span className="text-muted-foreground">{item.category}</span>
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
              key: 'unitCost',
              header: 'السعر الثابت',
              render: (item) => (
                <span className="num">{formatCurrency(item.unitCost)}</span>
              ),
            },
            {
              key: 'totalValue',
              header: 'القيمة الإجمالية',
              render: (item) => (
                <span className="num font-medium text-primary">
                  {formatCurrency(item.quantity * item.unitCost)}
                </span>
              ),
            },
          ]}
          data={mockInventory}
          keyExtractor={(item) => item.id}
          emptyMessage="لا توجد أصناف"
        />
      </div>
    </div>
  );
}
