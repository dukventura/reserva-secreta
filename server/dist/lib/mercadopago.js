"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mercadoPagoConfigurado = mercadoPagoConfigurado;
exports.criarPixMercadoPago = criarPixMercadoPago;
exports.buscarPagamentoMercadoPago = buscarPagamentoMercadoPago;
exports.validarAssinaturaWebhook = validarAssinaturaWebhook;
const mercadopago_1 = require("mercadopago");
const node_crypto_1 = require("node:crypto");
function accessToken() {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
        throw new Error('MERCADOPAGO_ACCESS_TOKEN ausente - configure no .env antes de usar pagamento automatico.');
    }
    return token;
}
let client = null;
function mpClient() {
    if (!client)
        client = new mercadopago_1.MercadoPagoConfig({ accessToken: accessToken() });
    return client;
}
function mercadoPagoConfigurado() {
    return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}
// Cria uma cobranca PIX na API do Mercado Pago - eles geram o QR Code
// e o codigo copia-e-cola prontos, a gente so' repassa pro front.
async function criarPixMercadoPago(params) {
    const payment = new mercadopago_1.Payment(mpClient());
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
async function buscarPagamentoMercadoPago(paymentId) {
    const payment = new mercadopago_1.Payment(mpClient());
    return payment.get({ id: paymentId });
}
// Confere a assinatura do webhook (header x-signature) contra o
// manifesto esperado, pra garantir que a notificacao veio mesmo do
// Mercado Pago e nao de qualquer um batendo nesse endpoint publico.
// https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks
function validarAssinaturaWebhook(params) {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret || !params.xSignature || !params.xRequestId)
        return false;
    const partes = Object.fromEntries(params.xSignature.split(',').map((p) => {
        const [k, v] = p.split('=');
        return [k?.trim(), v?.trim()];
    }));
    const ts = partes.ts;
    const hashRecebido = partes.v1;
    if (!ts || !hashRecebido)
        return false;
    const manifest = `id:${params.dataId};request-id:${params.xRequestId};ts:${ts};`;
    const hashEsperado = (0, node_crypto_1.createHmac)('sha256', secret).update(manifest).digest('hex');
    try {
        return (0, node_crypto_1.timingSafeEqual)(Buffer.from(hashRecebido), Buffer.from(hashEsperado));
    }
    catch {
        return false;
    }
}
