'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Briefcase, PlusCircle, Search, Edit2, FileText, CalendarDays, User, Clock, Trash2, Phone, Handshake } from "lucide-react"
import { OpportunityStatusEnum, OpportunityType } from '@/types/opportunities'
import { v4 } from 'uuid'
import { OpportunityFormDialog } from '@/components/OpportunityFormDialog'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TimestampRenderer } from '@/utils/TimestampRender'
import { DeleteDialog } from '@/components/DeleteDialog'
import { UpgradeDialog } from '@/components/UpgradeAlertDialog'
import { useOpportunityStore } from '@/stores/opportunityStore'
import { useQuotaStore } from '@/stores/quotaStore'

export const OpportunitiesTab = () => {

    const { opportunities, addOpportunity, deleteOpportunity, updateOpportunity, loading } = useOpportunityStore();
    const { quotas, decreaseQuota, increaseQuota } = useQuotaStore();
    console.log('cotas: ', quotas)
    const [isNewOpportunityOpen, setIsNewOpportunityOpen] = useState(false)
    const [opportunitySearch, setOpportunitySearch] = useState('')
    const [editingOpportunity, setEditingOpportunity] = useState<OpportunityType | null>(null)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Track modal open state
    const [opportunityToDelete, setOpportunityToDelete] = useState<OpportunityType | null>(null); // Track the opportunity to be deleted
    const [isUpgradeDialogOpen, setIsUpgradeAlertDialogOpen] = useState(false)

    const handleAddButtonAction = ()=>{
        if (quotas.opportunities > 0){
            setIsNewOpportunityOpen(true)
        }else {
            setIsUpgradeAlertDialogOpen(true)
        }
    }  
  
    const filteredOpportunities = opportunities.filter(opp => 
      opp.companyName.toLowerCase().includes(opportunitySearch.toLowerCase()) ||
      opp.profileName.toLowerCase().includes(opportunitySearch.toLowerCase())
    )
  
    const getStatusColor = (status: OpportunityStatusEnum) => {
      switch (status) {
        case OpportunityStatusEnum.APPLIED: return 'bg-blue-100 text-blue-800'
        case OpportunityStatusEnum.HR_CONTACT: return 'bg-yellow-100 text-yellow-800'
        case OpportunityStatusEnum.INTERVIEW: return 'bg-green-100 text-green-800'
        case OpportunityStatusEnum.OFFER: return 'bg-purple-100 text-purple-800'
        case OpportunityStatusEnum.REJECTED: return 'bg-red-100 text-red-800'
        case OpportunityStatusEnum.DECLINED: return 'bg-gray-100 text-gray-800'
        case OpportunityStatusEnum.CANCELED: return 'bg-red-100 text-red-800'
        
  
        default: return 'bg-gray-100 text-gray-800'
      }
    }
  
    const handleAddOpportunity = async (newOpportunity: Omit<OpportunityType, 'id'>) => {
        try {
        const opportunityId = v4();
        await addOpportunity(opportunityId, { ...newOpportunity, id: opportunityId });
        await decreaseQuota('opportunities');
        setIsNewOpportunityOpen(false);
      } catch (error) {
        console.error('Error adding opportunity:', error);
        // Handle error (e.g., show error message to user)
      }
    };
  
    const handleUpdateOpportunity = async (updatedOpportunity: Omit<OpportunityType, 'id'>) => {
      if (!editingOpportunity) return;
      try {
        await updateOpportunity({ ...updatedOpportunity, id: editingOpportunity.id });
        setEditingOpportunity(null)
      } catch (error) {
        console.error('Error updating contact:', error);
      }
    };

    const handleDeleteOpportunity = async () => {
        if (!opportunityToDelete) return;
        try {
          await deleteOpportunity(opportunityToDelete.id);
          await increaseQuota('opportunities')
        } catch (error) {
          console.log('Error deleting opportunity: ', error);
        }
      };
    
      const openDeleteDialog = (opportunity: OpportunityType) => {
        setOpportunityToDelete(opportunity);
        setIsDeleteDialogOpen(true);
      };

    return (
        <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-purple-800">Processos seletivos</h2>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleAddButtonAction}>
                <PlusCircle className="mr-2 h-5 w-5" /> Processo seletivo
            </Button>
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
            <div className="space-y-4">
              {filteredOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="border border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition-colors duration-200">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(opportunity.status)} px-4 h-9 flex items-center`}
                    >
                      {opportunity.status === OpportunityStatusEnum.APPLIED ? 'Currículo Enviado' :
                       opportunity.status === OpportunityStatusEnum.HR_CONTACT ? 'Contato com RH' :
                       opportunity.status === OpportunityStatusEnum.INTERVIEW ? 'Entrevista' :
                       opportunity.status === OpportunityStatusEnum.OFFER ? 'Oferta' :
                       opportunity.status === OpportunityStatusEnum.REJECTED ? 'Rejeitado' : 
                       opportunity.status === OpportunityStatusEnum.CANCELED ? 'Cancelado' : 
                       opportunity.status === OpportunityStatusEnum.DECLINED ? 'Declinado' : 'Desconhecido'}
                    </Badge>
                    <h3 className="font-semibold text-purple-800 text-lg">{opportunity.companyName}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingOpportunity(opportunity)}>
                      <Edit2 className="h-4 w-4 md:mr-1" /><span className='hidden md:block'>Editar</span>
                    </Button>
                    <Button key={opportunity.id} variant="destructive" size="sm" onClick={() => openDeleteDialog(opportunity)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                      <span className="text-purple-800">{opportunity.position}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-purple-600 truncate max-w-[200px]">{opportunity.resumeName}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{opportunity.resumeName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                      <span className="text-purple-600">
                        <TimestampRenderer fallback='Sem registro' format='toISODate' timestamp={opportunity.opportunityDate}/>
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                      <span className="text-purple-600">{opportunity.contactName || 'Sem contato atrelado'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                      <span className="text-purple-600">{opportunity.contactPhone || 'Sem telefone atrelado'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />                        
                      <span className="text-purple-600">
                        Entrevista:
                        <TimestampRenderer fallback='Sem entrevistas' format='toISODate' timestamp={opportunity.nextInterviewDate} /> 
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </CardContent>
        </Card>
        <OpportunityFormDialog 
            isOpen={isNewOpportunityOpen && !editingOpportunity} // Open only when adding
            onOpenChange={setIsNewOpportunityOpen}
            onSubmit={handleAddOpportunity}
            title="Adicionar Nova Vaga"
            description="Preencha os detalhes da nova oportunidade de emprego"
            submitButtonText="Adicionar Vaga"
        />
        <OpportunityFormDialog 
            isOpen={!!editingOpportunity} // Open only when editing
            onOpenChange={(open) => {
                if (!open) {
                    setEditingOpportunity(null); // Reset the editing opportunity when closing
                }
                setIsNewOpportunityOpen(open);
            }}
            onSubmit={handleUpdateOpportunity}
            initialOpportunity={editingOpportunity || undefined} 
            title="Editar Vaga"
            description="Atualize as informações da sua oportunidade"
            submitButtonText="Atualizar Vaga"
        />
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