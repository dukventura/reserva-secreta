"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailConfigurado = emailConfigurado;
exports.enviarEmail = enviarEmail;
exports.enviarCodigo = enviarCodigo;
exports.conferirCodigo = conferirCodigo;
const nodemailer_1 = __importDefault(require("nodemailer"));
const node_crypto_1 = require("node:crypto");
const db_1 = require("./db");
/* Envio de e-mail pela conta do proprio cPanel (SMTP), sem servico
   externo. Sem as variaveis SMTP_* o envio vira no-op com log - o
   cadastro e o resto do site continuam funcionando. */
function emailConfigurado() {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}
let transporte = null;
function smtp() {
    if (transporte)
        return transporte;
    const porta = Number(process.env.SMTP_PORT ?? 465);
    transporte = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: porta,
        secure: porta === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return transporte;
}
const SITE = process.env.SITE_URL || 'https://reservasecreta.com.br';
// Layout unico, simples, que renderiza bem em Gmail/Outlook (tabela +
// estilo inline). Fundo escuro e dourado como o site.
function layout(titulo, corpoHtml) {
    return `<!doctype html><html><body style="margin:0;background:#0b0708;font-family:Arial,Helvetica,sans-serif;color:#e9e1d6">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0708;padding:32px 16px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#160c0f;border:1px solid #3a2a1c">
<tr><td style="padding:24px 28px;border-bottom:1px solid #3a2a1c;color:#c9a24b;font-size:18px;letter-spacing:3px">RESERVA SECRETA</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:20px;font-weight:normal;color:#ffffff">${titulo}</h1>
${corpoHtml}
</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #3a2a1c;font-size:11px;color:#8c8079">E-mail automático, não responda. <a href="${SITE}" style="color:#c9a24b">${SITE.replace('https://', '')}</a></td></tr>
</table></td></tr></table></body></html>`;
}
async function enviarEmail(para, assunto, titulo, corpoHtml, texto) {
    if (!emailConfigurado()) {
        console.warn(`E-mail nao configurado (SMTP_*), nao enviado: "${assunto}" para ${para}`);
        return;
    }
    await smtp().sendMail({
        from: process.env.EMAIL_FROM || `Reserva Secreta <${process.env.SMTP_USER}>`,
        to: para,
        subject: assunto,
        html: layout(titulo, corpoHtml),
        text: texto,
    });
}
const VALIDADE_MIN = 30;
const MAX_TENTATIVAS = 5;
function hashCodigo(codigo) {
    return (0, node_crypto_1.createHash)('sha256').update(codigo).digest('hex');
}
// Gera um codigo novo (invalida os anteriores do mesmo tipo) e manda
// por e-mail.
async function enviarCodigo(userId, email, tipo) {
    const codigo = String((0, node_crypto_1.randomInt)(0, 1000000)).padStart(6, '0');
    await db_1.db.updateTable('email_codes').set({ usado_em: new Date() })
        .where('user_id', '=', userId).where('tipo', '=', tipo).where('usado_em', 'is', null).execute();
    await db_1.db.insertInto('email_codes').values({
        user_id: userId,
        tipo,
        code_hash: hashCodigo(codigo),
        expires_at: new Date(Date.now() + VALIDADE_MIN * 60000),
    }).execute();
    const caixa = `<div style="margin:20px 0;padding:16px;background:#0b0708;border:1px solid #c9a24b;text-align:center;font-size:32px;letter-spacing:10px;color:#c9a24b;font-weight:bold">${codigo}</div>`;
    if (tipo === 'confirmacao') {
        await enviarEmail(email, `${codigo} é seu código de confirmação`, 'Confirme seu e-mail', `<p style="margin:0;font-size:14px;line-height:1.6">Use o código abaixo no seu painel para confirmar seu e-mail:</p>${caixa}<p style="margin:0;font-size:12px;color:#8c8079">Vale por ${VALIDADE_MIN} minutos. Se não foi você que criou a conta, ignore este e-mail.</p>`, `Seu código de confirmação do Reserva Secreta: ${codigo} (vale por ${VALIDADE_MIN} minutos).`);
    }
    else {
        await enviarEmail(email, `${codigo} é seu código para redefinir a senha`, 'Redefinir senha', `<p style="margin:0;font-size:14px;line-height:1.6">Recebemos um pedido para redefinir sua senha. Use este código:</p>${caixa}<p style="margin:0;font-size:12px;color:#8c8079">Vale por ${VALIDADE_MIN} minutos. Se não foi você, ignore este e-mail — sua senha continua a mesma.</p>`, `Seu código para redefinir a senha do Reserva Secreta: ${codigo} (vale por ${VALIDADE_MIN} minutos).`);
    }
}
// true se o codigo confere (e o marca como usado). Conta tentativa
// errada; passou do limite, o codigo morre e e' preciso pedir outro.
async function conferirCodigo(userId, tipo, codigo) {
    const registro = await db_1.db.selectFrom('email_codes')
        .select(['id', 'code_hash', 'tentativas'])
        .where('user_id', '=', userId).where('tipo', '=', tipo)
        .where('usado_em', 'is', null).where('expires_at', '>', new Date())
        .orderBy('id', 'desc')
        .executeTakeFirst();
    if (!registro || registro.tentativas >= MAX_TENTATIVAS)
        return false;
    if (registro.code_hash !== hashCodigo(codigo.trim())) {
        await db_1.db.updateTable('email_codes').set({ tentativas: registro.tentativas + 1 }).where('id', '=', registro.id).execute();
        return false;
    }
    const marcado = await db_1.db.updateTable('email_codes').set({ usado_em: new Date() })
        .where('id', '=', registro.id).where('usado_em', 'is', null).executeTakeFirst();
    return Number(marcado.numUpdatedRows) === 1;
}
