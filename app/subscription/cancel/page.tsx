'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { usePlanHistoryStore } from '@/stores/planHistoryStore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 bg-purple-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-purple-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-purple-700">Assinatura efetuada com sucesso!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-gray-600">
          Muito obrigado! Você agora é <span className="font-semibold text-purple-600">{currentPlan}</span>.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={() => router.push('/')}
          className="bg-purple-500 hover:bg-purple-700 text-white"
        >
          Voltar ao Início
        </Button>
      </CardFooter>
    </Card>
  </div>
  );
}