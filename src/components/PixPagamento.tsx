import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, QrCode } from 'lucide-react';
import { gerarPayloadPix } from '../lib/pix';

interface PixPagamentoProps {
  valorCentavos: number;
  referencia: string;
}

export const PixPagamento: React.FC<PixPagamentoProps> = ({ valorCentavos, referencia }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiado, setCopiado] = useState(false);

  const payload = gerarPayloadPix({ valorCentavos, referencia });

  useEffect(() => {
    let ativo = true;
    QRCode.toDataURL(payload, { margin: 1, width: 240 })
      .then((url) => { if (ativo) setQrDataUrl(url); })
      .catch(() => {});
    return () => { ativo = false; };
  }, [payload]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Clipboard pode falhar (contexto nao-seguro, permissao negada,
      // navegador antigo) - o codigo continua visivel em texto pra
      // selecionar e copiar manualmente como alternativa.
    }
  };

  return (
    <div className="bg-black/30 border border-ouro/30 p-4 space-y-3">
      <div className="flex items-center space-x-1.5 text-xs font-bold text-ouro uppercase tracking-wider">
        <QrCode className="w-4 h-4" /><span>Pague com PIX</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="QR Code PIX" className="w-40 h-40 bg-white p-1.5 shrink-0" />
        ) : (
          <div className="w-40 h-40 bg-white/5 shrink-0" />
        )}
        <div className="flex-1 min-w-0 space-y-2 w-full">
          <p className="text-xs text-nevoa">Escaneie o QR Code com o app do seu banco, ou copie o código abaixo e cole na opção "Pix Copia e Cola".</p>
          <button
            onClick={copiar}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-xs transition-colors"
          >
            {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiado ? 'Código copiado!' : 'Copiar código PIX'}</span>
          </button>
          <p className="text-[10px] text-nevoa/70 font-mono break-all select-all bg-white/5 border border-white/10 rounded-campo px-2 py-1.5">{payload}</p>
          <p className="text-[11px] text-nevoa">Assim que o pagamento cair, nossa equipe confirma e o plano é ativado no seu anúncio.</p>
        </div>
      </div>
    </div>
  );
};
