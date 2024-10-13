'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { PlanTypeEnum } from '@/types/planHistory';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '../ui/button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PlanDetails = {
  type: PlanTypeEnum;
  price: string;
  displayPrice: number;
};

const plans: PlanDetails[] = [
    { type: PlanTypeEnum.BASIC, price: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!, displayPrice: 9.90 },
    { type: PlanTypeEnum.PREMIUM, price: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!, displayPrice: 29.90 },
  ];

export default function CheckoutButton({ planType }: { planType: PlanTypeEnum }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const handleCheckout = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setLoading(true);

    const plan = plans.find(p => p.type === planType);
    if (!plan) {
      console.error('Invalid plan type');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          priceId: plan.price,
          userId: user.uid,
          email: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    //eslint-disable-next-line
    } catch (error: any) {
      console.error('Error during checkout:', error.message);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant='ai' onClick={handleCheckout} disabled={loading} className='w-full'>
      {loading ? 'Processando...' : `Assinar plano ${planType}`}
    </Button>
  );
}