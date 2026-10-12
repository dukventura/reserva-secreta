import { Router } from 'express';
import { db } from '../lib/db';

export const sitemapRouter = Router();

// Endereco do front-end, que e' onde as paginas de perfil existem de fato.
// O Google aceita este sitemap em outro dominio porque o robots.txt do
// site aponta pra ele.
const SITE_URL = (process.env.SITE_URL ?? 'https://reservasecreta.com.br').replace(/\/$/, '');

function escaparXml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Mesmo portao do diretorio publico: so' perfil 'aprovado' entra.
sitemapRouter.get('/sitemap-perfis.xml', async (_req, res) => {
  const perfis = await db
    .selectFrom('professional_profiles')
    .select(['slug', 'updated_at'])
    .where('status', '=', 'aprovado')
    .orderBy('updated_at', 'desc')
    .execute();

  const urls = perfis.map((p) => {
    const lastmod = new Date(p.updated_at).toISOString().slice(0, 10);
    return `  <url><loc>${escaparXml(`${SITE_URL}/perfil/${p.slug}`)}</loc><lastmod>${lastmod}</lastmod></url>`;
  });

  res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
  );
});
