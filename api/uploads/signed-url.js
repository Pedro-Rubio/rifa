// /api/uploads/signed-url.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const fileName = `receipts/${Date.now()}.png`; // Simplificado

  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUploadUrl(fileName);

  if (error) {
    return res.status(500).json({ error: 'Error al generar URL' });
  }

  res.status(200).json({ url: data.signedUrl, fileName });
}