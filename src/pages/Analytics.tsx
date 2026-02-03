import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  mockInventory, 
  mockSurgeries, 
  mockDoctors, 
  mockSales,
  mockSettings 
} from '@/data/mockData';
import { isDeadStock, CATEGORY_LABELS, MATERIAL_LABELS } from '@/types/inventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { DataTable } from '@/components/ui/DataTable';
import {
  User,
  Skull,
  TrendingUp,
  Activity,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Analytics() {
  const { hasPermission } = useAuth();
  const canViewAnalytics = hasPermission('canViewAnalytics');
  const [deadStockThreshold, setDeadStockThreshold] = useState(mockSettings.deadStockThresholdMonths);

  // Redirect users without analytics access
  if (!canViewAnalytics) {
    return <Navigate to="/dashboard" replace />;
  }

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

  // Surgeon Portfolio - Consumption per Doctor
  const surgeonPortfolio = useMemo(() => {
    const portfolio: Record<string, {
      doctorId: string;
      doctorName: string;
      specialty: string;
      surgeryCount: number;
      totalBaseValue: number;
      totalSellingValue: number;
      totalProfit: number;
    }> = {};

    mockSurgeries.forEach((surgery) => {
      const doctor = mockDoctors.find((d) => d.id === surgery.doctorId);
      if (!doctor) return;

      if (!portfolio[surgery.doctorId]) {
        portfolio[surgery.doctorId] = {
          doctorId: surgery.doctorId,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          surgeryCount: 0,
          totalBaseValue: 0,
          totalSellingValue: 0,
          totalProfit: 0,
        };
      }

      portfolio[surgery.doctorId].surgeryCount++;
      portfolio[surgery.doctorId].totalBaseValue += surgery.totalBaseValue;
      portfolio[surgery.doctorId].totalSellingValue += surgery.totalSellingValue;
      portfolio[surgery.doctorId].totalProfit += surgery.profit;
    });

    return Object.values(portfolio).sort((a, b) => b.totalProfit - a.totalProfit);
  }, []);

  // Dead Stock Items
  const deadStockItems = useMemo(() => {
    return mockInventory
      .filter((item) => isDeadStock(item.lastMovementDate, deadStockThreshold))
      .map((item) => ({
        ...item,
        daysSinceMovement: Math.floor(
          (new Date().getTime() - item.lastMovementDate.getTime()) / (1000 * 60 * 60 * 24)
        ),
        totalValue: item.quantity * item.basePrice,
      }))
      .sort((a, b) => b.daysSinceMovement - a.daysSinceMovement);
  }, [deadStockThreshold]);

  // Profitability per Surgery
  const surgeryProfitability = useMemo(() => {
    return [...mockSurgeries]
      .map((surgery) => ({
        ...surgery,
        profitMargin: surgery.totalBaseValue > 0 
          ? ((surgery.profit / surgery.totalBaseValue) * 100).toFixed(1)
          : '0',
      }))
      .sort((a, b) => b.profit - a.profit);
  }, []);

  // Summary Stats
  const stats = useMemo(() => {
    const totalProfit = mockSurgeries.reduce((sum, s) => sum + s.profit, 0);
    const avgProfitPerSurgery = mockSurgeries.length > 0 
      ? totalProfit / mockSurgeries.length 
      : 0;
    const deadStockValue = deadStockItems.reduce((sum, item) => sum + item.totalValue, 0);
    const topDoctor = surgeonPortfolio[0];

    return {
      totalProfit,
      avgProfitPerSurgery,
      deadStockValue,
      deadStockCount: deadStockItems.length,
      topDoctorName: topDoctor?.doctorName || '-',
      topDoctorProfit: topDoctor?.totalProfit || 0,
    };
  }, [deadStockItems, surgeonPortfolio]);

  const getItemSpecs = (item: typeof mockInventory[0]) => {
    const parts = [];
    if (item.material) parts.push(MATERIAL_LABELS[item.material]);
    if (item.diameter) parts.push(item.diameter);
    if (item.length) parts.push(item.length);
    return parts.join(' × ') || '-';
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="التحليلات المتقدمة"
        description="تحليل الاستهلاك والأرباح والمخزون الراكد"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="إجمالي الأرباح"
          value={formatCurrency(stats.totalProfit)}
          icon={DollarSign}
          variant="success"
        />
        <StatsCard
          title="متوسط الربح/عملية"
          value={formatCurrency(stats.avgProfitPerSurgery)}
          icon={TrendingUp}
        />
        <StatsCard
          title="قيمة المخزون الراكد"
          value={formatCurrency(stats.deadStockValue)}
          icon={Skull}
          variant={stats.deadStockCount > 0 ? 'warning' : 'default'}
        />
        <StatsCard
          title="أفضل طبيب (أرباح)"
          value={stats.topDoctorName}
          icon={User}
          variant="primary"
        />
      </div>

      {/* Surgeon Portfolio */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            محفظة الأطباء (Surgeon Portfolio)
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          تحليل استهلاك ومساهمة كل طبيب في الأرباح
        </p>
        <DataTable
          columns={[
            {
              key: 'doctor',
              header: 'الطبيب',
              render: (item) => (
                <div>
                  <p className="font-medium text-foreground">{item.doctorName}</p>
                  <p className="text-xs text-muted-foreground">{item.specialty}</p>
                </div>
              ),
            },
            {
              key: 'surgeryCount',
              header: 'عدد العمليات',
              render: (item) => (
                <span className="num font-medium">{formatNumber(item.surgeryCount)}</span>
              ),
            },
            {
              key: 'totalBaseValue',
              header: 'قيمة التكلفة',
              render: (item) => (
                <span className="num text-muted-foreground">
                  {formatCurrency(item.totalBaseValue)}
                </span>
              ),
            },
            {
              key: 'totalSellingValue',
              header: 'قيمة البيع',
              render: (item) => (
                <span className="num">{formatCurrency(item.totalSellingValue)}</span>
              ),
            },
            {
              key: 'profit',
              header: 'الربح',
              render: (item) => (
                <span className="num font-medium text-success">
                  {formatCurrency(item.totalProfit)}
                </span>
              ),
            },
          ]}
          data={surgeonPortfolio}
          keyExtractor={(item) => item.doctorId}
          emptyMessage="لا توجد بيانات"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dead Stock */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-bold text-foreground">
                المخزون الراكد (Dead Stock)
              </h2>
            </div>
            <select
              value={deadStockThreshold}
              onChange={(e) => setDeadStockThreshold(Number(e.target.value))}
              className="h-8 px-2 rounded-lg border border-input bg-background text-sm"
            >
              {[3, 6, 9, 12].map((months) => (
                <option key={months} value={months}>
                  {months} أشهر
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            أصناف لم تتحرك منذ {deadStockThreshold} أشهر أو أكثر
          </p>
          <DataTable
            columns={[
              {
                key: 'name',
                header: 'الصنف',
                render: (item) => (
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{getItemSpecs(item)}</p>
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
                key: 'days',
                header: 'أيام بدون حركة',
                render: (item) => (
                  <span className="num text-warning font-medium">
                    {formatNumber(item.daysSinceMovement)} يوم
                  </span>
                ),
              },
              {
                key: 'value',
                header: 'القيمة',
                render: (item) => (
                  <span className="num text-destructive">
                    {formatCurrency(item.totalValue)}
                  </span>
                ),
              },
            ]}
            data={deadStockItems}
            keyExtractor={(item) => item.id}
            emptyMessage="لا يوجد مخزون راكد 🎉"
          />
        </div>

        {/* Surgery Profitability */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-success" />
            <h2 className="text-lg font-bold text-foreground">
              ربحية العمليات الجراحية
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            تحليل الربح لكل عملية جراحية
          </p>
          <DataTable
            columns={[
              {
                key: 'patient',
                header: 'المريض',
                render: (item) => (
                  <div>
                    <p className="font-medium text-foreground">{item.patientName}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
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
              {
                key: 'sellingValue',
                header: 'قيمة البيع',
                render: (item) => (
                  <span className="num">{formatCurrency(item.totalSellingValue)}</span>
                ),
              },
              {
                key: 'profit',
                header: 'الربح',
                render: (item) => (
                  <div>
                    <span className="num font-medium text-success">
                      {formatCurrency(item.profit)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      ({item.profitMargin}%)
                    </p>
                  </div>
                ),
              },
            ]}
            data={surgeryProfitability}
            keyExtractor={(item) => item.id}
            emptyMessage="لا توجد عمليات"
          />
        </div>
      </div>
    </div>
  );
}
