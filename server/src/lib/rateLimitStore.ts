import { sql } from 'kysely';
import type { Store, Options, ClientRateLimitInfo } from 'express-rate-limit';
import { db } from './db';

/* Store em MySQL em vez do MemoryStore padrao do express-rate-limit.
   O Passenger desta hospedagem roda mais de um processo Node por tras
   do mesmo app (confirmado em producao: o contador "pulava" de forma
   nao sequencial entre requisicoes) - cada processo teria sua propria
   contagem isolada na memoria, e o limite nunca fecharia de verdade.
   Uma tabela compartilhada funciona independente de quantos processos
   o hosting decidir rodar. */
// Sem "private" de proposito: TypeScript trata campo privado como
// marca nominal, o que quebra a checagem estrutural contra a
// interface Store do express-rate-limit (que nao declara esses campos).
export class MysqlRateLimitStore implements Store {
  prefix: string;
  windowMs = 60_000;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  private key(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    const rlKey = this.key(key);
    const resetAt = new Date(Date.now() + this.windowMs);

    // Upsert atomico no proprio banco: se a janela anterior ja
    // expirou, reinicia a contagem em 1; senao, incrementa. Isso e' o
    // que evita a condicao de corrida entre processos concorrentes -
    // dois processos incrementando ao mesmo tempo nao se pisam porque
    // e' uma unica instrucao SQL, nao um ciclo ler-depois-escrever.
    await db
      .insertInto('rate_limits')
      .values({ rl_key: rlKey, count: 1, reset_at: resetAt })
      .onDuplicateKeyUpdate({
        count: sql`if(reset_at <= now(), 1, count + 1)`,
        reset_at: sql`if(reset_at <= now(), ${resetAt}, reset_at)`,
      })
      .execute();

    const row = await db
      .selectFrom('rate_limits')
      .select(['count', 'reset_at'])
      .where('rl_key', '=', rlKey)
      .executeTakeFirstOrThrow();

    // Limpeza oportunista de linhas velhas - poupa um cron dedicado so
    // pra isso, ao custo de 1% de chance de rodar um DELETE extra.
    if (Math.random() < 0.01) {
      db.deleteFrom('rate_limits')
        .where('reset_at', '<', new Date(Date.now() - 24 * 60 * 60 * 1000))
        .execute()
        .catch(() => {});
    }

    return { totalHits: row.count, resetTime: row.reset_at };
  }

  async decrement(key: string): Promise<void> {
    await db
      .updateTable('rate_limits')
      .set({ count: sql`greatest(count - 1, 0)` })
      .where('rl_key', '=', this.key(key))
      .execute();
  }

  async resetKey(key: string): Promise<void> {
    await db.deleteFrom('rate_limits').where('rl_key', '=', this.key(key)).execute();
  }
}
