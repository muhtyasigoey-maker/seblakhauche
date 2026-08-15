import React from 'react';

interface AdminLoginViewProps {
  onLoginSuccess: (email: string) => void;
  onCancel: () => void;
}

export default function AdminLoginView({ onLoginSuccess, onCancel }: AdminLoginViewProps) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      // Validate credentials
      const validUsernames = ['haucheprasmanan', 'admin', 'admin@seblakhauche.id', 'administrator'];
      if (validUsernames.includes(username.trim().toLowerCase()) && password === 'adminhauche') {
        onLoginSuccess(username);
      } else {
        setErrorMsg('Username atau password admin salah!');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div id="admin-login-view" className="max-w-md mx-auto my-12">
      <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-xl space-y-8 relative overflow-hidden">
        {/* Flame decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>

        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
            <span className="material-symbols-outlined text-3xl font-bold">admin_panel_settings</span>
          </div>
          <h1 className="font-anybody text-2xl font-black text-slate-900 tracking-tight">
            Admin Topping Vault
          </h1>
          <p className="font-plus text-xs text-slate-500 mt-2 leading-relaxed">
            Silakan masuk untuk mengelola inventaris topping, memproses antrian dapur, dan memantau analitik dapur.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 font-plus">
            <span className="material-symbols-outlined text-base">error</span>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin-username-input" className="block text-xs font-bold text-slate-700 mb-2 font-plus uppercase">
              Username Administrator
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                person
              </span>
              <input
                id="admin-username-input"
                type="text"
                required
                placeholder="Masukkan username admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-4 font-plus text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password-input" className="block text-xs font-bold text-slate-700 font-plus uppercase mb-2">
              Kata Sandi Admin
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                lock
              </span>
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan kata sandi admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-12 font-plus text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-hidden transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg select-none">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-500 select-none font-plus cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-200 text-red-500 focus:ring-red-500" />
              Ingat Saya
            </label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Silakan hubungi administrator utama untuk reset kata sandi.');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium font-plus"
            >
              Lupa sandi?
            </a>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={loading}
            className={`w-full bg-slate-950 hover:bg-slate-850 text-white font-bold py-4 rounded-xl transition-all cursor-pointer font-plus text-xs flex items-center justify-center gap-2 shadow-md ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                Memproses masuk...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm font-bold">login</span>
                Login Sebagai Admin
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1 cursor-pointer font-plus transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Kembali ke Etalase Toko
          </button>
        </div>
      </div>
    </div>
  );
}
