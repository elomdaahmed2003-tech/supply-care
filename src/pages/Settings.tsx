import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  adminOnly?: boolean;
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
    description: 'إدارة صلاحيات المستخدمين',
    icon: Shield,
    adminOnly: true,
  },
  {
    id: 'data',
    title: 'البيانات',
    description: 'تصدير واستيراد البيانات',
    icon: Database,
    adminOnly: true,
  },
  {
    id: 'help',
    title: 'المساعدة',
    description: 'الدعم الفني والأسئلة الشائعة',
    icon: HelpCircle,
  },
];

export default function Settings() {
  const { user, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredSections = sections.filter(
    (section) => !section.adminOnly || isAdmin
  );

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
                  {isAdmin ? 'مدير النظام' : 'موظف المخزون'}
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
              { id: 'new-purchase', label: 'فاتورة شراء جديدة', enabled: true },
              { id: 'new-sale', label: 'عملية بيع جديدة', enabled: false },
              { id: 'daily-report', label: 'التقرير اليومي', enabled: true },
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
              إدارة صلاحيات المستخدمين والوصول للنظام
            </p>
            <div className="space-y-3">
              {[
                { role: 'مدير النظام', permissions: 'كل الصلاحيات' },
                { role: 'موظف المخزون', permissions: 'عرض وتعديل المخزون فقط' },
              ].map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.permissions}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    تعديل
                  </Button>
                </div>
              ))}
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
                support@hospital-supplies.com
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">الأسئلة الشائعة</h4>
              {[
                'كيف أضيف صنف جديد؟',
                'كيف أسجل فاتورة شراء؟',
                'كيف أصدر تقرير المخزون؟',
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
          {filteredSections.map((section) => {
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
