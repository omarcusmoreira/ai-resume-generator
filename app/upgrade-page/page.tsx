'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import CheckoutButton from "@/components/CheckoutButton";

enum PlanTypeEnum {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium'
}

type QuotasType = {
  interactions: number | null;
  profiles: number | null;
  resumes: number | null;
  opportunities: number | null;
  recruiters: number | null;
};

const PlanQuotas: { [key in PlanTypeEnum]: QuotasType } = {
  [PlanTypeEnum.FREE]: {
    profiles: 1,
    resumes: 2,
    interactions: 10,
    opportunities: 10,
    recruiters: 10,
  },
  [PlanTypeEnum.BASIC]: {
    profiles: 3,
    resumes: 6,
    interactions: 30,
    opportunities: 30,
    recruiters: 30,
  },
  [PlanTypeEnum.PREMIUM]: {
    profiles: 10,
    resumes: 20,
    interactions: 60,
    opportunities: 200,
    recruiters: 200,
  },
};

const planInfo = [
    {
      type: PlanTypeEnum.FREE,
      name: "Gratuito",
      price: 0,
      description: "Ideal para testar a plataforma. Gere até 1 currículo por mês e gerencie 1 perfil de vaga com até 10 processos seletivos simultâneos.",
    },
    {
      type: PlanTypeEnum.BASIC,
      name: "Básico",
      price: 9.90,
      description: "Perfeito para candidatos ativos. Gere até 6 currículos com IA e tenha 3 perfis de vagas, gerenciando até 30 processos seletivos ao mesmo tempo.",
    },
    {
      type: PlanTypeEnum.PREMIUM,
      name: "Premium",
      price: 29.90,
      description: "Para quem quer se destacar. Gere até 20 currículos com IA, gerencie 10 perfis de vagas e até 200 processos seletivos simultâneos.",
    },
  ];


const featureTranslations: { [key: string]: string } = {
  profiles: "Perfis",
  resumes: "Currículos",
  interactions: "Interações IA*",
  opportunities: "Oportunidades",
  recruiters: "Recrutadores",
};

export default function PricingPage() {

  return (
    <div className="min-h-screen bg-purple-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-purple-900">Escolha o plano ideal para você!</h1>
          <p className="text-lg text-purple-700">
            Selecione entre nossos melhores planos, garantindo uma combinação perfeita.<br />
            Realize sua assinatura para impulsionar sua carreira agora!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {planInfo.map((plan) => (
            <Card key={plan.type} className={`
            ${plan.type === PlanTypeEnum.PREMIUM ? 
            'bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200' : 
            'bg-white'}`
            }>
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  <span className={`px-3 py-1 rounded-full 
                    ${plan.type === PlanTypeEnum.PREMIUM ? 
                    'bg-purple-700 text-white' : 
                    'bg-purple-200 text-purple-700'
                    }`}>
                    {plan.name}
                  </span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="
              space-y-4">
                <ul className="space-y-2">
                  {Object.entries(PlanQuotas[plan.type]).map(([feature, value]) => (
                    <li key={feature} className="flex items-center justify-between">
                      <span className="text-sm">{featureTranslations[feature]}</span>
                      <span className="text-sm font-semibold">{value}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.type === PlanTypeEnum.FREE ? 
                <Button className="w-full" variant='default'>
                  {plan.type === PlanTypeEnum.FREE ? 'Começar grátis' : 'Assinar agora'}
                </Button>
                :
                <CheckoutButton planType={plan.type === PlanTypeEnum.BASIC ? PlanTypeEnum.BASIC : PlanTypeEnum.PREMIUM} />
                }
              </CardFooter>
            </Card>
          ))}
        </div>
        <p className="text-gray-500 text-[0.7rem]">*Interações com IA: Geração de biografia para LinkedIn, geração de cartas de apresentação para vagas e dicas de palavras-chave.</p>
        </div>
    </div>
  )
}