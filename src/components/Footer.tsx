import React from 'react';
import { Crown, ShieldAlert, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#060608] border-t border-white/10 text-gray-400 text-xs py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Logo & Tagline */}
          <div className="md:col-span-6 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black">
                <Crown className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                GUIA <span className="text-gold-gradient">PRIME</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-md">
              O catálogo mais exclusivo e discreto de acompanhantes VIP em Ilicínea, Boa Esperança e Região do Sul de Minas.
            </p>
          </div>

          {/* Quick Info & 18+ Disclaimer */}
          <div className="md:col-span-6 flex flex-col md:items-end space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>CONTEÚDO ESTRITAMENTE 18+</span>
            </div>
            <p className="text-[11px] text-gray-400 max-w-sm text-left md:text-right">
              Este site atua exclusivamente como veículo de publicidade. Não intermediamos pagamentos nem agendamentos.
            </p>
          </div>

        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-gray-400 space-y-2">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
            <Lock className="w-4 h-4" />
            <span>Aviso Legal & Termos de Uso</span>
          </div>
          <p className="leading-relaxed">
            O <strong>Guia Prime</strong> é uma plataforma publicitária independente destinada ao público adulto (18+). Todas as acompanhantes anunciadas são maiores de idade, atuam de forma autônoma e declaram possuir os direitos das imagens publicadas. A plataforma não possui vínculo empregatício com as anunciantes.
          </p>
        </div>

        {/* Copyright & Subfooter */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
          <div>
            © {new Date().getFullYear()} <strong>Guia Prime</strong>. Todos os direitos reservados.
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-amber-400 transition-colors">Termos de Uso</a>
            <span>•</span>
            <a href="#" className="hover:text-amber-400 transition-colors">Política de Privacidade</a>
            <span>•</span>
            <a href="#" className="hover:text-amber-400 transition-colors">Contato</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
