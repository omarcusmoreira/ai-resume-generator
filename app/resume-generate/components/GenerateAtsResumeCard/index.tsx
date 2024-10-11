import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileCode2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuotaStore } from '@/stores/quotaStore';
import { ResumeGenerationDialog } from '@/components/ResumeGenerationDialog';
import { UpgradeDialog } from '@/components/UpgradeAlertDialog';

interface GenerateATSResumeCardProps {
  selectedProfile: string | undefined;
  isAdvanced: boolean
}

export const GenerateATSResumeCard: React.FC<GenerateATSResumeCardProps> = ({ selectedProfile, isAdvanced }) => {

  const { quotas } = useQuotaStore();

  const [isGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const isAdvancedStyle = isAdvanced ? "border-yellow-500 bg-yellow-100" : "border-purple-500 bg-purple-100"

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "h-auto p-3 md:p-4 flex items-start space-x-3 justify-start",
          "border-2",
          isAdvancedStyle, 
        )}
        onClick={handleValidateQuotas}
        disabled={isGenerating || !selectedProfile}
      >
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
          <FileCode2 className={`h-4 w-4 ${isAdvanced ? "text-yellow-600" : "text-purple-600"}`}/>
        </div>
        <div className="flex flex-col items-start">
          <p className="text-sm text-left text-wrap font-semibold">Gerar um currículo ATS</p>
          <p className="text-xs text-left text-wrap text-gray-500">Otimizado para algoritmos de recrutamento</p>
        </div>
        {isGenerating && (
          <div className="ml-auto">
            <Sparkles className="h-4 w-4 animate-spin text-purple-600" />
          </div>
        )}
      </Button>
      <ResumeGenerationDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        selectedProfile={selectedProfile || ''}
        isAdvanced={isAdvanced}
      />
      <UpgradeDialog
        isOpen={isUpgradeDialogOpen}
        onClose={() => setIsUpgradeDialogOpen(false)}
        title={'Currículos'}
      />
    </>
  );
};