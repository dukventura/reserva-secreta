import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { UserRole } from './db';

const tokenPayloadSchema = z.object({
  sub: z.number(),
  role: z.enum(['master', 'gerente', 'profissional', 'contratante']),
  name: z.string(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    // Falha alto e cedo: um segredo fraco ou ausente compromete toda
    // sessao emitida por este processo, silenciosamente.
    throw new Error('JWT_SECRET ausente ou fraco - defina uma string longa e aleatoria no ambiente.');
  }
  return secret;
}

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export async function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export function emitirToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: '7d' });
}

export function verificarToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, jwtSecret());
  // A assinatura ja garante integridade, mas validar o formato aqui
  // evita que um payload de outro contexto (ou de uma versao antiga do
  // token, apos o schema mudar) passe adiante com campos faltando.
  return tokenPayloadSchema.parse(decoded);
}
