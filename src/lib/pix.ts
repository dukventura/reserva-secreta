// Gera o payload PIX "Copia e Cola" (BR Code) direto no navegador, sem
// nenhum gateway de pagamento - so' usa a propria chave PIX do negocio.
// Formato EMV definido pelo Banco Central (manual "BR Code"):
// https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf

const CHAVE_PIX = '10683495000154';
const NOME_RECEBEDOR = 'CILENE SOARES DA SILVA';
const CIDADE_RECEBEDOR = 'ILICINEA';

function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Cada campo EMV e': ID (2 digitos) + tamanho (2 digitos) + valor.
function campo(id: string, valor: string): string {
  const tamanho = String(valor.length).padStart(2, '0');
  return `${id}${tamanho}${valor}`;
}

// CRC16-CCITT (falso), polinomio 0x1021, valor inicial 0xFFFF - e'
// sempre o ultimo campo (ID 63), calculado sobre o payload inteiro ja
// incluindo o cabecalho "6304" desse proprio campo.
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixCobranca {
  valorCentavos: number;
  /** Identificador curto pra aparecer no comprovante e ajudar a conciliar manualmente - so' letras/numeros, sem espaco. */
  referencia: string;
}

export function gerarPayloadPix({ valorCentavos, referencia }: PixCobranca): string {
  const valor = (valorCentavos / 100).toFixed(2);
  const txid = removerAcentos(referencia).replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || 'RS';

  const merchantAccountInfo = campo('00', 'br.gov.bcb.pix') + campo('01', CHAVE_PIX);
  const additionalData = campo('05', txid);

  const semCrc =
    campo('00', '01') + // Payload Format Indicator
    campo('01', '11') + // Point of Initiation Method - estatico
    campo('26', merchantAccountInfo) + // Merchant Account Info (PIX)
    campo('52', '0000') + // Merchant Category Code
    campo('53', '986') + // Moeda - BRL
    campo('54', valor) + // Valor da cobranca
    campo('58', 'BR') + // Pais
    campo('59', NOME_RECEBEDOR.slice(0, 25)) + // Nome do recebedor
    campo('60', CIDADE_RECEBEDOR.slice(0, 15)) + // Cidade do recebedor
    campo('62', additionalData) + // Additional Data (txid)
    '6304'; // Cabecalho do CRC, sem o valor ainda

  return semCrc + crc16(semCrc);
}
