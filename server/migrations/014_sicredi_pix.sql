-- PIX automatico pela API do Sicredi (banco da propria cliente) no
-- lugar do Mercado Pago. Guarda o txid da cobranca pra consultar se foi
-- paga.
ALTER TABLE plan_requests
  ADD COLUMN IF NOT EXISTS sicredi_txid VARCHAR(35) NULL AFTER mercadopago_payment_id,
  ADD INDEX IF NOT EXISTS idx_plan_requests_sicredi_txid (sicredi_txid);
