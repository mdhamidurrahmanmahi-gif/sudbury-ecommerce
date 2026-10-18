import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

const supabaseKey =
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URL or Publishable Key is missing."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);