import https from 'node:https';
import tls from 'node:tls';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';

/* API Pix de Recebimentos do Sicredi (padrao Bacen). Autenticacao por
   OAuth2 client_credentials + certificado do cliente (mTLS) em todas as
   chamadas. URLs e caminhos ficam em variavel de ambiente pra poder
   ajustar pelo Guia Tecnico deles (homologacao x producao) sem mexer
   no codigo. */

interface ConfigSicredi {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  chavePix: string;
  agent: https.Agent;
}

let config: ConfigSicredi | null = null;

// O portal entrega os .CER as vezes em PEM, as vezes em DER (binario) -
// o guia manda converter na mao com openssl; aqui converte sozinho.
function lerCertificado(caminho: string): string {
  const conteudo = fs.readFileSync(caminho);
  const texto = conteudo.toString('utf8');
  if (texto.includes('-----BEGIN')) return texto;
  const base64 = conteudo.toString('base64').match(/.{1,64}/g)!.join('\n');
  return `-----BEGIN CERTIFICATE-----\n${base64}\n-----END CERTIFICATE-----\n`;
}

export function sicrediConfigurado(): boolean {
  return Boolean(
    process.env.SICREDI_CLIENT_ID && process.env.SICREDI_CLIENT_SECRET &&
    process.env.SICREDI_CERT_PATH && process.env.SICREDI_KEY_PATH && process.env.SICREDI_CHAVE_PIX,
  );
}

function cfg(): ConfigSicredi {
  if (config) return config;
  if (!sicrediConfigurado()) throw new Error('Credenciais do Sicredi ausentes no ambiente.');
  config = {
    apiUrl: (process.env.SICREDI_API_URL || 'https://api-pix.sicredi.com.br').replace(/\/$/, ''),
    clientId: process.env.SICREDI_CLIENT_ID!,
    clientSecret: process.env.SICREDI_CLIENT_SECRET!,
    chavePix: process.env.SICREDI_CHAVE_PIX!,
    agent: new https.Agent({
      cert: lerCertificado(process.env.SICREDI_CERT_PATH!),
      // Chave SEM frase secreta (o portal oferece as duas versoes).
      key: fs.readFileSync(process.env.SICREDI_KEY_PATH!),
      // Cadeia Sicredi somada as CAs publicas: o guia manda confiar na
      // cadeia deles, mas substituir as CAs padrao quebraria se o
      // servidor deles usar certificado de CA publica.
      ...(process.env.SICREDI_CA_PATH && { ca: [...tls.rootCertificates, lerCertificado(process.env.SICREDI_CA_PATH)] }),
    }),
  };
  return config;
}

function requisicao<T>(metodo: string, caminho: string, headers: Record<string, string>, corpo?: string): Promise<T> {
  const { apiUrl, agent } = cfg();
  const url = new URL(apiUrl + caminho);
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: metodo, agent, headers }, (res) => {
      let dados = '';
      res.on('data', (c) => { dados += c; });
      res.on('end', () => {
        const status = res.statusCode ?? 0;
        if (status < 200 || status >= 300) {
          reject(new Error(`Sicredi ${metodo} ${caminho} respondeu ${status}: ${dados.slice(0, 500)}`));
          return;
        }
        try {
          resolve((dados ? JSON.parse(dados) : {}) as T);
        } catch {
          reject(new Error(`Sicredi ${metodo} ${caminho}: resposta nao e' JSON.`));
        }
      });
    });
    req.on('error', reject);
    if (corpo) req.write(corpo);
    req.end();
  });
}

// Token dura alguns minutos; cada processo do Passenger mantem o seu,
// o que so' significa um pedido de token a mais por processo.
let tokenCache: { token: string; expiraEm: number } | null = null;

async function token(): Promise<string> {
  if (tokenCache && tokenCache.expiraEm > Date.now() + 30_000) return tokenCache.token;
  const { clientId, clientSecret } = cfg();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const escopo = process.env.SICREDI_SCOPE || 'cob.write cob.read';
  const corpo = new URLSearchParams({ grant_type: 'client_credentials', scope: escopo }).toString();
  const resp = await requisicao<{ access_token: string; expires_in: number }>(
    'POST', process.env.SICREDI_TOKEN_PATH || '/oauth/token',
    { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': String(Buffer.byteLength(corpo)) },
    corpo,
  );
  tokenCache = { token: resp.access_token, expiraEm: Date.now() + resp.expires_in * 1000 };
  return resp.access_token;
}

// Guia Tecnico Sicredi v2.1 usa /api/v3/cob nos exemplos.
function caminhoCob(): string {
  return process.env.SICREDI_COB_PATH || '/api/v3/cob';
}

// txid do padrao Bacen: 26 a 35 caracteres alfanumericos.
export function gerarTxid(pedidoId: number): string {
  const prefixo = `RS${pedidoId}`;
  const aleatorio = randomBytes(16).toString('hex');
  return (prefixo + aleatorio).slice(0, 32);
}

export interface CobrancaSicredi {
  txid: string;
  status: 'ATIVA' | 'CONCLUIDA' | 'REMOVIDA_PELO_USUARIO_RECEBEDOR' | 'REMOVIDA_PELO_PSP';
  pixCopiaECola: string;
}

export async function criarCobranca(params: { txid: string; valorCentavos: number; descricao: string }): Promise<CobrancaSicredi> {
  const corpo = JSON.stringify({
    calendario: { expiracao: 3600 },
    // modalidadeAlteracao 0 = pagador nao pode mudar o valor (recomendacao do guia Sicredi).
    valor: { original: (params.valorCentavos / 100).toFixed(2), modalidadeAlteracao: 0 },
    chave: cfg().chavePix,
    solicitacaoPagador: params.descricao.slice(0, 140),
  });
  return requisicao<CobrancaSicredi>('PUT', `${caminhoCob()}/${params.txid}`, {
    Authorization: `Bearer ${await token()}`,
    'Content-Type': 'application/json',
    'Content-Length': String(Buffer.byteLength(corpo)),
  }, corpo);
}

export async function consultarCobranca(txid: string): Promise<CobrancaSicredi> {
  return requisicao<CobrancaSicredi>('GET', `${caminhoCob()}/${txid}`, { Authorization: `Bearer ${await token()}` });
}
