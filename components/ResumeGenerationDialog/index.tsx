import React, { useState, useEffect } from 'react';
import { v4 } from 'uuid';
import { Timestamp } from 'firebase/firestore';
import { generateResumeWithJobDescription } from '@/aiPrompts/generateResumeWithJobDescription';
import { generateResume } from '@/aiPrompts/generateResume';
import { ResumeType } from '@/types/resumes';
import { useUserDataStore } from '@/stores/userDataStore';
import { useProfileStore } from '@/stores/profileStore';
import { useQuotaStore } from '@/stores/quotaStore';
import { useResumeStore } from '@/stores/resumeStore';
import { trimToJSON } from '@/app/utils/trimToJSON';
import { validateCompletion } from '@/app/utils/validateJSONCompletion';
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, FileCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { errorMessages, validationProcessMessages } from "@/app/resume-generate/validationProcessMessages";
import { advancedGenerateResumeWithJobDescription } from '@/aiPrompts/advancedGenerateResumeWithJobDescription';
import { advancedGenerateResume } from '@/aiPrompts/advancedGenerateResume';
import { UpgradeDialog } from '../UpgradeAlertDialog';

interface ResumeGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProfile: string;
  jobDescription?: string;
  isAdvanced: boolean;
}

export const ResumeGenerationDialog: React.FC<ResumeGenerationDialogProps> = ({
  isOpen,
  onClose,
  selectedProfile,
  jobDescription,
  isAdvanced,
}) => {
  const router = useRouter();
  const { userData } = useUserDataStore();
  const { profiles } = useProfileStore();
  const { addResume } = useResumeStore();
  const { decreaseQuota } = useQuotaStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeId, setResumeId] = useState<string>('');
  const [generationAttempt, setGenerationAttempt] = useState<number>(0);
  const [hasGenerationFailed, setHasGenerationFailed] = useState(false);
  const [isGenerationSuccessful, setIsGenerationSuccessful] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);

  const handleGenerateResume = async () => {

    if (!selectedProfile || !userData) {
      console.error('Please select a profile');
      return;
    }

    setIsGenerating(true);
    setHasGenerationFailed(false);
    setIsGenerationSuccessful(false);
    
    const newResumeId = v4();
    setResumeId(newResumeId);

    try {
      const profile = profiles?.find(p => p.id === selectedProfile);
      if (!profile) {
        throw new Error('Selected profile not found');
      }

      let currentAttempt = 0;
      const maxAttempts = 7;

      do {
        try {
          let result;
          if (jobDescription) {
            if (isAdvanced) {
              result = await advancedGenerateResumeWithJobDescription(jobDescription, profile);  
            } else{
              result = await generateResumeWithJobDescription(jobDescription, profile);
            }
          } else {
            if (isAdvanced){
              result = await advancedGenerateResume(profile);
            } else {
              result = await generateResume(profile);
            }
          }

          const completion = isAdvanced ? result.completion.message.function_call.arguments : result.completion ;
          
          console.log(completion);
          const trimmedCompletion = trimToJSON(completion);

          if (validateCompletion(trimmedCompletion)) {
            const uniqueId = newResumeId.slice(0, 2);
            const currentDate = new Date();
            const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;

            const resume = {
              id: newResumeId,
              createdAt: Timestamp.now(),
              resumeName: `CV_${uniqueId}_${formattedDate}_${userData.personalInfo.name.replace(/\s+/g, '_')}_${profile.profileName.replace(/\s+/g, '_')}.pdf`,
              contentJSON: trimmedCompletion,
              isAccepted: false,
              profileName: profile.profileName,
              updatedAt: Timestamp.now(),
            } as ResumeType;
            
            await addResume(newResumeId, resume);
            await decreaseQuota('resumes');
            setIsGenerationSuccessful(true);
            return;
          }
        } catch (error) {
          console.error('Error generating resume:', error);
        }
        currentAttempt++;
        setGenerationAttempt(currentAttempt);
      } while (currentAttempt < maxAttempts);

      setHasGenerationFailed(true);
    } catch (error) {
      console.error('Error generating resume:', error);
      setHasGenerationFailed(true);
    } finally {
      setIsGenerating(false);

    }
  };

  useEffect(() => {
    if (isOpen) {
      handleGenerateResume();
    }
    //eslint-disable-next-line
  }, [isOpen]);

  useEffect(() => {
    if (isGenerating) {
      setTitle(validationProcessMessages[generationAttempt].title);
      setMessage(validationProcessMessages[generationAttempt].message);
    }
    if (isGenerationSuccessful) {
      setTitle('Prontinho!');
      setMessage(validationProcessMessages[generationAttempt].message);
    }
    if (hasGenerationFailed) {
      setTitle(errorMessages[generationAttempt].title);
      setMessage(errorMessages[generationAttempt].message);
    }
    //eslint-disable-next-line
  }, [generationAttempt, isGenerating, isGenerationSuccessful, hasGenerationFailed]);

  const handleCloseDialog = () => {
    onClose();
    setIsGenerationSuccessful(false);
    setHasGenerationFailed(false);
    setGenerationAttempt(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog} modal={true}>
      <DialogContent className="sm:max-w-md bg-white" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <div className="flex flex-col items-center justify-center space-y-4">
          {isGenerating && (
            <Sparkles className="h-16 w-16 text-gray-500 animate-spin" />
          )}
          {isGenerationSuccessful && (
            <FileCheck className="h-16 w-16 text-primary" />
          )}
          {hasGenerationFailed && (
            <AlertCircle className="h-16 w-16 text-red-500" />
          )}
          <p className="text-center font-semibold">{title}</p>
          {(isGenerating || hasGenerationFailed) && (
            <p className="text-sm text-gray-500 text-center">{message}</p>
          )}
        </div>
        <DialogFooter>
          {hasGenerationFailed && (
            <Button onClick={handleCloseDialog}>Fechar</Button>
          )}
          {isGenerationSuccessful && (
            <Button onClick={() => router.push(`/resume-editor?resumeId=${resumeId}`)}>
              Ver Currículo
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
      <UpgradeDialog
        isOpen={isUpgradeDialogOpen}
        onClose={() => setIsUpgradeDialogOpen(false)}
        title={'Currículos'}
      />
    </Dialog>
  );
};