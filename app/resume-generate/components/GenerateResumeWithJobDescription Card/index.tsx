import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuotaStore } from '@/stores/quotaStore';
import { ResumeGenerationDialog } from '@/components/ResumeGenerationDialog';
import { Textarea } from "@/components/ui/textarea";
import { UpgradeDialog } from '@/components/UpgradeAlertDialog';

interface GenerateResumeWithJobDescriptionCardProps {
  selectedProfile: string | undefined;
  isAdvanced: boolean;
}

export const GenerateResumeWithJobDescriptionCard: React.FC<GenerateResumeWithJobDescriptionCardProps> = ({ selectedProfile, isAdvanced }) => {

  const { quotas } = useQuotaStore();

  const [isGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleValidateQuotas = ()=>{
    console.log(quotas);
    if (!quotas.resumes || quotas.resumes === 0){
      console.log('Não tem cota, entrou aqui! ', quotas.resumes)
      setIsUpgradeDialogOpen(true);
      return;
    }else{
      setIsDialogOpen(true)
    }
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value.slice(0, 1000));
  };

  const isAdvancedStyle = isAdvanced ? "border-yellow-500 bg-yellow-100" : "border-purple-500 bg-purple-100"
 

  return (
    <div className="flex flex-col">
      <Button
        variant="outline"
        className={cn(
            "h-auto p-3 md:p-4 flex items-start space-x-3 justify-start",
            "border-2",
            isAdvancedStyle, 
          isExpanded && "border-b-0 rounded-b-none",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
          <Users className={`h-4 w-4 ${isAdvanced ? "text-yellow-600" : "text-purple-600"}`} />
        </div>
        <div className="flex flex-col items-start">
          <p className="text-sm text-left text-wrap font-semibold">Gerar um currículo baseado em uma vaga específica</p>
          <p className="text-xs text-left text-wrap text-gray-500">Otimizado para uma vaga específica</p>
        </div>
        {isGenerating && (
          <div className="ml-auto">
            <Sparkles className="h-4 w-4 animate-spin text-purple-600" />
          </div>
        )}
      </Button>

      {isExpanded && (
        <div className={`border-2 border-t-0 p-3 rounded-b-md ${isAdvanced ? 'border-yellow-500' : 'border-purple-500'}`}>
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
              onClick={handleValidateQuotas}
              disabled={isGenerating || !selectedProfile || !jobDescription}
            >
              {isGenerating ? (
                <span className="animate-spin mr-2">✨</span>
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              <span>Gerar Currículo</span>
            </Button>
          </div>
        </div>
      )}

      <ResumeGenerationDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        selectedProfile={selectedProfile || ''}
        jobDescription={jobDescription}
        isAdvanced={isAdvanced}
      />
      <UpgradeDialog
        isOpen={isUpgradeDialogOpen}
        onClose={() => setIsUpgradeDialogOpen(false)}
        title={'Currículos'}
      />
    </div>
  );
};