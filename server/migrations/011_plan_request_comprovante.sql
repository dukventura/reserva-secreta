-- Comprovante de PIX anexado pela propria profissional ao pedido de
-- plano - sinaliza pra equipe que ja pagou, sem depender de WhatsApp
-- nem de ficar checando o extrato as cegas.
ALTER TABLE plan_requests
  ADD COLUMN IF NOT EXISTS comprovante_url VARCHAR(255) NULL AFTER plan_id;
