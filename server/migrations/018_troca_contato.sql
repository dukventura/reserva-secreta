-- Adiciona tipos para troca de e-mail e whatsapp pos-cadastro.
-- O enum existente era ('confirmacao','senha') - ampliamos com os novos.
ALTER TABLE email_codes
  MODIFY COLUMN tipo ENUM('confirmacao','senha','troca_email','troca_whatsapp') NOT NULL;
