'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { PlusCircle, Search, Edit2, Trash2, Mail, Phone, Building2, Contact } from "lucide-react"
import { RecruiterType } from '@/types/recruiter'
import { RecruiterFormDialog } from '@/components/RecruiterFormDialog'
import { DeleteDialog } from '@/components/DeleteDialog'
import { UpgradeDialog } from '@/components/UpgradeAlertDialog'
import { useQuotaStore } from '@/stores/quotaStore'
import { useRecruiterStore } from '@/stores/recruiterStore'


export default function RecruiterTab() {

  const { quotas, increaseQuota } = useQuotaStore();
  const { recruiters, deleteRecruiter } = useRecruiterStore();

  const [isNewRecruiterOpen, setIsNewRecruiterOpen] = useState(false)
  const [recruiterSearch, setRecruiterSearch] = useState('')
  const [editingRecruiter, setEditingRecruiter] = useState<RecruiterType | null>(null)

  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Track modal open state
  const [recruiterToDelete, setRecruiterToDelete] = useState<RecruiterType | null>(null); // Track the opportunity to be deleted
  const [isUpgradeDialogOpen, setIsUpgradeAlertDialogOpen] = useState(false)

  const handleAddButtonAction = ()=>{
      if (quotas.recruiters && quotas.recruiters > 0){
        setIsNewRecruiterOpen(true)
      }
      else{
        setIsUpgradeAlertDialogOpen(true)
      }
  }

  const filteredRecruiters = recruiters.filter(recruiter => 
    recruiter.name.toLowerCase().includes(recruiterSearch.toLowerCase()) ||
    recruiter.email?.toLowerCase().includes(recruiterSearch.toLowerCase()) ||
    recruiter.company.toLowerCase().includes(recruiterSearch.toLowerCase())
  );

  const handleDeleteRecruiter = async () => {
    if (!recruiterToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRecruiter(recruiterToDelete.id);
      await increaseQuota('recruiters')
      setIsDeleteDialogOpen(false);
      setRecruiterToDelete(null);
    } catch (error) {
      console.log('Error deleting opportunity: ', error);
    }
    setIsDeleting(false);
  };

  const openDeleteDialog = (opportunity: RecruiterType) => {
    setRecruiterToDelete(opportunity);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-purple-800">Contatos</h2>
      <Button onClick={handleAddButtonAction} className="bg-purple-600 hover:bg-purple-700 text-white">
          <PlusCircle className="mr-2 h-5 w-5" /> Novo Contato
      </Button>
    </div>
    
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="bg-purple-100 p-4">
        <CardDescription className="text-purple-600">{`Gerencie seus contatos de RH cadastrados - Voce tem mais ${quotas.recruiters} contatos para cadastrar`}</CardDescription>
        <div className="mt-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar contatos..."
            value={recruiterSearch}
            onChange={(e) => setRecruiterSearch(e.target.value)}
            className="pl-10 border-purple-300 focus:border-purple-500"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {recruiters.length === 0 && 
          <div className='flex flex-col w-full items-center justify-center py-10'>
            <Contact className='h-20 w-20 text-gray-300 mb-4'/>
            <p className="text-2xl text-gray-400 text-center">Voce ainda não tem nenhum contato.</p>
          </div>}
          {filteredRecruiters.map((recruiter) => (
            <div key={recruiter.id} className="flex items-center justify-between p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors duration-200">
              <div>
                <h3 className="font-semibold text-purple-800 text-lg">{recruiter.name}</h3>
                <div className="flex items-center">
                <Mail className='h-4 w-4 mr-2 text-purple-800' /><p className="text-md text-purple-600">{recruiter.email}</p>
                </div>
                <div className="flex items-center">
                <Phone className='h-4 w-4 mr-2 text-purple-800'/><p className="text-sm text-purple-500">{recruiter.phone}</p>
                </div>
                <div className="flex items-center">
                <Building2 className='h-4 w-4 mr-2 text-purple-800'/><p className="text-sm text-purple-500">{recruiter.company}</p>
                </div>
              </div>
              <div className="flex space-x-2">

              <Button variant="outline" size="sm" onClick={() => setEditingRecruiter(recruiter)}>
                <Edit2 className="h-4 w-4 mr-2" /> Editar
              </Button>
              <Button key={recruiter.id} variant="destructive" size="sm" onClick={() => openDeleteDialog(recruiter)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <RecruiterFormDialog
          isOpen={isNewRecruiterOpen}
          onOpenChange={setIsNewRecruiterOpen}
          title="Adicionar Novo Contato"
          description="Registre informações de contatos de RH"
          submitButtonText="Adicionar Contato"
      />
    <RecruiterFormDialog
        isOpen={!!editingRecruiter} 
        onOpenChange={(open) => {
            if (!open) setEditingRecruiter(null);
        }}
        initialRecruiter={editingRecruiter || undefined} 
        title="Editar Contato"
        description="Atualize as informações do contato"
        submitButtonText="Atualizar Contato"
    />
    <DeleteDialog 
      isOpen={isDeleteDialogOpen} 
      onOpenChange={setIsDeleteDialogOpen} 
      onConfirm={handleDeleteRecruiter}
      isDeleting={isDeleting}
    />
    <UpgradeDialog
      isOpen={isUpgradeDialogOpen}
      onClose={() => setIsUpgradeAlertDialogOpen(false)}
      title='Contatos'
    />
  </div>

  )
}
