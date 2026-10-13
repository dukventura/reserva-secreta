"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarAuditoria = registrarAuditoria;
const db_1 = require("./db");
async function registrarAuditoria(actorUserId, action, target) {
    await db_1.db.insertInto('audit_log').values({ actor_user_id: actorUserId, action, target }).execute();
}
