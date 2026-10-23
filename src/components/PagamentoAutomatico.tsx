import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Zap, AlertCircle } from 'lucide-react';
import { criarPixAutomatico, consultarPixAutomatico, ApiError } from '../lib/api';

interface PagamentoAutomaticoProps {
  pedidoId: number;
  // Chamado quando o PIX automatico nao esta disponivel (Sicredi nao
  // configurado ou fora do ar) - o painel cai pro PIX direto.
  onIndisponivel: () => void;
  onPago: () => void;
}

export const PagamentoAutomatico: React.FC<PagamentoAutomaticoProps> = ({ pedidoId, onIndisponivel, onPago }) => {
  const [codigo, setCodigo] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    criarPixAutomatico(pedidoId)
      .then(async ({ pix_copia_e_cola }) => {
        if (!ativo) return;
        setCodigo(pix_copia_e_cola);
        setQrDataUrl(await QRCode.toDataURL(pix_copia_e_cola, { margin: 1, width: 240 }));
      })
      .catch((err) => {
        if (!ativo) return;
        if (err instanceof ApiError && err.status === 503) onIndisponivel();
        else setErro(err instanceof ApiError ? err.message : 'Não foi possível gerar o PIX automático.');
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [pedidoId, onIndisponivel]);

  // Confere a cada 5s se o banco ja' confirmou - assim que confirmar, o
  // plano e' ativado no servidor e o painel recarrega mostrando ativo.
  useEffect(() => {
    if (!codigo) return;
    const intervalo = setInterval(() => {
      consultarPixAutomatico(pedidoId)
        .then(({ status }) => { if (status === 'pago' || status === 'resolvido') onPago(); })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(intervalo);
  }, [codigo, pedidoId, onPago]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Codigo continua visivel em texto pra copiar manualmente.
    }
  };

  if (erro) {
    return (
      <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{erro}</span>
      </div>
    );
  }

  return (
    <div className="bg-black/30 border border-ouro/30 p-4 space-y-3">
      <div className="flex items-center space-x-1.5 text-xs font-bold text-ouro uppercase tracking-wider">
        <Zap className="w-4 h-4" /><span>Pagamento com ativação automática</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {carregando || !qrDataUrl ? (
          <div className="w-40 h-40 bg-white/5 shrink-0 flex items-center justify-center text-[11px] text-nevoa text-center px-2">Gerando PIX...</div>
        ) : (
          <img src={qrDataUrl} alt="QR Code PIX" className="w-40 h-40 bg-white p-1.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0 space-y-2 w-full">
          <p className="text-xs text-nevoa">Escaneie o QR Code ou copie o código. Assim que o banco confirmar o pagamento, seu plano é ativado sozinho — pode deixar esta tela aberta.</p>
          <button
            onClick={copiar}
            disabled={!codigo}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-xs transition-colors disabled:opacity-60"
          >
            {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiado ? 'Código copiado!' : 'Copiar código PIX'}</span>
          </button>
          {codigo && <p className="text-[10px] text-nevoa/70 font-mono break-all select-all bg-white/5 border border-white/10 rounded-campo px-2 py-1.5">{codigo}</p>}
        </div>
      </div>
    </div>
  );
};
