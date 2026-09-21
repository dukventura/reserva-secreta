import { Router } from 'express';
import { db } from '../lib/db';

export const citiesRouter = Router();

// Publico: front-end usa isto para preencher o autocomplete de cidade
// em vez de uma lista fixa embutida no bundle.
citiesRouter.get('/', async (_req, res) => {
  const cidades = await db
    .selectFrom('cities')
    .select(['slug', 'name'])
    .where('active', '=', 1)
    .orderBy('name', 'asc')
    .execute();
  res.json({ cidades });
});
