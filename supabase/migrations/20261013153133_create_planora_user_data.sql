/*
# Create private Planora user data storage

1. New Tables
- `planora_user_data`
- `user_id` (uuid, primary key): Links one private data record to one Supabase Auth user.
- `data` (jsonb, not null): Stores that user's existing Planora planner data.
- `updated_at` (timestamptz): Tracks the most recent saved planner state.

2. Security
- Row-level security is enabled.
- Authenticated users can select, insert, update, and delete only their own record.
- Anonymous users have no access.

3. Important Notes
- Guest data remains in browser storage and is not removed by this change.
- The app writes data only after a real authenticated Supabase session exists.
*/

CREATE TABLE IF NOT EXISTS public.planora_user_data (
  user_id uuid PRIMARY KEY NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.planora_user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own Planora data" ON public.planora_user_data;
CREATE POLICY "Users can read own Planora data"
ON public.planora_user_data FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own Planora data" ON public.planora_user_data;
CREATE POLICY "Users can create own Planora data"
ON public.planora_user_data FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own Planora data" ON public.planora_user_data;
CREATE POLICY "Users can update own Planora data"
ON public.planora_user_data FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own Planora data" ON public.planora_user_data;
CREATE POLICY "Users can delete own Planora data"
ON public.planora_user_data FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
