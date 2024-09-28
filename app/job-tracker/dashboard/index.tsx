'use client'

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Calendar } from "lucide-react"
import { OpportunityStatusEnum, OpportunityType } from "@/types/opportunities"
import { TimestampRenderer } from "@/utils/TimestampRender"
import { ensureDate } from "@/utils/ensureDate"
import logo_horizontal from '../../../public/assets/images/logo_horizontal.png'
import Image from "next/image"


type DashboardProps = {
    opportunities: OpportunityType[];
}
export default function Dashboard({opportunities}: DashboardProps) {      

const getNextInterview = () => {
  const today = new Date(); // Get current date

  const interviews = opportunities
    .filter(opp => {
      const interviewDate = ensureDate(opp.nextInterviewDate);
      return interviewDate && interviewDate >= today; // Filter out past dates
    })
    .sort((a, b) => {
      const aDate = ensureDate(a.nextInterviewDate);
      const bDate = ensureDate(b.nextInterviewDate);

      if (!aDate || !bDate) return 0;
      
      return aDate.getTime() - bDate.getTime();
    });

  console.log('INTERVIEW ', interviews[0]);
  return interviews[0];
};

const nextInterview = getNextInterview()
  
return(
    <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
            <Image src={logo_horizontal} alt="MeContrata.ai Logo" width={200}  />
            {/* <h1 className="text-3xl font-bold text-purple-800">
                Olá, <span className="text-purple-600">{userData?.personalInfo.name || 'Usuário'}</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">Vamos gerenciar suas oportunidades de emprego?</p> */}
            </div>
            <div className="flex space-x-4">
            <Card className="bg-white shadow-sm hidden md:block">
                <CardContent className="p-4 flex items-center space-x-4">
                <Briefcase className="h-8 w-8 text-purple-600" />
                <div>
                    <CardDescription className="text-xs text-purple-800">Processos</CardDescription>
                    <CardTitle className="text-md font-bold text-purple-600">{opportunities.length}</CardTitle>
                </div>
                </CardContent>
            </Card>
            <Card className="bg-white shadow-sm hidden md:block">
                <CardContent className="p-4 flex items-center space-x-4">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                    <CardDescription className="text-xs text-purple-800">Entrevistas</CardDescription>
                    <CardTitle className="text-md font-bold text-purple-600">
                    {opportunities.filter(opp => opp.status === OpportunityStatusEnum.INTERVIEW).length}
                    </CardTitle>
                </div>
                </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
                <CardContent className="p-4 flex items-center space-x-4">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                    <CardDescription className="text-xs text-purple-800">Próxima Entrevista</CardDescription>
                    <CardTitle className="text-md font-bold text-purple-600">
                      <TimestampRenderer 
                        fallback='Sem entrevistas' 
                        format='toISODate' 
                        timestamp={nextInterview?.nextInterviewDate ?? 0}
                      />
                    </CardTitle>
                </div>
                </CardContent>
            </Card>
            </div>
        </div>
        </div>
    </header>
    )
}