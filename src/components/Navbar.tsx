import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { PlusCircle, ShieldAlert, Menu, X, UserCircle2, LayoutDashboard, UserPlus } from 'lucide-react';
import { Monograma } from './Logo';
import { useSession } from '../context/SessionContext';

const PAINEL_POR_PAPEL: Record<string, string> = {
  master: '/painel/admin',
  gerente: '/painel/gerente',
  profissional: '/painel/profissional',
  contratante: '/',
};

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { session, sair } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#18080C]/95 backdrop-blur-xl border-b border-ouro/25 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo Marca */}
          <Link to="/" className="flex items-center space-x-3 group" onClick={() => setMobileMenuOpen(false)}>
            <Monograma size={40} className="shrink-0" />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-display font-semibold text-white leading-tight">
                Reserva <span className="italic text-ouro">Secreta</span>
              </span>
              <span className="text-[10px] sm:text-xs text-gray-300 tracking-[0.16em] uppercase">
                Acompanhantes VIP do Sul de Minas
              </span>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-ouro/15 border border-ouro/30 text-white text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-ouro" />
              <span>Perfis 100% Verificados</span>
            </div>

            <NavLink
              to="/cadastro"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-ouro to-[#B89243] text-black font-extrabold text-xs uppercase tracking-wide hover:brightness-110 transition-all shadow-md active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-black" />
              <span>Criar Conta Cliente</span>
            </NavLink>

            <NavLink
              to="/anunciar"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-grafite border border-ouro/40 text-white hover:bg-ouro/15 hover:border-ouro font-bold text-xs uppercase tracking-wide transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-ouro" />
              <span>Anunciar</span>
            </NavLink>

            {session ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={PAINEL_POR_PAPEL[session.role]}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:border-ouro/60 text-white text-xs font-bold transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-ouro" />
                  <span>{session.name}</span>
                </Link>
                <button
                  onClick={sair}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:border-white/40 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/entrar"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:border-ouro/60 text-white text-xs font-bold transition-colors"
              >
                <UserCircle2 className="w-4 h-4 text-ouro" />
                <span>Entrar</span>
              </Link>
            )}
          </div>

          {/* Menu de Ação Mobile */}
          <div className="flex items-center space-x-2 md:hidden">
            <Link
              to="/cadastro"
              className="px-3 py-1.5 rounded-lg bg-ouro text-black font-extrabold text-xs flex items-center space-x-1 shadow-md"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastrar</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-ouro" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/15 bg-[#18080C] px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-ouro/15 border border-ouro/30 text-white text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0 text-ouro" />
            <span>Guia exclusivo e discreto para maiores de 18 anos.</span>
          </div>

          <div className="space-y-2.5 pt-1">
            <Link
              to="/cadastro"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-gradient-to-r from-ouro to-[#B89243] text-black font-extrabold text-sm shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sou Cliente — Criar Conta Grátis</span>
            </Link>

            <Link
              to="/anunciar"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-[#270E15] border border-ouro/40 text-white font-bold text-sm"
            >
              <PlusCircle className="w-4 h-4 text-ouro" />
              <span>Sou Acompanhante — Quero Anunciar</span>
            </Link>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-white/5 border border-white/15 text-gray-200 font-medium text-sm"
            >
              <span>Ver Perfis Disponíveis</span>
            </Link>

            {session ? (
              <div className="flex gap-2">
                <Link
                  to={PAINEL_POR_PAPEL[session.role]}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-semibold"
                >
                  <LayoutDashboard className="w-4 h-4 text-ouro" />
                  <span>{session.name}</span>
                </Link>
                <button
                  onClick={() => { sair(); setMobileMenuOpen(false); }}
                  className="px-4 rounded-lg bg-white/10 border border-white/20 text-gray-300 text-sm font-semibold"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/entrar"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white font-semibold text-sm"
              >
                <UserCircle2 className="w-4 h-4 text-ouro" />
                <span>Entrar na Minha Conta</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
