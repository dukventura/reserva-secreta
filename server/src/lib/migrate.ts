import 'dotenv/config';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createConnection } from 'mysql2/promise';

/* Runner simples, sem versionamento up/down: o schema ainda e' um
   arquivo unico (001_schema_inicial.sql) com CREATE TABLE IF NOT
   EXISTS, entao rodar de novo e' seguro. Quando o schema evoluir com
   ALTER TABLE em producao, isto vira um candidato a trocar por uma
   ferramenta de migracao de verdade (ex: node-pg-migrate/Kysely
   migrator) - nao antes, para nao pagar complexidade que a Fase 0 nao
   usa. */

async function main() {
  const dir = join(__dirname, '..', '..', 'migrations');
  const arquivos = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  const conn = await createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  try {
    for (const arquivo of arquivos) {
      console.log(`Aplicando ${arquivo}...`);
      const sql = readFileSync(join(dir, arquivo), 'utf-8');
      await conn.query(sql);
    }
    console.log(`${arquivos.length} arquivo(s) de migração aplicados.`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Falha ao migrar:', err);
  process.exit(1);
});
