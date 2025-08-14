// scripts/create-admin.js
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

if (process.argv.length !== 4) {
  console.log('Uso: node create-admin.js <email> <password>');
  process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan variables de entorno: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const email = process.argv[2];
const password = process.argv[3];

async function createAdmin() {
  const hashed = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('admins')
    .insert([{ email, password_hash: hashed }]);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`✅ Admin creado: ${email}`);
  }
}

createAdmin();