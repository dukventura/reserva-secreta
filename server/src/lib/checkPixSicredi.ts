import 'dotenv/config';
import { db } from './db';
import { sicrediConfigurado } from './sicredi';
import { verificarPedidoSicredi } from './pixAutomatico';

/* Cron permanente (a cada 5 min) no cPanel: confirma o PIX automatico
   de quem pagou e fechou a tela antes da confirmacao. Comando:
   node dist/lib/checkPixSicredi.js */

async function main() {
  if (!sicrediConfigurado()) {
    console.log('Sicredi nao configurado, nada a fazer.');
    return;
  }
  // Cobranca expira em 1h; olhar so' as ultimas 24h evita consultar
  // pedido abandonado pra sempre.
  const pendentes = await db
    .selectFrom('plan_requests')
    .select('id')
    .where('status', '=', 'pendente')
    .where('sicredi_txid', 'is not', null)
    .where('created_at', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))
    .execute();

  for (const { id } of pendentes) {
    try {
      const resultado = await verificarPedidoSicredi(id);
      if (resultado === 'pago') console.log(`Pedido ${id}: pago, plano ativado.`);
    } catch (err) {
      console.error(`Pedido ${id}: erro consultando Sicredi:`, err);
    }
  }
}

main()
  .catch((err) => { console.error(err); process.exitCode = 1; })
  .finally(() => db.destroy());
