import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../domain/models/User';
import { Modal } from '../../design-system/molecules/Modal';
import { Input } from '../../design-system/atoms/Input';
import { Button } from '../../design-system/atoms/Button';
import { Shield, Building, Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, preferredRole } = useAuth();
  const [role, setRole] = useState<UserRole>(preferredRole || 'admin');
  const [email, setEmail] = useState(preferredRole === 'supplier' ? 'taller@barversuit.com' : 'admin@barversuit.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
  };

  const handleQuickLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      login('admin@barversuit.com', 'admin');
    } else {
      login('taller.cibao@barversuit.com', 'supplier', 'sup_central_01');
    }
  };

  return (
    <Modal
      isOpen={isLoginModalOpen}
      onClose={closeLoginModal}
      title="Acceso Seguro a la Plataforma"
      size="md"
    >
      <div className="space-y-5">
        {/* Role Selector Tabs */}
        <div
          className="flex items-center p-1 rounded-xl border"
          style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
        >
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setEmail('admin@barversuit.com');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === 'admin' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Administrador
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('supplier');
              setEmail('taller.cibao@barversuit.com');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === 'supplier' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" /> Proveedor / Taller
          </button>
        </div>

        {/* Demo Fast Logins banner */}
        <div className="p-3 rounded-xl border bg-brand-500/10 border-brand-500/20 space-y-2">
          <p className="text-[11px] font-bold text-brand-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Acceso Rápido para Demostración:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="px-2.5 py-1 rounded bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-semibold transition-colors"
            >
              Demo Admin 🛡️
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('supplier')}
              className="px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-600 text-white text-[11px] font-semibold transition-colors"
            >
              Demo Taller 🏭
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              rightIcon={<ArrowRight className="w-4 h-4" />}
              style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
            >
              Ingresar como {role === 'admin' ? 'Administrador' : 'Proveedor Taller'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
