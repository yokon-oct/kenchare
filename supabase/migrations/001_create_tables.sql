-- =============================================
-- 001_create_tables.sql
-- 都道府県当てアプリ テーブル作成 & RLS設定
-- =============================================

-- -----------------------------------------------
-- profiles（ユーザープロフィール）
-- auth.users と 1:1 で紐づく公開プロフィールテーブル
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ユーザー登録時に自動でprofilesレコードを作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------
-- prefectures（都道府県マスタ）
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.prefectures (
  id         SERIAL      PRIMARY KEY,
  name       TEXT        NOT NULL,
  region     TEXT        NOT NULL,
  svg_id     TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------
-- hints（ヒントデータ）
-- -----------------------------------------------
DO $$ BEGIN
  CREATE TYPE difficulty_type AS ENUM ('easy', 'normal', 'hard');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.hints (
  id             SERIAL          PRIMARY KEY,
  prefecture_id  INT             NOT NULL REFERENCES public.prefectures(id) ON DELETE CASCADE,
  difficulty     difficulty_type NOT NULL,
  content        TEXT            NOT NULL,
  created_at     TIMESTAMPTZ     DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hints_prefecture_difficulty ON public.hints(prefecture_id, difficulty);

-- -----------------------------------------------
-- scores（スコア記録）
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.scores (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty    difficulty_type NOT NULL,
  score         INT         NOT NULL CHECK (score >= 0),
  correct_count INT         NOT NULL CHECK (correct_count BETWEEN 0 AND 10),
  played_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scores_user_difficulty ON public.scores(user_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_scores_difficulty_score ON public.scores(difficulty, score DESC);

-- -----------------------------------------------
-- ベストスコアビュー（難易度別・ユーザー別の最高得点）
-- -----------------------------------------------
CREATE OR REPLACE VIEW public.best_scores AS
SELECT DISTINCT ON (user_id, difficulty)
  s.id,
  s.user_id,
  p.email,
  s.difficulty,
  s.score,
  s.correct_count,
  s.played_at
FROM public.scores s
JOIN public.profiles p ON s.user_id = p.id
ORDER BY user_id, difficulty, score DESC, played_at DESC;

-- -----------------------------------------------
-- RLS（Row Level Security）設定
-- -----------------------------------------------

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- prefectures（全員読み取り可）
ALTER TABLE public.prefectures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prefectures_select_all"
  ON public.prefectures FOR SELECT
  USING (true);

-- hints（全員読み取り可）
ALTER TABLE public.hints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hints_select_all"
  ON public.hints FOR SELECT
  USING (true);

-- scores
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scores_select_all"
  ON public.scores FOR SELECT
  USING (true);

CREATE POLICY "scores_insert_own"
  ON public.scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "scores_delete_own"
  ON public.scores FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------
-- ビューへのアクセス権付与（PostgREST / anon・authenticated ロール）
-- -----------------------------------------------
GRANT SELECT ON public.best_scores TO anon, authenticated;
