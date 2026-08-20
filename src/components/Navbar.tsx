import React, { useState } from 'react';
import { Crown, Sparkles, PlusCircle, ShieldAlert, Menu, X } from 'lucide-react';

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
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#08080a] rounded-[10px] flex items-center justify-center">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
                  RESERVA <span className="text-gold-gradient">SECRETA</span>
                </span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse-slow hidden sm:inline-block" />
              </div>
              <span className="text-[10px] sm:text-xs text-amber-400/90 tracking-wider font-semibold">
                reservasecreta.com.br • Ilicínea & Boa Esperança
              </span>
            </div>
          </div>

          {/* Desktop Right Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Perfis 100% Verificados</span>
            </div>

            <button
              onClick={onOpenAdvertise}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Anuncie Conosco</span>
            </button>
          </div>

          {/* Mobile Right Action & Menu Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={onOpenAdvertise}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs flex items-center space-x-1 shadow-md shadow-amber-500/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Anunciar</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0c0c10] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Guia exclusivo e discreto para maiores de 18 anos.</span>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdvertise();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm shadow-lg shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Perfil / Anunciar</span>
            </button>
            <a
              href="#grid"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium text-sm"
            >
              <span>Ver Perfis Disponíveis</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
