import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SITE_URL = 'https://reservasecreta.com.br';
const TITULO_PADRAO = 'Reserva Secreta | Acompanhantes VIP e de Luxo';
const DESCRICAO_PADRAO =
  'Guia exclusivo e discreto de acompanhantes de luxo em todo o Brasil. Perfis verificados com fotos reais e contato direto.';
const IMAGEM_PADRAO = `${SITE_URL}/brand/logo-completa.png`;

interface SeoOptions {
  title?: string;
  description?: string;
  image?: string | null;
  // Paginas privadas (login, paineis, cadastro) nao devem aparecer no Google.
  noindex?: boolean;
}

// O site e' uma SPA: o index.html e' o mesmo para todas as rotas, entao
// sem isto toda pagina chegaria ao Google com o mesmo titulo e descricao.
// Atualizamos as tags que ja existem no index.html em vez de criar
// novas, pra nao deixar duplicatas no <head>.
function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

export function useSeo({ title, description, image, noindex }: SeoOptions = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const titulo = title ? `${title} | Reserva Secreta` : TITULO_PADRAO;
    const descricao = description ?? DESCRICAO_PADRAO;
    const url = `${SITE_URL}${pathname}`;
    const imagem = image ?? IMAGEM_PADRAO;

    document.title = titulo;
    setMeta('name', 'description', descricao);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', titulo);
    setMeta('property', 'og:description', descricao);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', imagem);
    setCanonical(url);
  }, [title, description, image, noindex, pathname]);
}
