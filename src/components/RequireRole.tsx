import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import type { UserRole } from '../types';

const ROTULO_PAPEL: Record<UserRole, string> = {
  master: 'Administrador Master',
  gerente: 'Gerente do Site',
  profissional: 'Profissional',
  contratante: 'Contratante',
};

/* Guarda leve para os paineis logados. Sem back-end nao ha token pra
   validar - isto so orienta a navegacao da demonstracao: sem sessao,
   manda para /entrar; com papel errado, explica e oferece o caminho
   certo em vez de simplesmente bloquear. */
export const RequireRole: React.FC<{ allow: UserRole[]; children: React.ReactNode }> = ({ allow, children }) => {
  const { session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-onix p-4">
        <div className="max-w-sm w-full text-center space-y-4 bg-grafite border border-white/10 p-8">
          <ShieldAlert className="w-8 h-8 text-ouro mx-auto" />
          <h1 className="text-xl font-display text-marfim">Área restrita</h1>
          <p className="text-sm text-nevoa">Entre com uma sessão de demonstração para ver este painel.</p>
          <Link to="/entrar" className="inline-block px-5 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors">
            Ir para Entrar
          </Link>
        </div>
      </div>
    );
  }

  if (!allow.includes(session.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-onix p-4">
        <div className="max-w-sm w-full text-center space-y-4 bg-grafite border border-white/10 p-8">
          <ShieldAlert className="w-8 h-8 text-ouro mx-auto" />
          <h1 className="text-xl font-display text-marfim">Papel incompatível</h1>
          <p className="text-sm text-nevoa">
            Você está na sessão de <strong className="text-marfim">{ROTULO_PAPEL[session.role]}</strong>, mas este painel é de{' '}
            <strong className="text-marfim">{allow.map((r) => ROTULO_PAPEL[r]).join(' ou ')}</strong>.
          </p>
          <Link to="/entrar" className="inline-block px-5 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors">
            Trocar de papel
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
