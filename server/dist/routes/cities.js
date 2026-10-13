"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.citiesRouter = void 0;
const express_1 = require("express");
const db_1 = require("../lib/db");
exports.citiesRouter = (0, express_1.Router)();
// Publico: front-end usa isto para preencher o autocomplete de cidade
// em vez de uma lista fixa embutida no bundle.
exports.citiesRouter.get('/', async (_req, res) => {
    const cidades = await db_1.db
        .selectFrom('cities')
        .select(['slug', 'name'])
        .where('active', '=', 1)
        .orderBy('name', 'asc')
        .execute();
    res.json({ cidades });
});
