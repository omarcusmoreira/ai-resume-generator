'use client'

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Calendar } from "lucide-react"
import { OpportunityType, InterviewStage } from "@/types/opportunities"
import { TimestampRenderer } from "@/utils/TimestampRender"
import logo_horizontal from '../../../public/assets/images/logo_horizontal.png'
import Image from "next/image"
import { useOpportunityStore } from "@/stores/opportunityStore"
import { Timestamp } from "firebase/firestore"

export default function Dashboard() {    
  const { opportunities } = useOpportunityStore();  

  const getNextInterview = (): { opportunity: OpportunityType, stage: InterviewStage } | null => {
    const now = Timestamp.now();
  
    const upcomingInterviews = opportunities.flatMap(opp => 
      (opp.interviewStages || [])
        .filter(stage => stage.expectedDate > now && stage.status === 'In Progress')
        .map(stage => ({ opportunity: opp, stage }))
    );
  
    return upcomingInterviews.sort((a, b) => 
      a.stage.expectedDate.seconds - b.stage.expectedDate.seconds
    )[0] || null;
  };

  const nextInterview = getNextInterview();
  
  const interviewCount = opportunities.reduce((count, opp) => 
    count + (opp.interviewStages?.filter(stage => stage.status === 'In Progress').length || 0), 
    0
  );

  return(
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Image src={logo_horizontal} alt="MeContrata.ai Logo" width={200} />
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
                    {interviewCount}
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
                    {nextInterview ? (
                      <TimestampRenderer 
                        fallback='Sem entrevistas' 
                        format='toISODate' 
                        timestamp={nextInterview.stage.expectedDate}
                      />
                    ) : 'Sem entrevistas'}
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