const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
  throw new Error('Missing Supabase env variables');
}

// Client untuk login user
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

module.exports = { supabase, supabaseAdmin };