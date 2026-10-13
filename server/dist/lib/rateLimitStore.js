"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlRateLimitStore = void 0;
const kysely_1 = require("kysely");
const db_1 = require("./db");
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
class MysqlRateLimitStore {
    constructor(prefix) {
        this.windowMs = 60000;
        this.prefix = prefix;
    }
    init(options) {
        this.windowMs = options.windowMs;
    }
    key(key) {
        return `${this.prefix}:${key}`;
    }
    async increment(key) {
        const rlKey = this.key(key);
        const resetAt = new Date(Date.now() + this.windowMs);
        // Upsert atomico no proprio banco: se a janela anterior ja
        // expirou, reinicia a contagem em 1; senao, incrementa. Isso e' o
        // que evita a condicao de corrida entre processos concorrentes -
        // dois processos incrementando ao mesmo tempo nao se pisam porque
        // e' uma unica instrucao SQL, nao um ciclo ler-depois-escrever.
        await db_1.db
            .insertInto('rate_limits')
            .values({ rl_key: rlKey, count: 1, reset_at: resetAt })
            .onDuplicateKeyUpdate({
            count: (0, kysely_1.sql) `if(reset_at <= now(), 1, count + 1)`,
            reset_at: (0, kysely_1.sql) `if(reset_at <= now(), ${resetAt}, reset_at)`,
        })
            .execute();
        const row = await db_1.db
            .selectFrom('rate_limits')
            .select(['count', 'reset_at'])
            .where('rl_key', '=', rlKey)
            .executeTakeFirstOrThrow();
        // Limpeza oportunista de linhas velhas - poupa um cron dedicado so
        // pra isso, ao custo de 1% de chance de rodar um DELETE extra.
        if (Math.random() < 0.01) {
            db_1.db.deleteFrom('rate_limits')
                .where('reset_at', '<', new Date(Date.now() - 24 * 60 * 60 * 1000))
                .execute()
                .catch(() => { });
        }
        return { totalHits: row.count, resetTime: row.reset_at };
    }
    async decrement(key) {
        await db_1.db
            .updateTable('rate_limits')
            .set({ count: (0, kysely_1.sql) `greatest(count - 1, 0)` })
            .where('rl_key', '=', this.key(key))
            .execute();
    }
    async resetKey(key) {
        await db_1.db.deleteFrom('rate_limits').where('rl_key', '=', this.key(key)).execute();
    }
}
exports.MysqlRateLimitStore = MysqlRateLimitStore;
