import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, AlertCircle } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { ApiError } from '../lib/api';
import type { UserRole } from '../types';

const PAINEL_POR_PAPEL: Record<UserRole, string> = {
  master: '/painel/admin',
  gerente: '/painel/gerente',
  profissional: '/painel/profissional',
  contratante: '/',
};

export const LoginPage: React.FC = () => {
  const { entrar } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const sessao = await entrar(email, password);
      navigate(PAINEL_POR_PAPEL[sessao.role]);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display font-normal text-marfim">Entrar</h1>
        <p className="text-xs text-nevoa">
          Quer contratar? <Link to="/cadastro" className="text-ouro hover:text-champanhe">Cadastre-se como cliente</Link>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-grafite border border-white/10 p-6 sm:p-8">
        {erro && (
          <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{erro}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-nevoa mb-1.5">E-mail</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ouro absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-onix text-marfim text-sm rounded-campo pl-10 pr-4 py-3 border border-white/15 focus:border-ouro outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-nevoa mb-1.5">Senha</label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-ouro absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-onix text-marfim text-sm rounded-campo pl-10 pr-4 py-3 border border-white/15 focus:border-ouro outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full py-3.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-extrabold text-sm transition-all disabled:opacity-60"
        >
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};
