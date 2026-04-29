import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Logo from '../components/Logo';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [isLogin, setIsLogin]     = useState(true);
  const [showPass, setShowPass]   = useState(false);
  const [formData, setFormData]   = useState({ username: '', email: '', password: '' });
  const { login, signup, error, isLoading, isAuthenticated, clearError } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await signup({ username: formData.username, email: formData.email, password: formData.password });
      }
      navigate('/');
    } catch { /* error handled in store */ }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Theme toggle top-right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Glassmorphism login card */}
      <div
        className="relative z-10 w-full max-w-md animate-fade-in"
      >
        <div
          className="p-10 rounded-3xl"
          style={{
            background: 'var(--card)',
            border: '1.5px solid var(--card-border)',
            backdropFilter: 'blur(24px) saturate(200%)',
            WebkitBackdropFilter: 'blur(24px) saturate(200%)',
            boxShadow: '0 8px 48px var(--shadow), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          {/* Logo */}
          <div className="mb-10 text-center">
            <div className="flex justify-center mb-6">
              <Logo size={80} />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
              {isLogin
                ? 'Sign in to your StockUp workspace'
                : 'Start managing your inventory today'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-slide-in"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <Input
                label="Username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                required={!isLogin}
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-[38px] transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full py-3.5 text-base rounded-xl group"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>

          {/* Toggle Mode */}
          <div className="mt-8 text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={toggleMode}
                className="ml-2 font-bold underline underline-offset-4 transition-colors"
                style={{ color: '#3b82f6' }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          © 2026 StockUp IOMS. All rights reserved.
        </p>
      </div>
    </div>
  );
}
