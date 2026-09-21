import rateLimit from 'express-rate-limit';

/* Sem isso, um unico IP mal-intencionado pode tentar milhares de
   senhas por minuto (login) ou inundar o banco de contas falsas
   (registro). As janelas sao por IP - exige `trust proxy` habilitado
   no app (ver index.ts), senao todo mundo aparece atras do IP do
   proprio Apache/Passenger e o limite vira global por engano. */

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.' },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitos cadastros a partir deste endereço. Aguarde uma hora e tente novamente.' },
});

export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas denúncias enviadas. Aguarde uma hora e tente novamente.' },
});
