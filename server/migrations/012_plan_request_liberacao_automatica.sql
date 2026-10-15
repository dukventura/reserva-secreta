-- Liberacao automatica do plano assim que a profissional envia o
-- comprovante do PIX (sem API de banco, nao da' pra saber sozinho que
-- o dinheiro caiu). A equipe confere o extrato depois: "atender" so'
-- confirma, "recusar" desfaz usando o retrato da assinatura anterior.
ALTER TABLE plan_requests
  ADD COLUMN IF NOT EXISTS liberado_em DATETIME NULL AFTER comprovante_url,
  ADD COLUMN IF NOT EXISTS liberacao_payment_id INT UNSIGNED NULL AFTER liberado_em,
  ADD COLUMN IF NOT EXISTS assinatura_anterior TEXT NULL AFTER liberacao_payment_id;
