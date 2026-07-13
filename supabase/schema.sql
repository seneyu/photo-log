-- TABLE profiles, extends auth.users, auto-created on signup via trigger
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE NOT NULL,
    avatar_url text,
    bio text,
    created_at timestamptz DEFAULT now()
);

-- TABLE photo pins
CREATE TABLE pins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    photo_urls text[] NOT NULL DEFAULT '{}',
    caption text,
    lat float8 NOT NULL,
    lng float8 NOT NULL,
    location_name text,
    visited_at date,
    created_at timestamptz DEFAULT now()
);

-- TABLE follow graph
CREATE TABLE follows (
    follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    following_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

-- TABLE comments
CREATE TABLE comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_id uuid NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- self-follow prevention constraint
ALTER TABLE follows ADD CONSTRAINT no_self_follow CHECK (follower_id != following_id);

-- auto-create profile on signup trigger
-- 1. a function that fires on a table event
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO profiles (id, username, avatar_url)
    VALUES (
        NEW.id, -- NEW = the row just inserted into auth.users
        COALESCE(NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1))
        || '_' || substring(NEW.id::text, 1, 4),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. wire the function to fire after every signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS policies (run after schema)

-- enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- profiles: anyone can read, only owner can update
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- pins: anyone can read, only owner can insert/delete
CREATE POLICY "pins_read_all" ON pins FOR SELECT USING (true);
CREATE POLICY "pins_insert_own" ON pins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pins_delete_own" ON pins FOR DELETE USING (auth.uid() = user_id);

-- follows: read all, manage own rows
CREATE POLICY "follows_read_all" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- comments: read all, insert if logged in, delete own
CREATE POLICY "comments_read_all" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON comments FOR DELETE USING (auth.uid() = user_id);