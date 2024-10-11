import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);

export default stripe;

// You can add more Stripe-related functions here as needed
export async function createCheckoutSession(price: number, quantity: number = 1) {
  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Your Product Name',
          },
          unit_amount: price * 100, // Stripe expects amount in cents
        },
        quantity: quantity,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
  });
}