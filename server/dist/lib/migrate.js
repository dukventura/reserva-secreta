"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const promise_1 = require("mysql2/promise");
/* Runner simples, sem versionamento up/down: o schema ainda e' um
   arquivo unico (001_schema_inicial.sql) com CREATE TABLE IF NOT
   EXISTS, entao rodar de novo e' seguro. Quando o schema evoluir com
   ALTER TABLE em producao, isto vira um candidato a trocar por uma
   ferramenta de migracao de verdade (ex: node-pg-migrate/Kysely
   migrator) - nao antes, para nao pagar complexidade que a Fase 0 nao
   usa. */
async function main() {
    const dir = (0, node_path_1.join)(__dirname, '..', '..', 'migrations');
    const arquivos = (0, node_fs_1.readdirSync)(dir).filter((f) => f.endsWith('.sql')).sort();
    const conn = await (0, promise_1.createConnection)({
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
            const sql = (0, node_fs_1.readFileSync)((0, node_path_1.join)(dir, arquivo), 'utf-8');
            await conn.query(sql);
        }
        console.log(`${arquivos.length} arquivo(s) de migração aplicados.`);
    }
    finally {
        await conn.end();
    }
}
main().catch((err) => {
    console.error('Falha ao migrar:', err);
    process.exit(1);
});
