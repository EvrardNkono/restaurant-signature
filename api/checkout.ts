// api/checkout.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover' as any,
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { cartItems } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cartItems.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100), // Prix en centimes
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/panier`,
    });

    // On renvoie juste l'ID
    res.status(200).json({ id: session.id });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}