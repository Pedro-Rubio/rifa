// /api/tickets/hold.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, phone, quantity, paymentMethod } = req.body;

  if (!name || !email || !phone || !paymentMethod || quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const { data: raffle, error: raffleErr } = await supabase
    .from('raffles')
    .select('id, price, total_tickets')
    .eq('active', true)
    .single();

  if (raffleErr || !raffle) {
    return res.status(404).json({ error: 'Rifa no disponible' });
  }

  const { data: soldTickets } = await supabase
    .from('tickets')
    .select('id')
    .eq('raffle_id', raffle.id);

  const sold = soldTickets?.length || 0;
  if (sold + quantity > raffle.total_tickets) {
    return res.status(400).json({ error: 'No hay suficientes tickets disponibles' });
  }

  const availableNumbers = Array.from({ length: raffle.total_tickets }, (_, i) => i + 1)
    .filter(num => !soldTickets?.some(t => t.id === num));

  const selectedNumbers = availableNumbers.slice(0, quantity);
  const ticketsToInsert = selectedNumbers.map(num => ({
    raffle_id: raffle.id,
    number: num,
    buyer: name,
    email,
    phone,
    payment_method: paymentMethod,
    status: 'pending_payment'
  }));

  const { error: insertErr } = await supabase
    .from('tickets')
    .insert(ticketsToInsert);

  if (insertErr) {
    return res.status(500).json({ error: 'Error al crear tickets' });
  }

  res.status(200).json({ tickets: ticketsToInsert });
}