-- Profiles (auto-created on signup via trigger)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Studies
CREATE TABLE IF NOT EXISTS studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','done','error')),
  pdf_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own studies"
  ON studies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own studies"
  ON studies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own studies"
  ON studies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own studies"
  ON studies FOR DELETE
  USING (auth.uid() = user_id);

-- Extractions
CREATE TABLE IF NOT EXISTS extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_value TEXT,
  confidence REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'extracted' CHECK (status IN ('extracted','verified','flagged')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own extractions"
  ON extractions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM studies
      WHERE studies.id = extractions.study_id
      AND studies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own extractions"
  ON extractions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM studies
      WHERE studies.id = extractions.study_id
      AND studies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own extractions"
  ON extractions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM studies
      WHERE studies.id = extractions.study_id
      AND studies.user_id = auth.uid()
    )
  );

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can view own PDFs"
  ON storage.objects FOR SELECT
  USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own PDFs"
  ON storage.objects FOR DELETE
  USING (auth.uid()::text = (storage.foldername(name))[1]);
