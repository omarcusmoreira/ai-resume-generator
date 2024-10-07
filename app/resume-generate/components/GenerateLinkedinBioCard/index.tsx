import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserDataStore } from '@/stores/userDataStore';
import { useProfileStore } from '@/stores/profileStore';
import { useQuotaStore } from '@/stores/quotaStore';
import BioCoverLetterDialog from '@/components/BioCoverLetterDialog';
import { generateLinkedinBio } from '@/aiPrompts/generateLinkedinBio';
import { LinkedInLogoIcon } from '@radix-ui/react-icons';

interface GenerateLinkedInBioCardProps {
  selectedProfile: string | undefined;
}

export const GenerateLinkedInBioCard: React.FC<GenerateLinkedInBioCardProps> = ({ selectedProfile }) => {
  const { userData } = useUserDataStore();
  const { profiles } = useProfileStore();
  const { quotas, decreaseQuota } = useQuotaStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coverLetterCompletion, setCoverLetterCompletion] = useState('');

  const handleGenerateCoverLetter = async () => {
    if (quotas.interactions && quotas.interactions <= 0) {
      // Handle quota exceeded (you might want to show an upgrade dialog here)
      return;
    }
    if (!selectedProfile || !userData) {
      console.error('Please select a profile and enter a job description');
      return;
    }

    setIsGenerating(true);

    try {
      const profile = profiles?.find(p => p.id === selectedProfile);
      if (!profile) {
        throw new Error('Selected profile not found');
      }

      const { completion } = await generateLinkedinBio(profile);
      console.log(completion);
      setCoverLetterCompletion(completion);
      setIsDialogOpen(true);
      await decreaseQuota('interactions');
    } catch (error) {
      console.error('Error generating cover letter:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCoverLetterCompletion('');
  };

  return (
    <div className="flex flex-col">
      <Button
        variant="outline"
        className={cn(
          "h-auto p-3 md:p-4 flex items-start space-x-3 justify-start border-2 border-purple-500 bg-purple-100"
        )}
        disabled={isGenerating || !selectedProfile}
        onClick={handleGenerateCoverLetter}
      >
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
          <LinkedInLogoIcon className="h-4 w-4 text-purple-600" />
        </div>
        <div className="flex flex-col items-start">
          <p className="text-sm text-left text-wrap font-semibold">Escrever uma Biografia</p>
          <p className="text-xs text-left text-wrap text-gray-500">Para seu perfil do LinkedIn</p>
        </div>
        {isGenerating && (
          <div className="ml-auto">
            <Sparkles className="h-4 w-4 animate-spin text-purple-600" />
          </div>
        )}
      </Button>

      <BioCoverLetterDialog 
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        dialogTitle='Carta de Apresentação'
        completion={coverLetterCompletion}
        quota={quotas?.interactions || 0}
      />
    </div>
  );
};