import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/types/roles';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import {
  User,
  Lock,
  Bell,
  Shield,
  Database,
  HelpCircle,
  ChevronLeft,
  Check,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  permission?: 'canManageSettings' | 'canManageUsers';
}

const sections: SettingSection[] = [
  {
    id: 'profile',
    title: 'الملف الشخصي',
    description: 'إدارة بيانات الحساب الشخصي',
    icon: User,
  },
  {
    id: 'security',
    title: 'الأمان',
    description: 'تغيير كلمة المرور وإعدادات الأمان',
    icon: Lock,
  },
  {
    id: 'notifications',
    title: 'الإشعارات',
    description: 'إدارة تنبيهات المخزون والنظام',
    icon: Bell,
  },
  {
    id: 'permissions',
    title: 'الصلاحيات',
    description: 'عرض صلاحيات المستخدمين',
    icon: Shield,
  },
  {
    id: 'deadstock',
    title: 'المخزون الراكد',
    description: 'إعدادات حد المخزون الراكد',
    icon: Clock,
  },
  {
    id: 'data',
    title: 'البيانات',
    description: 'تصدير واستيراد البيانات',
    icon: Database,
  },
  {
    id: 'help',
    title: 'المساعدة',
    description: 'الدعم الفني والأسئلة الشائعة',
    icon: HelpCircle,
  },
];

export default function Settings() {
  const { user, roleLabel, hasPermission } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deadStockMonths, setDeadStockMonths] = useState(6);

  const canManageSettings = hasPermission('canManageSettings');

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="text-2xl font-bold">{user?.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{user?.name}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            {[
              { id: 'low-stock', label: 'تنبيه المخزون المنخفض', enabled: true },
              { id: 'dead-stock', label: 'تنبيه المخزون الراكد', enabled: true },
              { id: 'new-purchase', label: 'فاتورة شراء جديدة', enabled: true },
              { id: 'new-surgery', label: 'عملية جراحية جديدة', enabled: true },
              { id: 'margin-warning', label: 'تحذير هامش الربح', enabled: true },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <span className="font-medium text-foreground">{item.label}</span>
                <button
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    item.enabled ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 rounded-full bg-primary-foreground transition-all',
                      item.enabled ? 'left-7' : 'left-1'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        );

      case 'permissions':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              صلاحيات المستخدمين في النظام
            </p>
            <div className="space-y-3">
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <div
                  key={role}
                  className="p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">{label}</p>
                    {user?.role === role && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        دورك الحالي
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'deadstock':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              تحديد فترة عدم الحركة التي يُعتبر بعدها الصنف مخزوناً راكداً
            </p>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                عدد الأشهر
              </label>
              <select
                value={deadStockMonths}
                onChange={(e) => setDeadStockMonths(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {[3, 6, 9, 12].map((months) => (
                  <option key={months} value={months}>
                    {months} أشهر
                  </option>
                ))}
              </select>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                الأصناف التي لم تتحرك منذ <span className="font-bold text-foreground">{deadStockMonths}</span> أشهر ستظهر كمخزون راكد في التحليلات.
              </p>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-border">
              <h4 className="font-medium text-foreground mb-2">تصدير البيانات</h4>
              <p className="text-sm text-muted-foreground mb-4">
                تصدير جميع بيانات المخزون والعمليات بصيغة Excel
              </p>
              <Button variant="outline">تصدير الآن</Button>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <h4 className="font-medium text-foreground mb-2">استيراد البيانات</h4>
              <p className="text-sm text-muted-foreground mb-4">
                استيراد بيانات المخزون من ملف Excel
              </p>
              <Button variant="outline">رفع ملف</Button>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium text-foreground mb-2">الدعم الفني</h4>
              <p className="text-sm text-muted-foreground mb-2">
                للتواصل مع فريق الدعم الفني:
              </p>
              <p className="text-sm text-primary" dir="ltr">
                support@ortho-supplies.com
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <h4 className="font-medium text-foreground mb-2">بيانات تسجيل الدخول التجريبية</h4>
              <div className="space-y-2 text-sm">
                <p><strong>إدخال بيانات:</strong> entry@hospital.com / entry123</p>
                <p><strong>مشرف:</strong> supervisor@hospital.com / super123</p>
                <p><strong>شريك:</strong> partner@hospital.com / partner123</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">الأسئلة الشائعة</h4>
              {[
                'كيف أسجل عملية جراحية جديدة؟',
                'كيف أقوم بقطع شريحة؟',
                'ما الفرق بين السعر الأساسي وسعر البيع؟',
              ].map((q) => (
                <div
                  key={q}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <span className="text-foreground">{q}</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground rtl-flip" />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="الإعدادات" description="إدارة إعدادات النظام والحساب" />

      {activeSection ? (
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <button
              onClick={() => setActiveSection(null)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-5 h-5 rtl-flip rotate-180" />
            </button>
            <h2 className="text-lg font-bold text-foreground">
              {sections.find((s) => s.id === activeSection)?.title}
            </h2>
          </div>
          <div className="p-6">{renderSectionContent()}</div>
          <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-secondary/30">
            <Button variant="outline" onClick={() => setActiveSection(null)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                'جاري الحفظ...'
              ) : (
                <>
                  <Check className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="flex items-center gap-4 p-6 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all text-right w-full group"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary rtl-flip" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
