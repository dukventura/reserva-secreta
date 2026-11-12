import React, { useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { solicitarTrocaEmail, confirmarTrocaEmail, ApiError } from '../lib/api';

interface TrocarEmailProps {
  emailAtual: string;
  onTrocado: (novoEmail: string) => void;
}

export function TrocarEmail({ emailAtual, onTrocado }: TrocarEmailProps) {
  const [aberto, setAberto] = useState(false);
  const [fase, setFase] = useState<'solicitar' | 'confirmar'>('solicitar');
  const [novoEmail, setNovoEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const reset = () => {
    setFase('solicitar');
    setNovoEmail('');
    setCodigo('');
    setErro('');
    setSucesso('');
  };

  const handleFechar = () => {
    setAberto(false);
    reset();
  };

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);
    try {
      await solicitarTrocaEmail(novoEmail.trim().toLowerCase());
      setSucesso(`Código enviado para ${novoEmail.trim().toLowerCase()}`);
      setFase('confirmar');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível enviar o código.');
    } finally {
      setCarregando(false);
    }
  };

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await confirmarTrocaEmail(novoEmail.trim().toLowerCase(), codigo.trim());
      setSucesso('E-mail trocado com sucesso!');
      onTrocado(novoEmail.trim().toLowerCase());
      setTimeout(() => {
        setAberto(false);
        reset();
      }, 1500);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível confirmar a troca.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-grafite border border-white/10 p-4 space-y-3">
      <button
        type="button"
        onClick={() => { setAberto((v) => !v); if (aberto) reset(); }}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="flex items-center space-x-2 text-xs font-semibold text-nevoa uppercase tracking-wide">
          <Mail className="w-3.5 h-3.5 text-ouro" />
          <span>Trocar e-mail</span>
        </span>
        {aberto
          ? <ChevronUp className="w-4 h-4 text-nevoa" />
          : <ChevronDown className="w-4 h-4 text-nevoa" />}
      </button>

      {aberto && (
        <div className="space-y-3 pt-1">
          {erro && (
            <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}
          {sucesso && fase === 'confirmar' && (
            <div className="flex items-start space-x-2 bg-verificado/10 border border-verificado/30 p-3 text-xs text-verificado-texto">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{sucesso}</span>
            </div>
          )}
          {sucesso && fase === 'solicitar' && (
            <div className="flex items-start space-x-2 bg-verificado/10 border border-verificado/30 p-3 text-xs text-verificado-texto">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{sucesso}</span>
            </div>
          )}

          {fase === 'solicitar' && (
            <form onSubmit={handleSolicitar} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-nevoa mb-1.5">
                  Novo e-mail
                </label>
                <input
                  type="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  required
                  className="w-full bg-onix text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none"
                />
                <p className="mt-1 text-[11px] text-nevoa">
                  E-mail atual: <span className="text-marfim">{emailAtual}</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={carregando}
                  className="px-4 py-2 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-xs transition-colors disabled:opacity-60"
                >
                  {carregando ? 'Enviando...' : 'Enviar código'}
                </button>
                <button
                  type="button"
                  onClick={handleFechar}
                  className="text-xs text-nevoa hover:text-marfim transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {fase === 'confirmar' && (
            <form onSubmit={handleConfirmar} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-nevoa mb-1.5">
                  Código de 6 dígitos
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  className="w-full bg-onix text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none tracking-widest"
                />
                <p className="mt-1 text-[11px] text-nevoa">
                  Código enviado para <span className="text-marfim">{novoEmail.trim().toLowerCase()}</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={carregando || codigo.length !== 6}
                  className="px-4 py-2 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-xs transition-colors disabled:opacity-60"
                >
                  {carregando ? 'Confirmando...' : 'Confirmar troca'}
                </button>
                <button
                  type="button"
                  onClick={() => { setFase('solicitar'); setErro(''); setSucesso(''); setCodigo(''); }}
                  className="text-xs text-nevoa hover:text-marfim transition-colors"
                >
                  Voltar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
