'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Search, Handshake } from "lucide-react"
import { DeleteDialog } from '@/components/DeleteDialog'
import { UpgradeDialog } from '@/components/UpgradeAlertDialog'
import { useOpportunityStore } from '@/stores/opportunityStore'
import { useQuotaStore } from '@/stores/quotaStore'
import OpportunityForm from '@/components/OpportunityForm'
import { OpportunityCard } from '@/components/OpportunityCard'
import { OpportunityType } from '@/types/opportunities'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

export const OpportunitiesTab = () => {

    const { opportunities, deleteOpportunity, loading } = useOpportunityStore();
    const { quotas, increaseQuota } = useQuotaStore();
    const [opportunitySearch, setOpportunitySearch] = useState('')

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Track modal open state
    const [opportunityToDelete, setOpportunityToDelete] = useState<OpportunityType | null>(null); // Track the opportunity to be deleted
    const [isUpgradeDialogOpen, setIsUpgradeAlertDialogOpen] = useState(false)
  
    const filteredOpportunities = opportunities.filter(opp => 
      opp.companyName.toLowerCase().includes(opportunitySearch.toLowerCase())
    )
 
    const handleDeleteOpportunity = async () => {
        if (!opportunityToDelete) return;
        try {
          await deleteOpportunity(opportunityToDelete.id);
          await increaseQuota('opportunities')
          setIsDeleteDialogOpen(false);
        } catch (error) {
          console.log('Error deleting opportunity: ', error);
        }
      };
    
      const openDeleteDialog = (opportunity: OpportunityType) => {
        setOpportunityToDelete(opportunity);
        setIsDeleteDialogOpen(true);
      };

    return (
        <div className="space-y-4 mb-20">
          <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-purple-800 px-2 sm:px-0">Processos seletivos</h2>
              <OpportunityForm editMode={false} />
          </div>
          
          <Card className="bg-white shadow rounded-lg overflow-hidden">
            <CardHeader className="bg-purple-100 p-4">
              <CardDescription className="text-purple-600">{`Gerencie seus processos seletivos em andamento - Voce tem mais ${quotas.opportunities} vagas para cadastrar`}</CardDescription>
              <div className="mt-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar oportunidades..."
                  value={opportunitySearch}
                  onChange={(e) => setOpportunitySearch(e.target.value)}
                  className="pl-10 border-purple-300 focus:border-purple-500"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
            {opportunities.length === 0 && 
              <div className='flex flex-col w-full items-center justify-center py-10'>
                <Handshake className='h-20 w-20 text-gray-300 mb-4'/>
                <p className="text-2xl text-gray-400 text-center">Voce ainda não está participando de nenhum processo seletivo.</p>
              </div>}

                <div className="space-y-4 ">
                  <Carousel>
                    <CarouselContent>
                      {filteredOpportunities.map((opportunity) => (
                      <CarouselItem  key={opportunity.id} className="sm:basis-1/3">
                        <OpportunityCard
                          key={opportunity.id}
                          opportunity={opportunity}
                          openDeleteDialog={() => openDeleteDialog(opportunity)}
                        />
                      </CarouselItem>
                      ))}
                    </CarouselContent>
                  <CarouselPrevious/>
                  <CarouselNext />
                  </Carousel>
                </div>
              </CardContent>
            </Card>

          <DeleteDialog 
              isOpen={isDeleteDialogOpen} 
              onOpenChange={setIsDeleteDialogOpen} 
              onConfirm={handleDeleteOpportunity}
              isDeleting={loading}
          />
          <UpgradeDialog
          isOpen={isUpgradeDialogOpen}
          onClose={() => setIsUpgradeAlertDialogOpen(false)}
          title='Vagas'
          />
      </div>

    )
}