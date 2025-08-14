// /api/tickets/confirm.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'https://esm.sh/bcrypt@5';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { ticket_id, admin_email, password } = req.body;

  // Autenticar admin
  const { data: admin } = await supabase
    .from('admins')
    .select('password_hash')
    .eq('email', admin_email)
    .single();

  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const { error } = await supabase
    .from('tickets')
    .update({ status: 'paid' })
    .eq('id', ticket_id)
    .eq('status', 'pending_payment');

  if (error) {
    return res.status(500).json({ error: 'Error al confirmar pago' });
  }

  res.status(200).json({ success: true });
}