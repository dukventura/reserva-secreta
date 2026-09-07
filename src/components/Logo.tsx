import React from 'react';

/* A marca do manual de identidade v1.0.
   Os SVGs originais usam Bodoni Moda viva, entao precisam ser inline:
   um <img src="logo.svg"> renderiza em contexto isolado, sem acesso as
   fontes carregadas pela pagina, e o logotipo cairia para Times. */

interface MonogramaProps {
  /** Lado do quadrado em px. Abaixo de 48 o manual manda inverter. */
  size?: number;
  className?: string;
}

export const Monograma: React.FC<MonogramaProps> = ({ size = 44, className = '' }) => {
  // "Abaixo de 48 px o monograma inverte para ouro solido com letras em
  // onix - o fio de 1 px desaparece na renderizacao."
  const compacto = size < 48;
  const fundo = compacto ? '#C6A15B' : '#0B0B0C';
  const letras = compacto ? '#0B0B0C' : '#C6A15B';

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Reserva Secreta"
    >
      <rect width="240" height="240" fill={fundo} />
      {!compacto && (
        <rect x="20.5" y="20.5" width="199" height="199" fill="none" stroke="#C6A15B" strokeWidth="1" />
      )}
      <text
        x="120"
        y="146"
        textAnchor="middle"
        fontFamily="'Bodoni Moda', Georgia, serif"
        fontSize="92"
        fill={letras}
      >
        RS
      </text>
    </svg>
  );
};

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
