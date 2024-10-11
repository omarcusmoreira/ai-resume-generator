'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { usePlanHistoryStore } from '@/stores/planHistoryStore';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchCurrentPlan, currentPlan } = usePlanHistoryStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateUserData = async () => {
      if (user) {
        await fetchCurrentPlan();
        setIsLoading(false);
      }
    };

    updateUserData();
  }, [user, fetchCurrentPlan]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Assinatura efetuada com sucesso!</h1>
      <p className="mb-4">Muito Obrigado! Voce agora é {currentPlan}.</p>
      <button
        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => router.push('/')}
      >
        Go to Dashboard
      </button>
    </div>
  );
}