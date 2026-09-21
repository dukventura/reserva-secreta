import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, UserRound, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { ApiError } from '../lib/api';

export const ClientSignupPage: React.FC = () => {
  const { registrarContratante } = useSession();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await registrarContratante({ name: nome, email, password: senha });
      navigate('/');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível criar sua conta. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 sm:py-16">
      <div className="bg-[#270E15] border border-ouro/30 rounded-2xl shadow-2xl p-6 sm:p-10 space-y-8 backdrop-blur-xl">

        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-ouro/15 border border-ouro/30 text-ouro text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-ouro" />
            <span>Cadastro 100% Discreto</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-white">
            Crie sua conta <span className="text-ouro font-serif">grátis</span>
          </h1>
          <p className="text-sm text-gray-300 max-w-sm mx-auto">
            Pode usar um apelido — não pedimos documento nem foto para você contratar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {erro && (
            <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-200">Nome ou apelido</label>
            <div className="relative">
              <UserRound className="w-5 h-5 text-ouro absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                minLength={2}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Eduardo Silva"
                className="w-full bg-[#18080C] text-white placeholder-gray-400 text-base rounded-xl pl-12 pr-4 py-3.5 border border-white/20 focus:border-ouro focus:ring-2 focus:ring-ouro/30 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-200">E-mail</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-ouro absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-[#18080C] text-white placeholder-gray-400 text-base rounded-xl pl-12 pr-4 py-3.5 border border-white/20 focus:border-ouro focus:ring-2 focus:ring-ouro/30 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-200">Senha</label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-ouro absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-[#18080C] text-white placeholder-gray-400 text-base rounded-xl pl-12 pr-4 py-3.5 border border-white/20 focus:border-ouro focus:ring-2 focus:ring-ouro/30 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-ouro to-[#B89243] text-black font-extrabold text-base hover:brightness-110 transition-all shadow-xl shadow-ouro/20 flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-60"
          >
            <span>{enviando ? 'Criando conta...' : 'Criar minha conta'}</span>
            {!enviando && <ArrowRight className="w-5 h-5 text-black" />}
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-300">
              Já tem uma conta?{' '}
              <Link to="/entrar" className="text-ouro font-bold hover:underline">
                Entrar aqui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
