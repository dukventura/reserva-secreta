import 'dotenv/config';
import { createConnection } from 'mysql2/promise';

/* Roda uma vez por dia via cron permanente no cPanel (nao e' o cron
   temporario de deploy - esse fica pra sempre, igual o do backup).
   Sem gateway de pagamento automatizado ainda, o VIP e' liberado a mao
   pelo Admin Master (rota /moderation/subscriptions/:userId/pagamento)
   - esse script so' cuida de tirar o selo quando a data combinada
   passa, pra ninguem esquecer de revisar isso manualmente todo dia. */

async function main() {
  const conn = await createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    const [vencidas] = await conn.query(
      `SELECT user_id FROM subscriptions WHERE status = 'ativo' AND vence_em < CURDATE()`,
    );
    const userIds = (vencidas as { user_id: number }[]).map((r) => r.user_id);

    if (userIds.length === 0) {
      console.log('Nenhuma assinatura vencida hoje.');
      return;
    }

    await conn.query(
      `UPDATE subscriptions SET status = 'vencido' WHERE status = 'ativo' AND vence_em < CURDATE()`,
    );
    await conn.query(
      `UPDATE professional_profiles SET is_vip = 0 WHERE user_id IN (${userIds.map(() => '?').join(',')})`,
      userIds,
    );
    console.log(`${userIds.length} assinatura(s) vencida(s) hoje, VIP removido: [${userIds.join(', ')}]`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Falha ao checar assinaturas:', err);
  process.exit(1);
});
