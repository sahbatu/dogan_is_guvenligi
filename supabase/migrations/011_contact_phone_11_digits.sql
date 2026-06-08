-- Telefon: yalnızca rakam, 10-11 hane (Türkiye formatı)
ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS contact_phone_length;
ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS contact_phone_format;

ALTER TABLE contact_submissions
  ADD CONSTRAINT contact_phone_length CHECK (phone IS NULL OR char_length(phone) <= 11);

ALTER TABLE contact_submissions
  ADD CONSTRAINT contact_phone_format CHECK (
    phone IS NULL OR phone ~ '^\d{10,11}$'
  );

DROP POLICY IF EXISTS "Anyone can submit contact" ON contact_submissions;

CREATE POLICY "Anyone can submit contact" ON contact_submissions
  FOR INSERT
  WITH CHECK (
    char_length(name) BETWEEN 2 AND 120
    AND char_length(email) BETWEEN 5 AND 254
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    AND (phone IS NULL OR (char_length(phone) BETWEEN 10 AND 11 AND phone ~ '^\d{10,11}$'))
    AND char_length(message) BETWEEN 10 AND 5200
    AND kvkk_consent IS TRUE
  );
