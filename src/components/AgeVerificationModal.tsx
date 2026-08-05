import React from 'react';
import { ShieldAlert, Crown, CheckCircle } from 'lucide-react';

interface AgeVerificationModalProps {
  onConfirm: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#121218] rounded-3xl border border-amber-500/30 shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Crown Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 mx-auto shadow-lg shadow-amber-500/30">
          <div className="w-full h-full bg-[#0d0d12] rounded-[14px] flex items-center justify-center">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            Aviso de Conteúdo Adulto
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            GUIA <span className="text-gold-gradient">PRIME</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Este site contém materiais exclusivos para maiores de idade. Para continuar navegando, confirme se possui 18 anos ou mais.
          </p>
        </div>

        {/* Bullet points */}
        <div className="space-y-2 text-left bg-white/5 p-4 rounded-2xl border border-white/10 text-xs text-gray-300">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Perfis 100% reais e verificados em Ilicínea e Boa Esperança.</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Contato direto sem intermediários via WhatsApp.</span>
          </div>
          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Sigilo absoluto e navegação protegida.</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-xl shadow-amber-500/30 transition-all transform hover:scale-[1.02]"
          >
            SOU MAIOR DE 18 ANOS — ENTRAR
          </button>
          
          <button
            onClick={() => {
              window.location.href = 'https://www.google.com.br';
            }}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-medium text-xs transition-colors"
          >
            Sair do site
          </button>
        </div>

      </div>
    </div>
  );
};
