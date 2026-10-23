"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sicrediConfigurado = sicrediConfigurado;
exports.gerarTxid = gerarTxid;
exports.criarCobranca = criarCobranca;
exports.consultarCobranca = consultarCobranca;
const node_https_1 = __importDefault(require("node:https"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_crypto_1 = require("node:crypto");
let config = null;
function sicrediConfigurado() {
    return Boolean(process.env.SICREDI_CLIENT_ID && process.env.SICREDI_CLIENT_SECRET &&
        process.env.SICREDI_CERT_PATH && process.env.SICREDI_KEY_PATH && process.env.SICREDI_CHAVE_PIX);
}
function cfg() {
    if (config)
        return config;
    if (!sicrediConfigurado())
        throw new Error('Credenciais do Sicredi ausentes no ambiente.');
    config = {
        apiUrl: (process.env.SICREDI_API_URL || 'https://api-pix.sicredi.com.br').replace(/\/$/, ''),
        clientId: process.env.SICREDI_CLIENT_ID,
        clientSecret: process.env.SICREDI_CLIENT_SECRET,
        chavePix: process.env.SICREDI_CHAVE_PIX,
        agent: new node_https_1.default.Agent({
            cert: node_fs_1.default.readFileSync(process.env.SICREDI_CERT_PATH),
            key: node_fs_1.default.readFileSync(process.env.SICREDI_KEY_PATH),
            ...(process.env.SICREDI_CA_PATH && { ca: node_fs_1.default.readFileSync(process.env.SICREDI_CA_PATH) }),
        }),
    };
    return config;
}
function requisicao(metodo, caminho, headers, corpo) {
    const { apiUrl, agent } = cfg();
    const url = new URL(apiUrl + caminho);
    return new Promise((resolve, reject) => {
        const req = node_https_1.default.request(url, { method: metodo, agent, headers }, (res) => {
            let dados = '';
            res.on('data', (c) => { dados += c; });
            res.on('end', () => {
                const status = res.statusCode ?? 0;
                if (status < 200 || status >= 300) {
                    reject(new Error(`Sicredi ${metodo} ${caminho} respondeu ${status}: ${dados.slice(0, 500)}`));
                    return;
                }
                try {
                    resolve((dados ? JSON.parse(dados) : {}));
                }
                catch {
                    reject(new Error(`Sicredi ${metodo} ${caminho}: resposta nao e' JSON.`));
                }
            });
        });
        req.on('error', reject);
        if (corpo)
            req.write(corpo);
        req.end();
    });
}
// Token dura alguns minutos; cada processo do Passenger mantem o seu,
// o que so' significa um pedido de token a mais por processo.
let tokenCache = null;
async function token() {
    if (tokenCache && tokenCache.expiraEm > Date.now() + 30000)
        return tokenCache.token;
    const { clientId, clientSecret } = cfg();
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const escopo = process.env.SICREDI_SCOPE || 'cob.write cob.read';
    const corpo = new URLSearchParams({ grant_type: 'client_credentials', scope: escopo }).toString();
    const resp = await requisicao('POST', process.env.SICREDI_TOKEN_PATH || '/oauth/token', { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': String(Buffer.byteLength(corpo)) }, corpo);
    tokenCache = { token: resp.access_token, expiraEm: Date.now() + resp.expires_in * 1000 };
    return resp.access_token;
}
// txid do padrao Bacen: 26 a 35 caracteres alfanumericos.
function gerarTxid(pedidoId) {
    const prefixo = `RS${pedidoId}`;
    const aleatorio = (0, node_crypto_1.randomBytes)(16).toString('hex');
    return (prefixo + aleatorio).slice(0, 32);
}
async function criarCobranca(params) {
    const corpo = JSON.stringify({
        calendario: { expiracao: 3600 },
        valor: { original: (params.valorCentavos / 100).toFixed(2) },
        chave: cfg().chavePix,
        solicitacaoPagador: params.descricao.slice(0, 140),
    });
    return requisicao('PUT', `/api/v2/cob/${params.txid}`, {
        Authorization: `Bearer ${await token()}`,
        'Content-Type': 'application/json',
        'Content-Length': String(Buffer.byteLength(corpo)),
    }, corpo);
}
async function consultarCobranca(txid) {
    return requisicao('GET', `/api/v2/cob/${txid}`, { Authorization: `Bearer ${await token()}` });
}
