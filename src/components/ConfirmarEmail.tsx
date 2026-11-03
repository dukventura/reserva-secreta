import React, { useState } from 'react';
import { CheckCircle2, Circle, Mail } from 'lucide-react';
import { pedirCodigoEmail, confirmarEmail, ApiError } from '../lib/api';

interface ConfirmarEmailProps {
  confirmado: boolean;
  onConfirmado: () => void;
}

/* O cadastro ja manda um codigo; aqui a pessoa digita, ou pede outro
   se nao chegou / expirou. */
export const ConfirmarEmail: React.FC<ConfirmarEmailProps> = ({ confirmado, onConfirmado }) => {
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [erro, setErro] = useState('');

  const reenviar = async () => {
    setEnviando(true);
    setErro('');
    setAviso('');
    try {
      const { email } = await pedirCodigoEmail();
      setAviso(`Código enviado para ${email}. Confira também a caixa de spam.`);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível enviar o código.');
    } finally {
      setEnviando(false);
    }
  };

  const confirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro('');
    try {
      await confirmarEmail(codigo);
      onConfirmado();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível confirmar.');
      setEnviando(false);
    }
  };

  if (confirmado) {
    return (
      <div className="flex items-center space-x-2.5 bg-grafite border border-white/10 p-4">
        <CheckCircle2 className="w-5 h-5 text-verificado-texto" />
        <span className="text-sm text-marfim">E-mail confirmado</span>
      </div>
    );
  }

  return (
    <div className="bg-grafite border border-ouro/30 p-4 space-y-3">
      <div className="flex items-start space-x-2.5">
        <Circle className="w-5 h-5 text-nevoa shrink-0" />
        <div>
          <div className="text-sm text-marfim">Confirme seu e-mail</div>
          <div className="text-xs text-nevoa">Enviamos um código de 6 dígitos para o seu e-mail quando você se cadastrou. Digite abaixo.</div>
        </div>
      </div>
      <form onSubmit={confirmar} className="flex gap-2">
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="w-32 bg-onix text-marfim text-center tracking-[0.3em] text-sm rounded-campo px-3 py-2 border border-white/15 focus:border-ouro outline-none"
        />
        <button
          type="submit"
          disabled={enviando || codigo.length !== 6}
          className="px-4 py-2 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-xs transition-colors disabled:opacity-50"
        >
          Confirmar
        </button>
      </form>
      <button type="button" onClick={reenviar} disabled={enviando} className="flex items-center space-x-1.5 text-xs text-ouro hover:text-champanhe disabled:opacity-50">
        <Mail className="w-3.5 h-3.5" /><span>Não recebi — enviar novo código</span>
      </button>
      {aviso && <p className="text-xs text-verificado-texto">{aviso}</p>}
      {erro && <p className="text-xs text-red-400">{erro}</p>}
    </div>
  );
};
