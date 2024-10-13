import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useUserDataStore } from '@/stores/userDataStore';

const CancelSubscriptionButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userData } = useUserDataStore();
  const router = useRouter();

  const userId = userData?.userId || '';
  const stripeCustomerId = userData?.stripeCustomerId || '';

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, stripeCustomerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      setIsDialogOpen(false);
      router.push('/subscription/cancel');

    //eslint-disable-next-line
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar o plano, entre em contato para resolver.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          {isLoading ? 'Cancelando...' : 'Cancelar plano'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='bg-white'>
        <AlertDialogHeader>
          <AlertDialogTitle>{error ? 'Erro!': 'Tem certeza?'}</AlertDialogTitle>
          <AlertDialogDescription>
          {error ? 
          <p className="text-red-500 mt-2">{error}</p> :
          <p>Ao cancelar seu plano agora suas cotas restantes serão substituídas por novas cotas do plano gratuito.</p>
          }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancelSubscription} disabled={isLoading} className='bg-red-700 text-white'>
            {isLoading ? 'Cancelando...' : 'Cancelar plano'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelSubscriptionButton;