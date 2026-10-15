-- Pagamento automatico via Mercado Pago (PIX) como alternativa ao PIX
-- manual - guarda o id do pagamento na API deles pra casar com o
-- webhook de confirmacao.
ALTER TABLE plan_requests
  ADD COLUMN IF NOT EXISTS mercadopago_payment_id VARCHAR(50) NULL AFTER comprovante_url,
  ADD INDEX IF NOT EXISTS idx_plan_requests_mp_payment (mercadopago_payment_id);
