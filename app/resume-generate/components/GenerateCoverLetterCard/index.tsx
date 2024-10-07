import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateCoverLetter } from '@/aiPrompts/generateCoverLetter';
import { useUserDataStore } from '@/stores/userDataStore';
import { useProfileStore } from '@/stores/profileStore';
import { useQuotaStore } from '@/stores/quotaStore';
import { Textarea } from "@/components/ui/textarea";
import BioCoverLetterDialog from '@/components/BioCoverLetterDialog';

interface GenerateCoverLetterCardProps {
  selectedProfile: string | undefined;
}

export const GenerateCoverLetterCard: React.FC<GenerateCoverLetterCardProps> = ({ selectedProfile }) => {
  const { userData } = useUserDataStore();
  const { profiles } = useProfileStore();
  const { quotas, decreaseQuota } = useQuotaStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetterCompletion, setCoverLetterCompletion] = useState('');

  const handleGenerateCoverLetter = async () => {
    if (quotas.interactions && quotas.interactions <= 0) {
      // Handle quota exceeded (you might want to show an upgrade dialog here)
      return;
    }
    if (!selectedProfile || !userData || !jobDescription) {
      console.error('Please select a profile and enter a job description');
      return;
    }

    setIsGenerating(true);

    try {
      const profile = profiles?.find(p => p.id === selectedProfile);
      if (!profile) {
        throw new Error('Selected profile not found');
      }

      const { completion } = await generateCoverLetter(jobDescription, profile, userData);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value.slice(0, 1000));
  };

  return (
    <div className="flex flex-col">
      <Button
        variant="outline"
        className={cn(
          "h-auto p-3 md:p-4 flex items-start space-x-3 justify-start",
          isExpanded && "border-b-0 rounded-b-none",
          "border-2 border-purple-500 bg-purple-100"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
          <Mail className="h-4 w-4 text-purple-600" />
        </div>
        <div className="flex flex-col items-start">
          <p className="text-sm text-left text-wrap font-semibold">Escrever uma carta de apresentação baseada em uma vaga.</p>
          <p className="text-xs text-left text-wrap text-gray-500">Para enviar para recrutadores</p>
        </div>
        {isGenerating && (
          <div className="ml-auto">
            <Sparkles className="h-4 w-4 animate-spin text-purple-600" />
          </div>
        )}
      </Button>

      {isExpanded && (
        <div className="border-2 border-t-0 border-purple-500 p-3 rounded-b-md">
          <Textarea
            className="min-h-[100px] mb-3 resize-none"
            placeholder="Cole a descrição da vaga aqui"
            value={jobDescription}
            onChange={handleInputChange}
            rows={Math.max(3, jobDescription.split('\n').length)}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">{jobDescription.length}/1000</span>
            <Button
              variant="ai"
              className="rounded-full bg-primary text-white"
              onClick={handleGenerateCoverLetter}
              disabled={isGenerating || !selectedProfile || !jobDescription}
            >
              {isGenerating ? (
                <span className="animate-spin mr-2">✨</span>
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              <span>Gerar Carta de Apresentação</span>
            </Button>
          </div>
        </div>
      )}

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