import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, UserCog, UserRound, Info } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import type { UserRole } from '../types';

const OPCOES: { role: UserRole; label: string; desc: string; icon: React.ReactNode; painel: string }[] = [
  { role: 'profissional', label: 'Profissional', desc: 'Edite seu anúncio, veja estatísticas e acompanhe a verificação.', icon: <UserRound className="w-5 h-5" />, painel: '/painel/profissional' },
  { role: 'gerente', label: 'Gerente do Site', desc: 'Modere anúncios, verificações e denúncias.', icon: <ShieldCheck className="w-5 h-5" />, painel: '/painel/gerente' },
  { role: 'master', label: 'Administrador Master', desc: 'Tudo do gerente, mais equipe, planos e log de auditoria.', icon: <UserCog className="w-5 h-5" />, painel: '/painel/admin' },
];

/* Sem back-end nao ha autenticacao real: esta tela troca de papel de
   demonstracao com um clique, para o cliente navegar pelos 4 niveis
   do plano estrategico sem precisar de senha nenhuma. */
export const LoginPage: React.FC = () => {
  const { entrarComo } = useSession();
  const navigate = useNavigate();

  const escolher = (role: UserRole, painel: string) => {
    entrarComo(role);
    navigate(painel);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display font-normal text-marfim">Entrar como...</h1>
        <p className="text-xs text-nevoa">Quer contratar? <Link to="/cadastro" className="text-ouro hover:text-champanhe">Cadastre-se como cliente</Link>.</p>
      </div>

      <div className="flex items-start space-x-2 bg-ouro/10 border border-ouro/20 p-3.5 text-xs text-champanhe">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Prévia de demonstração: sem senha, sem back-end. Cada opção abre a sessão de exemplo do respectivo papel para o cliente avaliar o plano estratégico.</span>
      </div>

      <div className="space-y-3">
        {OPCOES.map((op) => (
          <button
            key={op.role}
            onClick={() => escolher(op.role, op.painel)}
            className="w-full flex items-center space-x-4 p-4 sm:p-5 bg-grafite border border-white/10 hover:border-ouro/40 text-left transition-colors group"
          >
            <div className="w-11 h-11 shrink-0 bg-ouro/10 border border-ouro/20 flex items-center justify-center text-ouro group-hover:bg-ouro group-hover:text-black transition-colors">
              {op.icon}
            </div>
            <div>
              <div className="text-sm font-semibold text-marfim">{op.label}</div>
              <div className="text-xs text-nevoa mt-0.5">{op.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
