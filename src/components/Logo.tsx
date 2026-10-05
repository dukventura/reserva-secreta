import React from 'react';

// Icone da logo nova (chave ornamentada) - PNG com fundo transparente
// de verdade, recortado do lockup completo em public/brand/.
const ICONE_CHAVE = '/brand/icone-chave.png';
const PROPORCAO_ICONE = 192 / 300; // largura/altura do recorte original

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
  /** Linha em caixa alta sob o fio. Omitida quando ausente. */
  assinatura?: string;
  className?: string;
}

export const Logotipo: React.FC<LogotipoProps> = ({ assinatura, className = '' }) => (
  <svg
    viewBox={assinatura ? '0 0 680 180' : '0 0 680 140'}
    className={className}
    role="img"
    aria-label="Reserva Secreta"
  >
    <text x="40" y="104" fontFamily="'Bodoni Moda', Georgia, serif" fontSize="64" fill="#F4F1EA" letterSpacing="1">
      Reserva
    </text>
    <text
      x="330"
      y="104"
      fontFamily="'Bodoni Moda', Georgia, serif"
      fontSize="64"
      fontStyle="italic"
      fill="#C6A15B"
      letterSpacing="1"
    >
      Secreta
    </text>
    <rect x="40" y="124" width="600" height="1" fill="#C6A15B" opacity="0.55" />
    {assinatura && (
      <text
        x="40"
        y="152"
        fontFamily="'Jost', system-ui, sans-serif"
        fontSize="13"
        letterSpacing="6.5"
        fill="#F4F1EA"
        opacity="0.75"
      >
        {assinatura}
      </text>
    )}
  </svg>
);
