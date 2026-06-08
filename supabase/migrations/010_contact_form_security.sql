-- İletişim formu: uzunluk ve format kısıtları (SQL injection'a karşı parametreli sorgu + DB katmanı)
ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS contact_name_length;
ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS contact_email_length;
ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS contact_phone_length;
ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS contact_message_length;
ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS contact_email_format;

ALTER TABLE contact_submissions
  ADD CONSTRAINT contact_name_length CHECK (char_length(name) BETWEEN 2 AND 120);

ALTER TABLE contact_submissions
  ADD CONSTRAINT contact_email_length CHECK (char_length(email) BETWEEN 5 AND 254);

ALTER TABLE contact_submissions
  ADD CONSTRAINT contact_email_format CHECK (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  );

ALTER TABLE contact_submissions
  ADD CONSTRAINT contact_phone_length CHECK (phone IS NULL OR char_length(phone) <= 30);

ALTER TABLE contact_submissions
  ADD CONSTRAINT contact_message_length CHECK (char_length(message) BETWEEN 10 AND 5200);

-- INSERT politikası: yalnızca geçerli ve KVKK onaylı kayıtlar
DROP POLICY IF EXISTS "Anyone can submit contact" ON contact_submissions;

CREATE POLICY "Anyone can submit contact" ON contact_submissions
  FOR INSERT
  WITH CHECK (
    char_length(name) BETWEEN 2 AND 120
    AND char_length(email) BETWEEN 5 AND 254
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    AND (phone IS NULL OR char_length(phone) <= 30)
    AND char_length(message) BETWEEN 10 AND 5200
    AND kvkk_consent IS TRUE
  );
