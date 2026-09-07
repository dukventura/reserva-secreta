import React from 'react';
import { ShieldAlert, Crown, CheckCircle } from 'lucide-react';

interface AgeVerificationModalProps {
  onConfirm: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-grafite rounded-none border border-ouro/30 shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Crown Icon Header */}
        <div className="w-16 h-16 rounded-none bg-ouro p-0.5 mx-auto">
          <div className="w-full h-full bg-onix rounded-none flex items-center justify-center">
            <Crown className="w-8 h-8 text-ouro" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-campo bg-ouro/10 border border-ouro/30 text-ouro">
            Aviso de Conteúdo Adulto
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-normal text-marfim tracking-tight">
            Reserva <span className="italic text-ouro">Secreta</span>
          </h2>
          <p className="text-xs sm:text-sm text-nevoa leading-relaxed">
            Este site contém materiais exclusivos para maiores de idade. Para continuar navegando, confirme se possui 18 anos ou mais.
          </p>
        </div>

        {/* Bullet points */}
        <div className="space-y-2 text-left bg-white/5 p-4 rounded-none border border-white/10 text-xs text-nevoa">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-verificado-texto shrink-0 mt-0.5" />
            <span>Perfis 100% reais e verificados em Ilicínea e Boa Esperança.</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-verificado-texto shrink-0 mt-0.5" />
            <span>Contato direto sem intermediários via WhatsApp.</span>
          </div>
          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-ouro shrink-0 mt-0.5" />
            <span>Sigilo absoluto e navegação protegida.</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-extrabold text-sm transition-all transform hover:scale-[1.02]"
          >
            SOU MAIOR DE 18 ANOS — ENTRAR
          </button>
          
          <button
            onClick={() => {
              window.location.href = 'https://www.google.com.br';
            }}
            className="w-full py-2.5 rounded-campo bg-white/5 hover:bg-white/10 text-nevoa hover:text-marfim font-medium text-xs transition-colors"
          >
            Sair do site
          </button>
        </div>

      </div>
    </div>
  );
};
