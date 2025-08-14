// /api/raffles/current.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { data: raffle, error } = await supabase
      .from('raffles')
      .select('*')
      .eq('active', true)
      .single();

    if (error || !raffle) {
      return res.status(404).json({ error: 'No hay rifa activa' });
    }

    const { data: tickets } = await supabase
      .from('tickets')
      .select('id')
      .eq('raffle_id', raffle.id);

    res.status(200).json({
      ...raffle,
      sold_tickets: tickets?.length || 0,
      total_tickets: raffle.total_tickets
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}