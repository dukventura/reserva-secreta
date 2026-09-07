import React, { useState } from 'react';
import { PlusCircle, ShieldAlert, Menu, X } from 'lucide-react';
import { Monograma } from './Logo';

interface NavbarProps {
  onOpenAdvertise: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdvertise }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Monograma size={40} className="shrink-0" />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-display font-normal text-marfim leading-tight">
                Reserva <span className="italic text-ouro">Secreta</span>
              </span>
              <span className="text-[10px] sm:text-xs text-nevoa tracking-[0.16em] uppercase">
                Ilicínea &amp; Boa Esperança
              </span>
            </div>
          </div>

          {/* Desktop Right Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-campo bg-ouro/10 border border-ouro/20 text-ouro text-xs font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Perfis 100% Verificados</span>
            </div>

            <button
              onClick={onOpenAdvertise}
              className="flex items-center space-x-2 px-4 py-2 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Anuncie Conosco</span>
            </button>
          </div>

          {/* Mobile Right Action & Menu Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={onOpenAdvertise}
              className="px-3 py-1.5 rounded-campo bg-ouro text-black font-bold text-xs flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Anunciar</span>
            </button>
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
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdvertise();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-campo bg-ouro text-black font-bold text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Perfil / Anunciar</span>
            </button>
            <a
              href="#grid"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-campo bg-white/5 border border-white/10 text-nevoa font-medium text-sm"
            >
              <span>Ver Perfis Disponíveis</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
