import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { OpportunityStatusEnum, OpportunityType } from '@/types/opportunities';
import { Timestamp } from 'firebase/firestore';
import { ResumeType } from '@/types/resumes';
import { ProfileType } from '@/types/profiles';
import { ContactType } from '@/types/contacts';
import { ensureDate } from '@/utils/ensureDate';

interface OpportunityFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (contact: Omit<OpportunityType, 'id'>) => void;
  title: string;
  description: string;
  submitButtonText: string;
  initialOpportunity?: OpportunityType;
  resumes: ResumeType[];
  profiles: ProfileType[];
  contacts: ContactType[];
  isLoading: boolean
}

export function OpportunityFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  title,
  description,
  submitButtonText,
  initialOpportunity,
  resumes,
  profiles,
  contacts,
  isLoading
}: OpportunityFormDialogProps) {
  const [opportunity, setOpportunity] = useState<Omit<OpportunityType, 'id'>>({
    companyName: '',
    position: '',
    contactPhone: '',
    contactName: '',
    resumeName: '',
    profileName: '',
    opportunityDate: Timestamp.now(),
    status: OpportunityStatusEnum.APPLIED,
  });

  useEffect(() => {
    if (initialOpportunity) {
      setOpportunity({
        position: initialOpportunity.position || '',
        companyName: initialOpportunity.companyName || '',
        profileName: initialOpportunity.profileName || '',
        status: initialOpportunity.status || OpportunityStatusEnum.APPLIED,
        resumeName: initialOpportunity.resumeName || 'Nenhum currículo atrelado',
        contactName: initialOpportunity.contactName || '',
        contactPhone: initialOpportunity.contactPhone || '',
        opportunityDate: initialOpportunity.opportunityDate || undefined,
        nextInterviewDate: initialOpportunity.nextInterviewDate || null,
      });
    }
  }, [initialOpportunity, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(opportunity);
  };

  const handleContactChange = (value: string) => {
    const selectedContact = contacts.find(contact => contact.id === value);
    if (selectedContact) {
      setOpportunity(prevOpportunity => ({
        ...prevOpportunity,
        contactName: selectedContact.name,
        contactPhone: selectedContact.phone,
      }));
    }
  };

  const handleResumeChange = (value: string) => {
    const selectedResume = resumes.find(resume => resume.id === value);
    if (selectedResume) {
      setOpportunity(prevOpportunity => ({
        ...prevOpportunity,
        resumeName: selectedResume.resumeName,
      }));
    } else if (value === "Nenhum currículo atrelado") {
      setOpportunity(prevOpportunity => ({
        ...prevOpportunity,
        resumeName: "Nenhum currículo atrelado",
      }));
    }
  };

  const handleProfileChange = (value: string) => {
    const selectedProfile = profiles.find(profile => profile.id === value);
    if (selectedProfile) {
      setOpportunity(prevOpportunity => ({
        ...prevOpportunity,
        profileName: selectedProfile.profileName,
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-purple-800">Empresa</Label>
            <Input 
              id="company" 
              value={opportunity.companyName} 
              onChange={(e) => setOpportunity({ ...opportunity, companyName: e.target.value })}
              placeholder="Nome da empresa" 
              className="border-purple-300 focus:border-purple-500" 
              required
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position" className="text-purple-800">Cargo</Label>
            <Input 
              id="position" 
              value={opportunity.position}
              onChange={(e) => setOpportunity({ ...opportunity, position: e.target.value })}
              placeholder="Título do cargo" 
              className="border-purple-300 focus:border-purple-500" 
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-purple-800">Status</Label>
            <Select
                value={opportunity.status}
                onValueChange={(value) =>
                    setOpportunity({
                    ...opportunity,
                    status: value as OpportunityStatusEnum, // Directly cast the value to OpportunityStatusEnum
                    })
                }
            >
              <SelectTrigger id="status" className="border-purple-300 focus:border-purple-500">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OpportunityStatusEnum.APPLIED}>Currículo Enviado</SelectItem>
                <SelectItem value={OpportunityStatusEnum.HR_CONTACT}>Contato com RH</SelectItem>
                <SelectItem value={OpportunityStatusEnum.INTERVIEW}>Entrevista</SelectItem>
                <SelectItem value={OpportunityStatusEnum.OFFER}>Proposta</SelectItem>
                <SelectItem value={OpportunityStatusEnum.REJECTED}>Rejeitado</SelectItem>
                <SelectItem value={OpportunityStatusEnum.DECLINED}>Declinado</SelectItem>
                <SelectItem value={OpportunityStatusEnum.CANCELED}>Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resume */}
          <div className="space-y-2">
            <Label htmlFor="resume" className="text-purple-800">Currículo</Label>
            <Select 
              value={resumes.find(resume => resume.resumeName === opportunity.resumeName)?.id || "Nenhum currículo atrelado"}
              onValueChange={handleResumeChange}
            >
              <SelectTrigger id="resume" className="border-purple-300 focus:border-purple-500">
                <SelectValue placeholder="Selecione um currículo (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nenhum currículo atrelado">Nenhum currículo atrelado</SelectItem>
                {resumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id}>
                    {resume.resumeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Profile */}
          <div className="space-y-2">
            <Label htmlFor="profile" className="text-purple-800">Perfil</Label>
            <Select 
              value={profiles.find(profile => profile.profileName === opportunity.profileName)?.id || ''}
              onValueChange={handleProfileChange}
            >
              <SelectTrigger id="profile" className="border-purple-300 focus:border-purple-500">
                <SelectValue placeholder="Selecione um perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nenhum perfil">Nenhum perfil</SelectItem>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.profileName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
            {/* HR Contact */}
            <div className="space-y-2">
            <Label htmlFor="hrContact" className="text-purple-800">Contato de RH</Label>
            <Select 
              value={contacts.find(contact => contact.name === opportunity.contactName)?.id || ''}
              onValueChange={handleContactChange}
            >
              <SelectTrigger id="hrContact" className="border-purple-300 focus:border-purple-500">
                <SelectValue placeholder="Selecione o contato">
                  {opportunity.contactName || 'Selecione o contato'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="Nenhum contato">Nenhum contato</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

                {/* Next Interview */}
                <div className="space-y-2">
                    <Label htmlFor="nextInterviewDate" className="text-purple-800">Entrevista</Label>
                    <Input 
                        id="nextInterviewDate" 
                        value={
                            ensureDate(opportunity.nextInterviewDate) 
                              ? ensureDate(opportunity.nextInterviewDate)?.toISOString().split('T')[0] 
                              : ''
                          }
                        type='date' 
                        onChange={(e) => setOpportunity({ ...opportunity, nextInterviewDate: e.target.value ? Timestamp.fromDate(new Date(e.target.value)) : null })}
                        placeholder="Nome da empresa" 
                        className="border-purple-300 focus:border-purple-500" 
                    /> 
            </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            {submitButtonText}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
