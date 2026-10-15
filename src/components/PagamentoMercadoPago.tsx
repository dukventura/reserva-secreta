import React, { useEffect, useState } from 'react';
import { Copy, Check, Zap, AlertCircle } from 'lucide-react';
import { criarPixMercadoPago, ApiError } from '../lib/api';

interface PagamentoMercadoPagoProps {
  pedidoId: number;
}

export const PagamentoMercadoPago: React.FC<PagamentoMercadoPagoProps> = ({ pedidoId }) => {
  const [qrCodeBase64, setQrCodeBase64] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    criarPixMercadoPago(pedidoId)
      .then(({ qr_code_base64, qr_code }) => {
        if (!ativo) return;
        setQrCodeBase64(qr_code_base64);
        setQrCode(qr_code);
      })
      .catch((err) => { if (ativo) setErro(err instanceof ApiError ? err.message : 'Não foi possível gerar o PIX automático.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [pedidoId]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
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
        <Zap className="w-4 h-4" /><span>Pagamento automático (Mercado Pago)</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {carregando ? (
          <div className="w-40 h-40 bg-white/5 shrink-0 flex items-center justify-center text-[11px] text-nevoa text-center px-2">Gerando PIX...</div>
        ) : (
          <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code PIX" className="w-40 h-40 bg-white p-1.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0 space-y-2 w-full">
          <p className="text-xs text-nevoa">Escaneie o QR Code com o app do seu banco, ou copie o código abaixo. Assim que o Mercado Pago confirmar o pagamento, o plano é ativado automaticamente — sem precisar esperar a equipe.</p>
          <button
            onClick={copiar}
            disabled={carregando}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-xs transition-colors disabled:opacity-60"
          >
            {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiado ? 'Código copiado!' : 'Copiar código PIX'}</span>
          </button>
          {qrCode && <p className="text-[10px] text-nevoa/70 font-mono break-all select-all bg-white/5 border border-white/10 rounded-campo px-2 py-1.5">{qrCode}</p>}
        </div>
      </div>
    </div>
  );
};
