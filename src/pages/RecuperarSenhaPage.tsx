import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { esqueciSenha, redefinirSenha, ApiError } from '../lib/api';
import { useSeo } from '../hooks/useSeo';

const inputCls = 'w-full bg-onix text-marfim text-sm rounded-campo pl-10 pr-4 py-3 border border-white/15 focus:border-ouro outline-none';

export const RecuperarSenhaPage: React.FC = () => {
  useSeo({ title: 'Recuperar senha', noindex: true });
  const [etapa, setEtapa] = useState<'email' | 'codigo' | 'pronto'>('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const pedirCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro('');
    try {
      await esqueciSenha(email);
      setEtapa('codigo');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível enviar o código.');
    } finally {
      setEnviando(false);
    }
  };

  const redefinir = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro('');
    try {
      await redefinirSenha({ email, codigo, nova_senha: senha });
      setEtapa('pronto');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível redefinir a senha.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display font-normal text-marfim">Recuperar senha</h1>
        <p className="text-xs text-nevoa">
          {etapa === 'email' && 'Informe o e-mail da sua conta. Vamos enviar um código para criar uma senha nova.'}
          {etapa === 'codigo' && `Se existir uma conta com ${email}, o código chegou lá. Confira também o spam.`}
        </p>
      </div>

      {erro && (
        <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{erro}</span>
        </div>
      )}

      {etapa === 'email' && (
        <form onSubmit={pedirCodigo} className="space-y-4 bg-grafite border border-white/10 p-6 sm:p-8">
          <div className="relative">
            <Mail className="w-4 h-4 text-ouro absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className={inputCls} />
          </div>
          <button type="submit" disabled={enviando} className="w-full py-3.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-extrabold text-sm transition-all disabled:opacity-60">
            {enviando ? 'Enviando...' : 'Enviar código'}
          </button>
        </form>
      )}

      {etapa === 'codigo' && (
        <form onSubmit={redefinir} className="space-y-4 bg-grafite border border-white/10 p-6 sm:p-8">
          <div>
            <label className="block text-xs font-semibold text-nevoa mb-1.5">Código de 6 dígitos</label>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full bg-onix text-marfim text-center tracking-[0.4em] text-lg rounded-campo px-4 py-3 border border-white/15 focus:border-ouro outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-nevoa mb-1.5">Nova senha (mínimo 8 caracteres)</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-ouro absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" className={inputCls} />
            </div>
          </div>
          <button type="submit" disabled={enviando || codigo.length !== 6} className="w-full py-3.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-extrabold text-sm transition-all disabled:opacity-60">
            {enviando ? 'Salvando...' : 'Salvar nova senha'}
          </button>
          <button type="button" onClick={() => { setEtapa('email'); setCodigo(''); }} className="w-full text-xs text-ouro hover:text-champanhe">
            Não recebi — pedir outro código
          </button>
        </form>
      )}

      {etapa === 'pronto' && (
        <div className="bg-grafite border border-white/10 p-6 sm:p-8 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-verificado-texto mx-auto" />
          <p className="text-sm text-marfim">Senha alterada. Já pode entrar com a senha nova.</p>
          <Link to="/entrar" className="inline-block px-5 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors">Entrar</Link>
        </div>
      )}
    </div>
  );
};
