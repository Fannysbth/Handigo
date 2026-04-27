const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY // penting: pakai service role
);

