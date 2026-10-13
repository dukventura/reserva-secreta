"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const kysely_1 = require("kysely");
const mysql2_1 = require("mysql2");
const pool = (0, mysql2_1.createPool)({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // Hospedagem compartilhada costuma ter teto baixo de conexoes
    // simultaneas por banco - manter o pool pequeno evita estourar isso
    // sob carga e derrubar outros processos da mesma conta.
    connectionLimit: 5,
    charset: 'utf8mb4_general_ci',
});
exports.db = new kysely_1.Kysely({
    dialect: new kysely_1.MysqlDialect({ pool }),
});
