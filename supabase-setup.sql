-- ============================================================
-- KipPost — Supabase Setup
-- Ejecuta este archivo completo en el SQL Editor de Supabase
-- ============================================================

-- 1. Tabla de perfiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  name        TEXT,
  bio         TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de posts
CREATE TABLE IF NOT EXISTS public.posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT DEFAULT '',
  excerpt     TEXT DEFAULT '',
  tags        TEXT[] DEFAULT '{}',
  published   BOOLEAN DEFAULT FALSE,
  slug        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS posts_user_id_idx     ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS posts_published_idx   ON public.posts(published);
CREATE INDEX IF NOT EXISTS posts_created_at_idx  ON public.posts(created_at DESC);

-- 4. Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts    ENABLE ROW LEVEL SECURITY;

-- 5. Políticas: profiles
DROP POLICY IF EXISTS "Profiles viewable by everyone"    ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile"         ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile"         ON public.profiles;

CREATE POLICY "Profiles viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6. Políticas: posts
DROP POLICY IF EXISTS "Published posts viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users view own posts"                 ON public.posts;
DROP POLICY IF EXISTS "Users insert own posts"               ON public.posts;
DROP POLICY IF EXISTS "Users update own posts"               ON public.posts;
DROP POLICY IF EXISTS "Users delete own posts"               ON public.posts;

CREATE POLICY "Published posts viewable by everyone"
  ON public.posts FOR SELECT USING (published = true OR auth.uid() = user_id);

CREATE POLICY "Users insert own posts"
  ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own posts"
  ON public.posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own posts"
  ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- 7. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 8. Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9_-]', '', 'g'))
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ¡Listo! Las tablas y políticas están configuradas.
-- ============================================================
