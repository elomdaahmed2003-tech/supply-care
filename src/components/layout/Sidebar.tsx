import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/types/roles';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingDown,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bone,
  ChevronLeft,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  permission?: 'canViewAnalytics' | 'canViewFinancials';
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/inventory', label: 'المخزون', icon: Package },
  { path: '/purchases', label: 'المشتريات', icon: ShoppingCart },
  { path: '/sales', label: 'العمليات الجراحية', icon: TrendingDown },
  { path: '/analytics', label: 'التحليلات', icon: BarChart3, permission: 'canViewAnalytics' },
  { path: '/reports', label: 'التقارير', icon: FileText, permission: 'canViewFinancials' },
  { path: '/settings', label: 'الإعدادات', icon: Settings },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, hasPermission, roleLabel, logout } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
          <Bone className="w-5 h-5" />
        </div>
        {!isCollapsed && (
          <div className="animate-fade-in">
            <h1 className="font-bold text-foreground">مستلزمات العظام</h1>
            <p className="text-xs text-muted-foreground">نظام إدارة سلسلة التوريد</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'animate-pulse-soft')} />
              {!isCollapsed && (
                <span className="font-medium animate-fade-in">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-3 animate-fade-in">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
              <span className="font-bold text-sm">
                {user?.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {roleLabel}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">تسجيل الخروج</span>}
        </button>
      </div>

      {/* Collapse Button (Desktop) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute top-20 -left-3 items-center justify-center w-6 h-6 rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-colors"
      >
        <ChevronLeft className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')} />
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 right-0 z-50 w-72 bg-sidebar transform transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 left-4 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col h-full">
          <NavContent />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed inset-y-0 right-0 bg-sidebar border-l border-sidebar-border transition-all duration-300 z-30',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <NavContent />
      </aside>

      {/* Spacer for main content */}
      <div className={cn('hidden lg:block flex-shrink-0 transition-all duration-300', isCollapsed ? 'w-20' : 'w-64')} />
    </>
  );
}
