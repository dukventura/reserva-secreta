import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, KeyRound, Info, UserRound, Users, CheckCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useSession } from '../context/SessionContext';

type Etapa = 'telefone' | 'codigo' | 'perfil';
const CODIGO_DEMO = '1234';

export const ClientSignupPage: React.FC = () => {
  const { entrarComo } = useSession();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<Etapa>('telefone');
  const [telefone, setTelefone] = useState('');
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [erroTelefone, setErroTelefone] = useState('');
  const [erroCodigo, setErroCodigo] = useState(false);
  const [identificado, setIdentificado] = useState(false);
  const [timer, setTimer] = useState(45);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (etapa === 'codigo' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [etapa, timer]);

  const handleEnviarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    const apenasNumeros = telefone.replace(/\D/g, '');
    
    if (apenasNumeros.length < 10) {
      setErroTelefone('Por favor, digite seu número com DDD (mínimo 10 dígitos). Ex: (35) 99999-9999');
      return;
    }
    
    setErroTelefone('');
    setEtapa('codigo');
    setTimer(45);
  };

  const handleConfirmarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigo.trim() !== CODIGO_DEMO) {
      setErroCodigo(true);
      return;
    }
    setEtapa('perfil');
  };

  const handlePreencherCodigoDemo = () => {
    setCodigo(CODIGO_DEMO);
    setErroCodigo(false);
  };

  const finalizarCadastro = () => {
    entrarComo('contratante');
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 sm:py-16">
      
      {/* Container Principal em Tom Vinho Nobre */}
      <div className="bg-[#270E15] border border-ouro/30 rounded-2xl shadow-2xl p-6 sm:p-10 space-y-8 backdrop-blur-xl">
        
        {/* Header do Form */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-ouro/15 border border-ouro/30 text-ouro text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-ouro" />
            <span>Cadastro 100% Discreto</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-white">
            Crie sua conta <span className="text-ouro font-serif">grátis</span>
          </h1>
          <p className="text-sm text-gray-300 max-w-sm mx-auto">
            Rápido, seguro e sigiloso. Você decide se quer usar apelido ou nome real.
          </p>
        </div>

        {/* 📊 INDICADOR DE ETAPAS (STEPPER) */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 text-xs sm:text-sm font-semibold">
          <div className={`flex items-center space-x-2 ${etapa === 'telefone' ? 'text-ouro font-bold' : 'text-gray-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${etapa === 'telefone' ? 'bg-ouro text-black' : 'bg-white/10 text-gray-400'}`}>1</span>
            <span>Telefone</span>
          </div>
          <div className="w-8 h-[1px] bg-white/15" />
          <div className={`flex items-center space-x-2 ${etapa === 'codigo' ? 'text-ouro font-bold' : 'text-gray-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${etapa === 'codigo' ? 'bg-ouro text-black' : 'bg-white/10 text-gray-400'}`}>2</span>
            <span>Verificação</span>
          </div>
          <div className="w-8 h-[1px] bg-white/15" />
          <div className={`flex items-center space-x-2 ${etapa === 'perfil' ? 'text-ouro font-bold' : 'text-gray-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${etapa === 'perfil' ? 'bg-ouro text-black' : 'bg-white/10 text-gray-400'}`}>3</span>
            <span>Perfil</span>
          </div>
        </div>

        {/* ETAPA 1: DIGITAR TELEFONE */}
        {etapa === 'telefone' && (
          <form onSubmit={handleEnviarCodigo} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-200">
                Seu número de celular / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-ouro absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={telefone}
                  onChange={(e) => {
                    setTelefone(e.target.value);
                    if (erroTelefone) setErroTelefone('');
                  }}
                  placeholder="(35) 99999-9999"
                  className={`w-full bg-[#18080C] text-white placeholder-gray-400 text-base rounded-xl pl-12 pr-4 py-3.5 border transition-all outline-none ${
                    erroTelefone ? 'border-red-500 focus:ring-2 focus:ring-red-500/30' : 'border-white/20 focus:border-ouro focus:ring-2 focus:ring-ouro/30'
                  }`}
                />
              </div>

              {erroTelefone ? (
                <p className="text-xs text-red-400 font-medium">{erroTelefone}</p>
              ) : (
                <p className="text-xs text-gray-300">
                  🔒 Enviaremos um código de 4 dígitos via SMS/WhatsApp. Seu número **nunca** fica público no site.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-ouro to-[#B89243] text-black font-extrabold text-base hover:brightness-110 transition-all shadow-xl shadow-ouro/20 flex items-center justify-center space-x-2 active:scale-98"
            >
              <span>Receber Código de Verificação</span>
              <ArrowRight className="w-5 h-5 text-black" />
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
        )}

        {/* ETAPA 2: DIGITAR CÓDIGO COM FEEDBACK VISUAL CLARO */}
        {etapa === 'codigo' && (
          <form onSubmit={handleConfirmarCodigo} className="space-y-6 animate-fadeIn">
            
            {/* Banner de Sucesso do Envio */}
            <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-4 text-xs sm:text-sm text-emerald-200 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white text-sm">Código Enviado com Sucesso!</div>
                <div>Enviamos uma mensagem com o código de 4 dígitos para <strong className="text-emerald-300 font-semibold">{telefone}</strong>.</div>
              </div>
            </div>

            {/* Alerta demonstrativo para testes rápidos do cliente */}
            <div className="bg-ouro/15 border border-ouro/40 rounded-xl p-4 text-xs sm:text-sm text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-ouro shrink-0" />
                <span>Código de demonstração: <strong className="font-mono text-ouro text-base">1234</strong></span>
              </div>
              <button
                type="button"
                onClick={handlePreencherCodigoDemo}
                className="px-3 py-1 bg-ouro text-black text-xs font-bold rounded-lg hover:bg-white transition-colors"
              >
                Preencher 1234
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-200">
                Digite o código de 4 dígitos
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-ouro absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={codigo}
                  onChange={(e) => {
                    setCodigo(e.target.value);
                    if (erroCodigo) setErroCodigo(false);
                  }}
                  placeholder="0000"
                  className={`w-full bg-[#18080C] text-white text-lg tracking-[0.4em] font-mono rounded-xl pl-12 pr-4 py-3.5 border outline-none transition-all ${
                    erroCodigo ? 'border-red-500 focus:ring-2 focus:ring-red-500/30' : 'border-white/20 focus:border-ouro focus:ring-2 focus:ring-ouro/30'
                  }`}
                />
              </div>

              {erroCodigo && (
                <p className="text-xs text-red-400 font-semibold">
                  ❌ Código incorreto. Para testar agora, use o código <strong className="underline">1234</strong>.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-ouro to-[#B89243] text-black font-extrabold text-base hover:brightness-110 transition-all shadow-xl shadow-ouro/20 flex items-center justify-center space-x-2 active:scale-98"
            >
              <span>Confirmar e Continuar</span>
              <ArrowRight className="w-5 h-5 text-black" />
            </button>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEtapa('telefone')}
                className="hover:text-ouro transition-colors underline"
              >
                ← Alterar telefone ({telefone})
              </button>

              <button
                type="button"
                disabled={timer > 0}
                onClick={() => setTimer(45)}
                className={`flex items-center space-x-1 ${timer > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-ouro hover:underline'}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{timer > 0 ? `Reenviar em ${timer}s` : 'Reenviar código'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ETAPA 3: ESCOLHA DE PRIVACIDADE E FINALIZAÇÃO */}
        {etapa === 'perfil' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">Como você quer se identificar?</h2>
              <p className="text-xs text-gray-300">Sua privacidade é prioridade absoluta no Reserva Secreta.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={finalizarCadastro}
                className="w-full flex items-start space-x-4 p-5 rounded-xl border-2 border-ouro/60 hover:border-ouro bg-white/5 text-left transition-all hover:bg-ouro/10 shadow-lg group"
              >
                <div className="w-10 h-10 rounded-full bg-ouro/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-ouro group-hover:text-black transition-colors">
                  <Users className="w-5 h-5 text-ouro group-hover:text-black" />
                </div>
                <div>
                  <div className="text-base font-bold text-white group-hover:text-ouro transition-colors">
                    1. Ficar Anônimo / Apelido Discreto (Recomendado)
                  </div>
                  <div className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Sem foto e sem seu nome real. Ninguém saberá quem você é — nem mesmo as acompanhantes ao conversar no WhatsApp.
                  </div>
                </div>
              </button>

              <button
                onClick={() => setIdentificado(true)}
                className={`w-full flex items-start space-x-4 p-5 rounded-xl border-2 text-left transition-all ${
                  identificado ? 'border-ouro bg-ouro/15 shadow-xl' : 'border-white/15 hover:border-ouro/60 bg-white/5'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <UserRound className="w-5 h-5 text-ouro" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">
                    2. Identificação com Nome
                  </div>
                  <div className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Gera maior confiança na negociação. Visível apenas para quem você contatar.
                  </div>
                </div>
              </button>
            </div>

            {identificado && (
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">Seu nome ou apelido</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Eduardo Silva"
                    className="w-full bg-[#18080C] text-white text-sm rounded-xl px-4 py-3 border border-white/20 focus:border-ouro outline-none"
                  />
                </div>
                <button
                  onClick={finalizarCadastro}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-ouro to-[#B89243] text-black font-extrabold text-base hover:brightness-110 transition-all shadow-xl"
                >
                  Concluir Cadastro e Acessar
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
