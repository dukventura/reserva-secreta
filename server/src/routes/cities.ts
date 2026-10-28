import { Router } from 'express';
import { sql } from 'kysely';
import { db } from '../lib/db';

export const citiesRouter = Router();

// Publico: front-end usa isto para preencher o autocomplete de cidade
// em vez de uma lista fixa embutida no bundle.
citiesRouter.get('/', async (_req, res) => {
  const cidades = await db
    .selectFrom('cities')
    .select(['slug', 'name', 'uf'])
    .where('active', '=', 1)
    .orderBy('name', 'asc')
    .orderBy('uf', 'asc')
    .execute();
  res.json({ cidades });
});

// Cidades que tem pelo menos um anuncio no ar - e' o que a busca da
// home oferece (listar os 5.570 municipios ali so' daria busca vazia).
citiesRouter.get('/com-perfis', async (_req, res) => {
  const cidades = await db
    .selectFrom('professional_profiles')
    .innerJoin('cities', (j) => j
      .onRef('cities.name', '=', 'professional_profiles.city')
      .onRef('cities.uf', '=', 'professional_profiles.uf'))
    .select(['cities.slug', 'cities.name', 'cities.uf', sql<number>`COUNT(*)`.as('total')])
    .where('professional_profiles.status', '=', 'aprovado')
    .groupBy(['cities.slug', 'cities.name', 'cities.uf'])
    .orderBy('total', 'desc')
    .orderBy('cities.name', 'asc')
    .execute();
  res.json({ cidades: cidades.map((c) => ({ ...c, total: Number(c.total) })) });
});

citiesRouter.get('/:slug', async (req, res) => {
  const cidade = await db
    .selectFrom('cities')
    .select(['slug', 'name', 'uf'])
    .where('slug', '=', req.params.slug)
    .where('active', '=', 1)
    .executeTakeFirst();
  if (!cidade) {
    res.status(404).json({ erro: 'Cidade não encontrada.' });
    return;
  }
  res.json({ cidade });
});
