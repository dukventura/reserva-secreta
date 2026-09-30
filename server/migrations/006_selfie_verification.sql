-- Selfie de verificacao (rosto segurando papel com data escrita a mao),
-- pratica padrao de plataformas adultas pra confirmar que quem se
-- cadastrou e' quem aparece nas fotos e no documento.
ALTER TABLE verifications
  ADD COLUMN IF NOT EXISTS selfie_status ENUM('pendente','aprovado','reprovado') NOT NULL DEFAULT 'pendente' AFTER documento_url,
  ADD COLUMN IF NOT EXISTS selfie_url VARCHAR(500) NULL AFTER selfie_status;
