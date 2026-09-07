import type { Request, Response, NextFunction } from 'express';
import { verificarToken, type TokenPayload } from '../lib/auth';
import type { UserRole } from '../lib/db';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function autenticar(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ erro: 'Não autenticado.' });
    return;
  }
  try {
    req.user = verificarToken(token);
    next();
  } catch {
    res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
  }
}

export function exigirPapel(...papeis: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ erro: 'Não autenticado.' });
      return;
    }
    if (!papeis.includes(req.user.role)) {
      res.status(403).json({ erro: `Este recurso exige o papel: ${papeis.join(' ou ')}.` });
      return;
    }
    next();
  };
}
