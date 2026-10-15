import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createHmac, timingSafeEqual } from 'node:crypto';

function accessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN ausente - configure no .env antes de usar pagamento automatico.');
  }
  return token;
}

let client: MercadoPagoConfig | null = null;
function mpClient(): MercadoPagoConfig {
  if (!client) client = new MercadoPagoConfig({ accessToken: accessToken() });
  return client;
}

export function mercadoPagoConfigurado(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export interface PixMercadoPago {
  paymentId: string;
  qrCodeBase64: string;
  qrCode: string;
}

// Cria uma cobranca PIX na API do Mercado Pago - eles geram o QR Code
// e o codigo copia-e-cola prontos, a gente so' repassa pro front.
export async function criarPixMercadoPago(params: {
  valorCentavos: number;
  descricao: string;
  referenciaExterna: string;
  payerEmail: string;
}): Promise<PixMercadoPago> {
  const payment = new Payment(mpClient());
  const resultado = await payment.create({
    body: {
      transaction_amount: params.valorCentavos / 100,
      description: params.descricao,
      payment_method_id: 'pix',
      external_reference: params.referenciaExterna,
      payer: { email: params.payerEmail },
    },
    requestOptions: { idempotencyKey: params.referenciaExterna },
  });

  const dados = resultado.point_of_interaction?.transaction_data;
  if (!resultado.id || !dados?.qr_code || !dados?.qr_code_base64) {
    throw new Error('Mercado Pago não retornou os dados do PIX.');
  }
  return { paymentId: String(resultado.id), qrCodeBase64: dados.qr_code_base64, qrCode: dados.qr_code };
}

export async function buscarPagamentoMercadoPago(paymentId: string) {
  const payment = new Payment(mpClient());
  return payment.get({ id: paymentId });
}

// Confere a assinatura do webhook (header x-signature) contra o
// manifesto esperado, pra garantir que a notificacao veio mesmo do
// Mercado Pago e nao de qualquer um batendo nesse endpoint publico.
// https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks
export function validarAssinaturaWebhook(params: {
  xSignature: string | undefined;
  xRequestId: string | undefined;
  dataId: string;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret || !params.xSignature || !params.xRequestId) return false;

  const partes = Object.fromEntries(
    params.xSignature.split(',').map((p) => {
      const [k, v] = p.split('=');
      return [k?.trim(), v?.trim()];
    }),
  );
  const ts = partes.ts;
  const hashRecebido = partes.v1;
  if (!ts || !hashRecebido) return false;

  const manifest = `id:${params.dataId};request-id:${params.xRequestId};ts:${ts};`;
  const hashEsperado = createHmac('sha256', secret).update(manifest).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(hashRecebido), Buffer.from(hashEsperado));
  } catch {
    return false;
  }
}
