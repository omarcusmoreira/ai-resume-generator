import React, { useEffect, useState } from 'react'; // Import useEffect
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RecruiterType } from '@/types/recruiter';
import {  useRecruiterStore } from '@/stores/recruiterStore';
import { v4 } from 'uuid';
import { useQuotaStore } from '@/stores/quotaStore';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'

interface ContactFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialRecruiter?: RecruiterType;
  title: string;
  description: string;
  submitButtonText: string;
}

export function RecruiterFormDialog({
  isOpen,
  onOpenChange,
  initialRecruiter,
  title,
  description,
  submitButtonText,
}: ContactFormDialogProps) {
    
    const { loading, addRecruiter, updateRecruiter } = useRecruiterStore();
    const { quotas, decreaseQuota } = useQuotaStore();
    const { toast } = useToast();
    const [localLoading, setLocalLoading] = useState(false);

  const [recruiter, setRecruiter] = React.useState<RecruiterType>({
    id: v4(),
    name: '',
    email: '',
    phone: '',
    company: '',
    linkedin: '',
  });

  useEffect(() => {
    if (initialRecruiter) {
      setRecruiter({
        id: initialRecruiter.id,
        name: initialRecruiter.name,
        email: initialRecruiter.email,
        phone: initialRecruiter.phone,
        company: initialRecruiter.company,
        linkedin: initialRecruiter.linkedin,
      });
    }
  }, [initialRecruiter]);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
  if (!initialRecruiter){
    try{
      await addRecruiter(recruiter.id, recruiter);
      await decreaseQuota('recruiters');
      toast({
        title: `${recruiter.name} salvo com sucesso`,
        description: `Voce tem mais ${quotas.recruiters && quotas.recruiters-1} contatos disponíveis`,
      })
    }
    catch(error){
      console.log('Error saving recruiter')
    }finally{
      setLocalLoading(false)
      onOpenChange(false)
    }
  }else{
    try{
      await updateRecruiter(recruiter);
      toast({
        title: `${recruiter.name}`,
        description: "atualizado com sucesso",
      })
    }
    catch(error){
      console.log('Error saving recruiter')
    }finally{
      setLocalLoading(false)
      onOpenChange(false)
    }
  }
  };
 
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white  max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-purple-800">Nome</Label>
            <Input 
              id="name" 
              value={recruiter.name}
              onChange={(e) => setRecruiter({...recruiter, name: e.target.value})}
              placeholder="Nome do contato" 
              className="border-purple-300 focus:border-purple-500" 
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-purple-800">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={recruiter.email}
              onChange={(e) => setRecruiter({...recruiter, email: e.target.value})}
              placeholder="email@exemplo.com" 
              className="border-purple-300 focus:border-purple-500" 
              
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-purple-800">Telefone</Label>
            <Input 
              id="phone" 
              type="tel" 
              value={recruiter.phone}
              onChange={(e) => setRecruiter({...recruiter, phone: e.target.value})}
              placeholder="(00) 00000-0000" 
              className="border-purple-300 focus:border-purple-500" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company" className="text-purple-800">Empresa</Label>
            <Input 
              id="company" 
              value={recruiter.company}
              onChange={(e) => setRecruiter({...recruiter, company: e.target.value})}
              placeholder="Nome da empresa" 
              className="border-purple-300 focus:border-purple-500" 
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-purple-800">Perfil LinkedIn</Label>
            <Input 
              id="linkedin" 
              value={recruiter.linkedin}
              onChange={(e) => setRecruiter({...recruiter, linkedin: e.target.value})}
              placeholder="URL do perfil LinkedIn" 
              className="border-purple-300 focus:border-purple-500" 
            />
          </div>
          <Button type="submit" disabled={loading || localLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            <Loader className={ loading || localLoading ? 'block animate-spin mr-2' : 'hidden'}/>
            {submitButtonText}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}