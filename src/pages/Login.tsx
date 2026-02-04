import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Stethoscope, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    
    if (!success) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/30 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-lg">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            شركة الدلتا للمستلزمات الطبية
          </h1>
          <p className="text-muted-foreground mt-2">
            قم بتسجيل الدخول للوصول إلى لوحة التحكم
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 animate-slide-in-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@hospital.com"
                  required
                  className="w-full h-12 pr-10 pl-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 pr-10 pl-12 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-secondary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-medium"
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">
              بيانات تجريبية للدخول:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-muted-foreground">إدخال بيانات:</span>
                <code className="text-foreground font-mono text-xs" dir="ltr">
                  entry@hospital.com / entry123
                </code>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-muted-foreground">مشرف:</span>
                <code className="text-foreground font-mono text-xs" dir="ltr">
                  supervisor@hospital.com / super123
                </code>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-muted-foreground">شريك:</span>
                <code className="text-foreground font-mono text-xs" dir="ltr">
                  partner@hospital.com / partner123
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            تطوير وبرمجة:{' '}
            <a 
              href="https://wathqq.vercel.app/?fbclid=IwY2xjawPwaPdleHRuA2FlbQIxMABicmlkETFsUXBQbDlJYmt0N2thNVlmc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHmojtsZorR28kbMZ_11zq6Wq2isNV0PTvAD6znvZHimfvmQ3i4IbTFmVZ8X-_aem_CHPISzAUqxozJ9TGadfb2A"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline transition-all"
            >
              وثق Wathqq
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
