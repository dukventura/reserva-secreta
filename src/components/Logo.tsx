import React from 'react';

// Assets da logo nova (chave ornamentada) - PNG com fundo transparente
// de verdade. O lockup completo ja traz "Reserva Secreta" + "Guia
// Premium" desenhados dentro do proprio arquivo - nunca recriar esse
// texto em HTML do lado, ou fica duplicado/dessincronizado do que a
// imagem realmente diz.
const ICONE_CHAVE = '/brand/icone-chave.png';
const PROPORCAO_ICONE = 192 / 300; // largura/altura do recorte so' do icone

const LOGO_COMPLETA = '/brand/logo-completa.png';
const PROPORCAO_COMPLETA = 900 / 392; // largura/altura do lockup inteiro

interface MonogramaProps {
  /** Altura em px - a largura segue a proporcao natural do icone. */
  size?: number;
  className?: string;
}

export const Monograma: React.FC<MonogramaProps> = ({ size = 44, className = '' }) => (
  <img
    src={ICONE_CHAVE}
    alt="Reserva Secreta"
    width={Math.round(size * PROPORCAO_ICONE)}
    height={size}
    className={className}
  />
);

interface LogotipoProps {
  /** Altura em px - a largura segue a proporcao natural do lockup. */
  size?: number;
  className?: string;
}

// Icone + "Reserva Secreta" + "Guia Premium", tudo num unico arquivo -
// usar aqui em vez de Monograma sempre que o espaco permitir o lockup
// horizontal inteiro (navbar, sidebar dos paineis).
export const Logotipo: React.FC<LogotipoProps> = ({ size = 48, className = '' }) => (
  <img
    src={LOGO_COMPLETA}
    alt="Reserva Secreta — Guia Premium"
    width={Math.round(size * PROPORCAO_COMPLETA)}
    height={size}
    className={className}
  />
);
