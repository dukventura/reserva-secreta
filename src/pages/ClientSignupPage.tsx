import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, KeyRound, Info, UserRound, Users } from 'lucide-react';
import { useSession } from '../context/SessionContext';

/* Cadastro do contratante. Duas decisoes vieram direto da analise do
   concorrente no plano estrategico: telefone como porta de entrada, e
   a opcao de continuar so com apelido - sem vincular identidade real -
   porque discricao do lado de quem contrata tambem e produto. */

type Etapa = 'telefone' | 'codigo' | 'perfil';
const CODIGO_DEMO = '1234';

export const ClientSignupPage: React.FC = () => {
  const { entrarComo } = useSession();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<Etapa>('telefone');
  const [telefone, setTelefone] = useState('');
  const [codigo, setCodigo] = useState('');
  const [erroCodigo, setErroCodigo] = useState(false);
  const [identificado, setIdentificado] = useState(false);

  const handleEnviarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    if (telefone.replace(/\D/g, '').length < 10) return;
    setEtapa('codigo');
  };

  const handleConfirmarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigo !== CODIGO_DEMO) {
      setErroCodigo(true);
      return;
    }
    setEtapa('perfil');
  };

  const finalizarCadastro = () => {
    entrarComo('contratante');
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <div className="bg-grafite border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-normal text-marfim">
            Crie sua conta <span className="text-ouro">grátis</span>
          </h1>
          <p className="text-xs text-nevoa">Simples, rápido e discreto. Você decide o quanto quer se identificar.</p>
        </div>

        {etapa === 'telefone' && (
          <form onSubmit={handleEnviarCodigo} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-nevoa mb-1.5">Seu número de telefone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-ouro absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(35) 99999-9999"
                  className="w-full bg-onix text-marfim text-sm rounded-campo pl-10 pr-4 py-3 border border-white/15 focus:border-ouro outline-none"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-nevoa">Vamos enviar um código de confirmação. Seu número nunca fica visível para outros usuários.</p>
            </div>
            <button type="submit" className="w-full py-3.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-extrabold text-sm transition-all">
              Enviar código
            </button>
            <p className="text-center text-xs text-nevoa">
              Já tem conta? <Link to="/entrar" className="text-ouro hover:text-champanhe">Entrar</Link>
            </p>
          </form>
        )}

        {etapa === 'codigo' && (
          <form onSubmit={handleConfirmarCodigo} className="space-y-4">
            <div className="flex items-start space-x-2 bg-ouro/10 border border-ouro/20 p-3 text-xs text-champanhe">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Demonstração sem SMS real. Use o código <strong className="font-mono">{CODIGO_DEMO}</strong>.</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-nevoa mb-1.5">Código enviado para {telefone}</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-ouro absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={codigo}
                  onChange={(e) => { setCodigo(e.target.value); setErroCodigo(false); }}
                  placeholder="0000"
                  className={`w-full bg-onix text-marfim text-sm tracking-[0.3em] rounded-campo pl-10 pr-4 py-3 border outline-none ${erroCodigo ? 'border-red-500/60' : 'border-white/15 focus:border-ouro'}`}
                />
              </div>
              {erroCodigo && <p className="mt-1.5 text-[11px] text-red-400">Código incorreto. Tente {CODIGO_DEMO}.</p>}
            </div>
            <button type="submit" className="w-full py-3.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-extrabold text-sm transition-all">
              Confirmar
            </button>
          </form>
        )}

        {etapa === 'perfil' && (
          <div className="space-y-4">
            <p className="text-xs text-nevoa text-center">Como você quer aparecer na plataforma?</p>

            <button
              onClick={finalizarCadastro}
              className="w-full flex items-start space-x-3 p-4 border border-white/10 hover:border-ouro/40 bg-white/5 text-left transition-colors"
            >
              <Users className="w-5 h-5 text-ouro shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-marfim">Só com apelido</div>
                <div className="text-xs text-nevoa mt-0.5">Sem nome real, sem foto. Ninguém saberá quem você é — nem mesmo as anunciantes.</div>
              </div>
            </button>

            <button
              onClick={() => setIdentificado(true)}
              className={`w-full flex items-start space-x-3 p-4 border text-left transition-colors ${
                identificado ? 'border-ouro/40 bg-ouro/5' : 'border-white/10 hover:border-ouro/40 bg-white/5'
              }`}
            >
              <UserRound className="w-5 h-5 text-ouro shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-marfim">Com nome e foto</div>
                <div className="text-xs text-nevoa mt-0.5">Ajuda a gerar confiança nas conversas. Visível só para quem você contatar.</div>
              </div>
            </button>

            {identificado && (
              <div className="space-y-3 pt-1">
                <input placeholder="Seu nome" className="w-full bg-onix text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none" />
                <button onClick={finalizarCadastro} className="w-full py-3 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-all">
                  Concluir cadastro
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
