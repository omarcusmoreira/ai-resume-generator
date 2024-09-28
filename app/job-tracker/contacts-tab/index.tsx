'use client'

import { Dispatch, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { PlusCircle, Search, Edit2, Trash2, Mail, Phone, Building2, Contact } from "lucide-react"
import { ContactType } from '@/types/contacts'
import { addContact, deleteContact, updateContact } from '@/services/contactsService'
import { v4 } from 'uuid'
import { ContactFormDialog } from '@/components/ContactFormDialog'
import { DeleteDialog } from '@/components/DeleteDialog'
import { decrementQuota, getQuotaByType, incrementQuota } from '@/services/quotaServices'
import { UpgradeDialog } from '@/components/UpgradeAlertDialog'

type ContactsTabProps = {
    contacts: ContactType[];
    setContacts: Dispatch<React.SetStateAction<ContactType[]>>
}

export default function ContactsTab({contacts,setContacts}:ContactsTabProps) {
  const [isNewContactOpen, setIsNewContactOpen] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const [editingContact, setEditingContact] = useState<ContactType | null>(null)

  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Track modal open state
  const [contactToDelete, setContactToDelete] = useState<ContactType | null>(null); // Track the opportunity to be deleted
  const [contactQuota, setContactQuota] = useState(0)
  const [isUpgradeDialogOpen, setIsUpgradeAlertDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)


  const handleAddButtonAction = ()=>{
      if (contactQuota > 0){
        setIsNewContactOpen(true)
      }
      else{
        setIsUpgradeAlertDialogOpen(true)
      }
  }

  useEffect(()=>{
    const fetchQuotas = async () =>{
      const fetchedQuota = await getQuotaByType('contacts')
      setContactQuota(fetchedQuota)
    }
    fetchQuotas()
  }, [isDeleteDialogOpen, isNewContactOpen])

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.company.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const handleAddContact = async (newContact: Omit<ContactType, 'id'>) => {
    setIsLoading(true)
    try {
      const contactId = v4();
      await addContact(contactId, { ...newContact, id: contactId });
      await decrementQuota('contacts')
      setContacts(prevContacts => [...prevContacts, { ...newContact, id: contactId }]);
      setIsNewContactOpen(false);
    } catch (error) {
      console.error('Error adding contact:', error);
      // Handle error (e.g., show error message to user)
    }
    setIsLoading(false)
  };

  const handleUpdateContact = async (updatedContact: Omit<ContactType, 'id'>) => {
    if (!editingContact) return;
    try {
      await updateContact({ ...updatedContact, id: editingContact.id });
      setContacts(prevContacts => 
        prevContacts.map(c => c.id === editingContact.id ? { ...updatedContact, id: editingContact.id } : c)
      );
      setEditingContact(null);
    } catch (error) {
      console.error('Error updating contact:', error);
      // Handle error (e.g., show error message to user)
    }
  }

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    setContacts(prevContact => prevContact.filter(o => o.id !== contactToDelete.id));
    try {
      await deleteContact(contactToDelete.id);
      await incrementQuota('contacts')
      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
    } catch (error) {
      console.log('Error deleting opportunity: ', error);
    }
    setIsDeleting(false);
  };

  const openDeleteDialog = (opportunity: ContactType) => {
    setContactToDelete(opportunity);
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
        <CardDescription className="text-purple-600">{`Gerencie seus contatos de RH cadastrados - Voce tem mais ${contactQuota} contatos para cadastrar`}</CardDescription>
        <div className="mt-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar contatos..."
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
            className="pl-10 border-purple-300 focus:border-purple-500"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {contacts.length === 0 && 
          <div className='flex flex-col w-full items-center justify-center py-10'>
            <Contact className='h-20 w-20 text-gray-300 mb-4'/>
            <p className="text-2xl text-gray-400 text-center">Voce ainda não tem nenhum contato.</p>
          </div>}
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors duration-200">
              <div>
                <h3 className="font-semibold text-purple-800 text-lg">{contact.name}</h3>
                <div className="flex items-center">
                <Mail className='h-4 w-4 mr-2 text-purple-800' /><p className="text-md text-purple-600">{contact.email}</p>
                </div>
                <div className="flex items-center">
                <Phone className='h-4 w-4 mr-2 text-purple-800'/><p className="text-sm text-purple-500">{contact.phone}</p>
                </div>
                <div className="flex items-center">
                <Building2 className='h-4 w-4 mr-2 text-purple-800'/><p className="text-sm text-purple-500">{contact.company}</p>
                </div>
              </div>
              <div className="flex space-x-2">

              <Button variant="outline" size="sm" onClick={() => setEditingContact(contact)}>
                <Edit2 className="h-4 w-4 mr-2" /> Editar
              </Button>
              <Button key={contact.id} variant="destructive" size="sm" onClick={() => openDeleteDialog(contact)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <ContactFormDialog
          isOpen={isNewContactOpen}
          onOpenChange={setIsNewContactOpen}
          onSubmit={handleAddContact}
          title="Adicionar Novo Contato"
          description="Registre informações de contatos de RH"
          submitButtonText="Adicionar Contato"
          isLoading={isLoading}
      />
    <ContactFormDialog
        isOpen={!!editingContact} // Ensure dialog opens when editingContact is not null
        onOpenChange={(open) => {
            if (!open) setEditingContact(null); // Reset editingContact when dialog closes
        }}
        onSubmit={handleUpdateContact}
        initialContact={editingContact || undefined} // Pass the editingContact
        title="Editar Contato"
        description="Atualize as informações do contato"
        submitButtonText="Atualizar Contato"
        isLoading={isLoading}
    />
    <DeleteDialog 
      isOpen={isDeleteDialogOpen} 
      onOpenChange={setIsDeleteDialogOpen} 
      onConfirm={handleDeleteContact}
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
