import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useUserDataStore } from '@/stores/userDataStore';

const CancelSubscriptionButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userData } = useUserDataStore();

  let userId = ''
  let stripeCustomerId = ''

  if (userData){
      userId = userData.userId
    }
  if (userData?.stripeCustomerId){
        stripeCustomerId = userData.stripeCustomerId || ''
  } else {
    throw new Error('No stripeCustomerId associated to this user.')
  }    

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

      // Handle successful cancellation (e.g., show a success message, update UI)
      alert('Subscription cancelled successfully');

      //eslint-disable-next-line
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={isLoading}>
            {isLoading ? 'Cancelando...' : 'Cancelar plano'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className='bg-white'>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao cancelar seu plano agora suas cotas restantes serão substituídas por novas cotas do plano gratuito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription} className='bg-red-700 text-white'>Cancelar plano</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </>
  );
};

export default CancelSubscriptionButton;