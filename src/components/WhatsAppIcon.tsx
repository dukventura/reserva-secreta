import React from 'react';

/* Lucide nao tem logo de marca (WhatsApp, Instagram etc. ficam de fora
   de proposito no pacote deles) - esse path e' do Tabler Icons
   (brand-whatsapp, licenca MIT), desenhado no mesmo estilo de traco
   fino que os icones lucide usados no resto do site, pra nao destoar. */
export const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m3 21l1.65-3.8a9 9 0 1 1 3.4 2.9z" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0za5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </svg>
);
