import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, ExternalLink } from 'lucide-react';
import { Monograma } from '../components/Logo';
import { useSession } from '../context/SessionContext';
import type { UserRole } from '../types';

export interface DashboardNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const ROTULO_PAPEL: Record<UserRole, string> = {
  master: 'Administrador Master',
  gerente: 'Gerente do Site',
  profissional: 'Profissional',
  contratante: 'Contratante',
};

interface DashboardLayoutProps {
  title: string;
  navItems: DashboardNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  children: React.ReactNode;
}

/* Casca compartilhada dos 3 paineis logados (profissional, gerente,
   master). Cada painel gerencia suas proprias abas via activeKey/
   onSelect em vez de sub-rotas aninhadas - suficiente para uma
   demonstracao navegavel, e mais simples de revisar com o cliente. */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, navItems, activeKey, onSelect, children }) => {
  const { session, sair } = useSession();

  return (
    <div className="min-h-screen bg-onix text-marfim flex flex-col sm:flex-row font-sans">
      {/* Sidebar */}
      <aside className="sm:w-64 shrink-0 border-b sm:border-b-0 sm:border-r border-white/10 bg-grafite flex flex-col">
        <Link to="/" className="flex items-center space-x-2.5 px-5 py-5 border-b border-white/10">
          <Monograma size={32} />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-display text-marfim">Reserva <span className="italic text-ouro">Secreta</span></span>
            <span className="text-[10px] text-nevoa uppercase tracking-wider">{title}</span>
          </div>
        </Link>

        <nav className="flex-1 p-3 flex sm:flex-col gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-campo text-sm font-medium whitespace-nowrap transition-colors text-left ${
                activeKey === item.key
                  ? 'bg-ouro/15 border border-ouro/30 text-champanhe'
                  : 'border border-transparent text-nevoa hover:bg-white/5 hover:text-marfim'
              }`}
            >
              <span className="text-ouro shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-campo text-sm font-medium text-nevoa hover:text-marfim hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-ouro" />
            <span>Ver site público</span>
          </Link>
          <button
            onClick={sair}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-campo text-sm font-medium text-nevoa hover:text-marfim hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4 text-ouro" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/10 bg-grafite/40">
          <h1 className="text-lg sm:text-xl font-display font-normal text-marfim">{title}</h1>
          {session && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-nevoa">{session.name}</span>
              <span className="px-2.5 py-1 rounded-campo bg-ouro/10 border border-ouro/20 text-ouro font-semibold uppercase tracking-wide">
                {ROTULO_PAPEL[session.role]}
              </span>
            </div>
          )}
        </header>
        <div className="flex-1 p-5 sm:p-8 overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
};
