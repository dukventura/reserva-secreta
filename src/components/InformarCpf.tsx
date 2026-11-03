import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { informarCpf, ApiError } from '../lib/api';
import { formatarCpf } from '../lib/cpf';

interface InformarCpfProps {
  cpfMascara: string | null;
  onInformado: () => void;
}

/* Cadastros feitos antes da trava por CPF informam aqui - sem isso o
   anuncio nao pode ser enviado pra aprovacao. */
export const InformarCpf: React.FC<InformarCpfProps> = ({ cpfMascara, onInformado }) => {
  const [cpf, setCpf] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      await informarCpf(cpf);
      onInformado();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível salvar o CPF.');
      setSalvando(false);
    }
  };

  if (cpfMascara) {
    return (
      <div className="flex items-center space-x-2.5 bg-grafite border border-white/10 p-4">
        <CheckCircle2 className="w-5 h-5 text-verificado-texto" />
        <span className="text-sm text-marfim">CPF informado <span className="font-mono text-nevoa">{cpfMascara}</span></span>
      </div>
    );
  }

  return (
    <div className="bg-grafite border border-ouro/30 p-4 space-y-3">
      <div className="flex items-start space-x-2.5">
        <Circle className="w-5 h-5 text-nevoa shrink-0" />
        <div>
          <div className="text-sm text-marfim">Informe seu CPF</div>
          <div className="text-xs text-nevoa">Obrigatório para enviar o anúncio. Garante um cadastro por pessoa — nunca aparece no anúncio e não guardamos o número completo.</div>
        </div>
      </div>
      <form onSubmit={salvar} className="flex gap-2">
        <input
          inputMode="numeric"
          value={cpf}
          onChange={(e) => setCpf(formatarCpf(e.target.value))}
          placeholder="000.000.000-00"
          className="w-44 bg-onix text-marfim text-sm rounded-campo px-3 py-2 border border-white/15 focus:border-ouro outline-none"
        />
        <button
          type="submit"
          disabled={salvando || cpf.replace(/\D/g, '').length !== 11}
          className="px-4 py-2 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-xs transition-colors disabled:opacity-50"
        >
          Salvar
        </button>
      </form>
      {erro && <p className="text-xs text-red-400">{erro}</p>}
    </div>
  );
};
