import React, { useState } from "react";
import { Timestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateTimePicker from "../DateTimePicker";
import { InterviewStageEnum, InterviewStage } from "@/types/opportunities";
import { useRecruiterStore } from "@/stores/recruiterStore";

interface InterviewStageDialogProps {
  onSave: (newStage: InterviewStage) => void;
}

const encouragingWords = [
  "Você consegue! Um passo mais perto do emprego dos seus sonhos!",
  "Acredite em si mesmo! Sua preparação vai valer a pena!",
  "Mantenha a confiança! Suas habilidades e experiência se destacam!",
  "Continue firme! Você está fazendo um ótimo progresso!",
  "Está quase lá! Seu esforço está prestes a dar frutos!",
  "Você está indo muito bem! Cada etapa te aproxima do sucesso!",
  "Mantenha o foco! Sua dedicação é realmente impressionante!"
];

export default function InterviewStageDialog({ onSave }: InterviewStageDialogProps) {
  const { recruiters } = useRecruiterStore();
  const [stage, setStage] = useState<InterviewStage>({
    id: Date.now().toString(),
    name: InterviewStageEnum.HR_SCREENING,
    expectedDate: Timestamp.now(),
    status: 'In Progress',
    recruiterId: '',
    notes: ''
  });
  const [open, setOpen] = useState(false);

  //eslint-disable-next-line
  const handleChange = (field: keyof InterviewStage, value: any) => {
    setStage(prevStage => ({ ...prevStage, [field]: value }));
  };

  const handleSave = () => {
    onSave(stage);
    setOpen(false);
    // Reset the stage for the next use
    setStage({
      id: Date.now().toString(),
      name: InterviewStageEnum.HR_SCREENING,
      expectedDate: Timestamp.now(),
      status: 'In Progress',
      recruiterId: '',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Entrevistas</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Registrar Etapa de Entrevista</DialogTitle>
          <DialogDescription>
            {encouragingWords[Math.floor(Math.random() * encouragingWords.length)]}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select
            value={stage.name}
            onValueChange={(value) => handleChange('name', value as InterviewStageEnum)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a etapa da entrevista" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(InterviewStageEnum).map((stageName) => (
                <SelectItem key={stageName} value={stageName}>
                  {stageName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateTimePicker
            onDateTimeChange={(date) => handleChange('expectedDate', date)}
            initialTimestamp={stage.expectedDate}
          />
          <Select
            value={stage.status}
            onValueChange={(value) => handleChange('status', value as 'Passed' | 'Failed' | 'In Progress')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Passed">Passou para a próxima</SelectItem>
              <SelectItem value="Failed">Não passou</SelectItem>
              <SelectItem value="In Progress">Em andamento</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={stage.recruiterId}
            onValueChange={(value) => handleChange('recruiterId', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o recrutador" />
            </SelectTrigger>
            <SelectContent>
              {recruiters.map((recruiter) => (
                <SelectItem key={recruiter.id} value={recruiter.id}>
                  {recruiter.name}
                </SelectItem>
              ))}
              <SelectItem value="new">Adicionar Novo Recrutador</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Notas"
            value={stage.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="w-full">Salvar Etapa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}