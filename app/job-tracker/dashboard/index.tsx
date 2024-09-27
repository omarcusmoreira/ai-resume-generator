'use client'

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Calendar } from "lucide-react"
import { Timestamp } from 'firebase/firestore'
import { OpportunityType } from "@/types/opportunities"
import { TimestampRenderer } from "@/utils/TimestampRender"
import { useEffect, useState } from "react"
import { UserDataType } from "@/types/users"
import { getUserData } from "@/services/userServices"

type DashboardProps = {
    opportunities: OpportunityType[];
}
export default function Dashboard({opportunities}: DashboardProps) {

  const [userData, setUserData]=useState<UserDataType>()

  useEffect(()=>{
    const fetchUserData = async ()=>{
      const fetchedUserData = await getUserData();
      if (fetchedUserData){
        setUserData(fetchedUserData);
      }
    }
    fetchUserData();
  },[]);

    const ensureDate = (date: Timestamp | Date | string | number | null | undefined): Date | null => {
        console.log('Parsing date:', date);
        
        if (!date) return null;
        
        if (date instanceof Date) return date;
        
        if (date instanceof Timestamp) {
          // Check for invalid date (like 01-01-0000)
          const dateObj = date.toDate();
          if (dateObj.getFullYear() < 1970) return null; // Example: Only consider dates after 1970
          return dateObj;
        }
        
        if (typeof date === 'string' || typeof date === 'number') {
          const parsedDate = new Date(date);
          return isNaN(parsedDate.getTime()) ? null : parsedDate;
        }
        
        return null;
      };
      

  const getNextInterview = () => {
    const interviews = opportunities
      .filter(opp => opp.nextInterviewDate != null)
      .sort((a, b) => {
        const aDate = ensureDate(a.nextInterviewDate);
        const bDate = ensureDate(b.nextInterviewDate);
          
        if (!aDate || !bDate) return 0;
  
        return aDate.getTime() - bDate.getTime();
      });
    
    return interviews[0];
  };

  const nextInterview = getNextInterview()
  
return(
    <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-purple-800">
                Olá, <span className="text-purple-600">{userData?.personalInfo.name || 'Usuário'}</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">Vamos gerenciar suas oportunidades de emprego?</p>
            </div>
            <div className="flex space-x-4">
            <Card className="bg-white shadow-sm hidden md:block">
                <CardContent className="p-4 flex items-center space-x-4">
                <Briefcase className="h-8 w-8 text-purple-600" />
                <div>
                    <CardDescription className="text-xs text-purple-800">Total de Oportunidades</CardDescription>
                    <CardTitle className="text-md font-bold text-purple-600">{opportunities.length}</CardTitle>
                </div>
                </CardContent>
            </Card>
            <Card className="bg-white shadow-sm hidden md:block">
                <CardContent className="p-4 flex items-center space-x-4">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                    <CardDescription className="text-xs text-purple-800">Entrevistas Agendadas</CardDescription>
                    <CardTitle className="text-md font-bold text-purple-600">
                    {opportunities.filter(opp => opp.nextInterviewDate).length}
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
                        format='toLocale' 
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