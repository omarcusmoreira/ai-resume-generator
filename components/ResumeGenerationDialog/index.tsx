import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, FileCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { errorMessages, validationProcessMessages } from "@/app/resume-generate/validationProcessMessages";
import { useEffect, useState } from "react";

type ResumeGenerationDialogProps = {
    isDialogOpen: boolean;
    onClose: () => void;
    resumeId: string;
    isGenerating: boolean;
    isGenerationSuccessful: boolean;
    hasGenerationFailed: boolean;
    generationAttempt: number;
}

export const ResumeGenerationDialog = ({
    isDialogOpen,
    onClose,
    resumeId,
    isGenerating,
    isGenerationSuccessful,
    hasGenerationFailed,
    generationAttempt
}: ResumeGenerationDialogProps) => {
  const router = useRouter();

  const handleCloseDialog = () => {
    onClose();
  }


  const [ title, setTitle ] = useState<string>(validationProcessMessages[generationAttempt].title);
  const [ message, setMessage ] = useState<string>(validationProcessMessages[generationAttempt].message);

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
  }, [generationAttempt, isGenerating, isGenerationSuccessful, hasGenerationFailed]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={onClose} modal={true}>
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
                <p className="text-sm text-gray-500">{message}</p>
                )}
            </div>
            <DialogFooter>
                {hasGenerationFailed && (
                <Button onClick={handleCloseDialog}>Fechar</Button>
                )}
                {isGenerationSuccessful && (
                <Button onClick={() => router.push(`/resume-preview?resumeId=${resumeId}`)}>
                    Ver Currículo
                </Button>
                )}
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};
