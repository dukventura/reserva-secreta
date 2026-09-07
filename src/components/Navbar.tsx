import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { PlusCircle, ShieldAlert, Menu, X, UserCircle2, LayoutDashboard } from 'lucide-react';
import { Monograma } from './Logo';
import { useSession } from '../context/SessionContext';

const PAINEL_POR_PAPEL: Record<string, string> = {
  master: '/painel/admin',
  gerente: '/painel/gerente',
  profissional: '/painel/profissional',
  contratante: '/', // contratante nao tem painel dedicado nesta leva
};

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { session, sair } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo Brand */}
          <Link to="/" className="flex items-center space-x-3 group" onClick={() => setMobileMenuOpen(false)}>
            <Monograma size={40} className="shrink-0" />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-display font-normal text-marfim leading-tight">
                Reserva <span className="italic text-ouro">Secreta</span>
              </span>
              <span className="text-[10px] sm:text-xs text-nevoa tracking-[0.16em] uppercase">
                Ilicínea &amp; Boa Esperança
              </span>
            </div>
          </Link>

          {/* Desktop Right Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-campo bg-ouro/10 border border-ouro/20 text-ouro text-xs font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Perfis 100% Verificados</span>
            </div>

            <NavLink
              to="/anunciar"
              className="flex items-center space-x-2 px-4 py-2 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Anuncie Conosco</span>
            </NavLink>

            {session ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={PAINEL_POR_PAPEL[session.role]}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-campo bg-white/5 border border-white/10 hover:border-ouro/40 text-marfim text-xs font-semibold transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-ouro" />
                  <span>{session.name}</span>
                </Link>
                <button
                  onClick={sair}
                  className="px-3 py-2 rounded-campo bg-white/5 border border-white/10 hover:border-white/30 text-nevoa hover:text-marfim text-xs font-semibold transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/entrar"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-campo bg-white/5 border border-white/10 hover:border-ouro/40 text-marfim text-xs font-semibold transition-colors"
              >
                <UserCircle2 className="w-4 h-4 text-ouro" />
                <span>Entrar</span>
              </Link>
            )}
          </div>

          {/* Mobile Right Action & Menu Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <Link
              to="/anunciar"
              className="px-3 py-1.5 rounded-campo bg-ouro text-black font-bold text-xs flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Anunciar</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-campo bg-white/5 border border-white/10 text-nevoa hover:text-marfim"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-onix px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2 p-3 rounded-campo bg-ouro/10 border border-ouro/20 text-ouro text-xs font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Guia exclusivo e discreto para maiores de 18 anos.</span>
          </div>

          <div className="space-y-2 pt-1">
            <Link
              to="/anunciar"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-campo bg-ouro text-black font-bold text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Perfil / Anunciar</span>
            </Link>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-campo bg-white/5 border border-white/10 text-nevoa font-medium text-sm"
            >
              <span>Ver Perfis Disponíveis</span>
            </Link>
            {session ? (
              <div className="flex gap-2">
                <Link
                  to={PAINEL_POR_PAPEL[session.role]}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-campo bg-white/5 border border-white/10 text-marfim text-sm font-semibold"
                >
                  <LayoutDashboard className="w-4 h-4 text-ouro" />
                  <span>{session.name}</span>
                </Link>
                <button
                  onClick={() => { sair(); setMobileMenuOpen(false); }}
                  className="px-4 rounded-campo bg-white/5 border border-white/10 text-nevoa text-sm font-semibold"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/entrar"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-campo bg-white/5 border border-white/10 text-marfim font-semibold text-sm"
              >
                <UserCircle2 className="w-4 h-4 text-ouro" />
                <span>Entrar</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
