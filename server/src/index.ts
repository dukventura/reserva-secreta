import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { profilesRouter } from './routes/profiles';
import { moderationRouter } from './routes/moderation';
import { reportsRouter } from './routes/reports';
import { citiesRouter } from './routes/cities';
import { UPLOAD_DIR } from './lib/uploads';

const app = express();

// Necessario pro rate limiting (e qualquer coisa baseada em IP) ver o
// IP real do visitante em vez do IP interno do Apache/Passenger, que
// fica na frente do processo Node no cPanel.
app.set('trust proxy', 1);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express.json({ limit: '1mb' }));

// O cPanel serve public/ direto pelo Apache/LiteSpeed via Passenger,
// mas isso garante que /uploads funciona em qualquer ambiente (dev
// local, outra hospedagem) sem depender desse detalhe especifico.
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/moderation', moderationRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/cities', citiesRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno.' });
});

// O Passenger do cPanel injeta PORT no ambiente - nunca fixar a porta
// aqui, ou a aplicacao nao sobe sob o gerenciador deles.
const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`API do Reserva Secreta rodando na porta ${port}`);
});
