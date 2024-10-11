import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default stripe;

export const createStripeCustomer = async (name: string, email: string) => {
    const customer = await stripe.customers.create({
      name,
      email,
    })
    return customer.id
  }