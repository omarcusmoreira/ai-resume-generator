import React, { useEffect } from 'react'; // Import useEffect
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactType } from '@/types/contacts';

interface ContactFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (contact: Omit<ContactType, 'id'>) => void;
  initialContact?: ContactType;
  title: string;
  description: string;
  submitButtonText: string;
}

export function ContactFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialContact,
  title,
  description,
  submitButtonText
}: ContactFormDialogProps) {
  const [contact, setContact] = React.useState<Omit<ContactType, 'id'>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    linkedin: '',
  });

  // Update contact state when initialContact changes
  useEffect(() => {
    if (initialContact) {
      setContact({
        name: initialContact.name,
        email: initialContact.email,
        phone: initialContact.phone,
        company: initialContact.company,
        linkedin: initialContact.linkedin,
      });
    }
  }, [initialContact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(contact);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-purple-800">Nome</Label>
            <Input 
              id="name" 
              value={contact.name}
              onChange={(e) => setContact({...contact, name: e.target.value})}
              placeholder="Nome do contato" 
              className="border-purple-300 focus:border-purple-500" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-purple-800">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={contact.email}
              onChange={(e) => setContact({...contact, email: e.target.value})}
              placeholder="email@exemplo.com" 
              className="border-purple-300 focus:border-purple-500" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-purple-800">Telefone</Label>
            <Input 
              id="phone" 
              type="tel" 
              value={contact.phone}
              onChange={(e) => setContact({...contact, phone: e.target.value})}
              placeholder="(00) 00000-0000" 
              className="border-purple-300 focus:border-purple-500" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company" className="text-purple-800">Empresa</Label>
            <Input 
              id="company" 
              value={contact.company}
              onChange={(e) => setContact({...contact, company: e.target.value})}
              placeholder="Nome da empresa" 
              className="border-purple-300 focus:border-purple-500" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-purple-800">Perfil LinkedIn</Label>
            <Input 
              id="linkedin" 
              value={contact.linkedin}
              onChange={(e) => setContact({...contact, linkedin: e.target.value})}
              placeholder="URL do perfil LinkedIn" 
              className="border-purple-300 focus:border-purple-500" 
            />
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            {submitButtonText}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}