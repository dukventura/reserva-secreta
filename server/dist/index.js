"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./routes/auth");
const profiles_1 = require("./routes/profiles");
const moderation_1 = require("./routes/moderation");
const reports_1 = require("./routes/reports");
const cities_1 = require("./routes/cities");
const finance_1 = require("./routes/finance");
const client_1 = require("./routes/client");
const sitemap_1 = require("./routes/sitemap");
const uploads_1 = require("./lib/uploads");
const app = (0, express_1.default)();
// Necessario pro rate limiting (e qualquer coisa baseada em IP) ver o
// IP real do visitante em vez do IP interno do Apache/Passenger, que
// fica na frente do processo Node no cPanel.
app.set('trust proxy', 1);
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express_1.default.json({ limit: '1mb' }));
// O cPanel serve public/ direto pelo Apache/LiteSpeed via Passenger,
// mas isso garante que /uploads funciona em qualquer ambiente (dev
// local, outra hospedagem) sem depender desse detalhe especifico.
app.use('/uploads', express_1.default.static(uploads_1.UPLOAD_DIR));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use(sitemap_1.sitemapRouter);
app.use('/api/auth', auth_1.authRouter);
app.use('/api/profiles', profiles_1.profilesRouter);
app.use('/api/moderation', moderation_1.moderationRouter);
app.use('/api/reports', reports_1.reportsRouter);
app.use('/api/cities', cities_1.citiesRouter);
app.use('/api/plans', finance_1.plansPublicRouter);
app.use('/api/finance', finance_1.cadastrosRouter);
app.use('/api/finance', finance_1.financeRouter);
app.use('/api/client', client_1.clientRouter);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno.' });
});
// O Passenger do cPanel injeta PORT no ambiente - nunca fixar a porta
// aqui, ou a aplicacao nao sobe sob o gerenciador deles.
const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
    console.log(`API do Reserva Secreta rodando na porta ${port}`);
});
