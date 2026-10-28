"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.citiesRouter = void 0;
const express_1 = require("express");
const kysely_1 = require("kysely");
const db_1 = require("../lib/db");
exports.citiesRouter = (0, express_1.Router)();
// Publico: front-end usa isto para preencher o autocomplete de cidade
// em vez de uma lista fixa embutida no bundle.
exports.citiesRouter.get('/', async (_req, res) => {
    const cidades = await db_1.db
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
exports.citiesRouter.get('/com-perfis', async (_req, res) => {
    const cidades = await db_1.db
        .selectFrom('professional_profiles')
        .innerJoin('cities', (j) => j
        .onRef('cities.name', '=', 'professional_profiles.city')
        .onRef('cities.uf', '=', 'professional_profiles.uf'))
        .select(['cities.slug', 'cities.name', 'cities.uf', (0, kysely_1.sql) `COUNT(*)`.as('total')])
        .where('professional_profiles.status', '=', 'aprovado')
        .groupBy(['cities.slug', 'cities.name', 'cities.uf'])
        .orderBy('total', 'desc')
        .orderBy('cities.name', 'asc')
        .execute();
    res.json({ cidades: cidades.map((c) => ({ ...c, total: Number(c.total) })) });
});
exports.citiesRouter.get('/:slug', async (req, res) => {
    const cidade = await db_1.db
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
