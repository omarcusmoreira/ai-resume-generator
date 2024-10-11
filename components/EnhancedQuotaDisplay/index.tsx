'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { PlanQuotas, PlanTypeEnum, QuotasType } from '@/types/planHistory'
import { useQuotaStore } from '@/stores/quotaStore'
import { usePlanHistoryStore } from '@/stores/planHistoryStore'

export default function EnhancedQuotaDisplay() {
  const { quotas } = useQuotaStore()
  const { currentPlan } = usePlanHistoryStore()

  const quotaItems = [
    { label: 'Interações', key: 'interactions' },
    { label: 'Perfis', key: 'profiles' },
    { label: 'Currículos', key: 'resumes' },
    { label: 'Processos Seletivos', key: 'opportunities' },
    { label: 'Contatos', key: 'recruiters' },
  ]

  const getPlanColor = (plan: PlanTypeEnum) => {
    switch (plan) {
      case PlanTypeEnum.FREE:
        return 'bg-gray-500'
      case PlanTypeEnum.BASIC:
        return 'bg-blue-500'
      case PlanTypeEnum.PREMIUM:
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="flex-1 p-0 pt-4 md:p-8 overflow-auto flex items-center justify-center w-full mb-20">
      <Card className="w-full max-w-3xl p-2 md:p-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-2xl text-heading">Seus Limites</CardTitle>
          <Badge className={`${getPlanColor(currentPlan)} text-white`}>
            {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotaItems.map((item) => {
              const contracted = PlanQuotas[currentPlan][item.key as keyof QuotasType]
              const left = quotas[item.key as keyof QuotasType]
              const used = contracted! - left!
              const percentage = (used / contracted!) * 100

              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span>
                      {used} / {contracted}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant='ai' className="rounded-full">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Renovar Plano
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}