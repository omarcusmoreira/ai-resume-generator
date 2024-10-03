import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { OpportunityStatusEnum, OpportunityType } from '@/types/opportunities'
import { useRecruiterStore } from '@/stores/recruiterStore'
import { useResumeStore } from '@/stores/resumeStore'
import { useProfileStore } from '@/stores/profileStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Building, CalendarDays, Handshake, Loader, PlusCircle, Radar, User } from 'lucide-react'
import { useOpportunityStore } from '@/stores/opportunityStore'
import { v4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import { RecruiterFormDialog } from '../RecruiterFormDialog'
import { useToast } from '@/hooks/use-toast'
import { useQuotaStore } from '@/stores/quotaStore'

const timestampSchema = z.custom<Timestamp>(
    (data) => data instanceof Timestamp,
    { message: "Must be a Firestore Timestamp" }
  );

const opportunitySchema = z.object({
  id: z.string(),
  companyName: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  salary: z.number().nullable(),
  jobFormat: z.enum(['remote', 'onsite', 'hybrid']),
  opportunityLink: z.string().url('Invalid URL'),
  recruiterId: z.string().min(1, 'Recruiter is required'),
  profileId: z.string().min(1, 'Profile is required'),
  resumeId: z.string().min(1, 'Resume is required'),
  status: z.nativeEnum(OpportunityStatusEnum),
  source: z.string().min(1, 'Source is required'),
  createdAt: timestampSchema.optional(),
  updatedAt: timestampSchema.optional(),

})

type OpportunityFormData = z.infer<typeof opportunitySchema>

export default function OpportunityForm({ opportunity, editMode = true }: { opportunity?: OpportunityType, editMode?: boolean }) {
    const { toast } = useToast()
  const { recruiters } = useRecruiterStore()
  const { resumes } = useResumeStore()
  const { profiles } = useProfileStore()
  const { loading, addOpportunity, updateOpportunity } = useOpportunityStore()
  const { quotas, decreaseQuota } = useQuotaStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isNewRecruiterDialogOpen, setIsNewRecruiterDialogOpen] = useState(false)
  const [longLoading, setLongLoading] = useState(false)
  const defaultSources = ['Company website', 'LinkedIn', 'Gupy', 'inHire', 'Indicação']
  const [customSources, setCustomSources] = useState<string[]>([])
  const [newSource, setNewSource] = useState('')

  const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: opportunity ? {
      ...opportunity,
      createdAt: opportunity.createdAt instanceof Timestamp ? opportunity.createdAt : Timestamp.fromDate(new Date(opportunity.createdAt)),
      updatedAt: opportunity.updatedAt instanceof Timestamp ? opportunity.updatedAt : Timestamp.fromDate(new Date(opportunity.updatedAt)),
      status: opportunity.status as OpportunityStatusEnum|| OpportunityStatusEnum.APPLIED,
    } : {
      id: '',
      companyName: '',
      position: '',
      salary: null,
      jobFormat: 'remote',
      opportunityLink: '',
      recruiterId: '',
      profileId: '',
      resumeId: '',
      status: OpportunityStatusEnum.APPLIED,
      source: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  })

  const onSubmit = async (data: OpportunityFormData) => {
    setLongLoading(true);
    
    if (opportunity) {
      try {
        console.log("Original opportunity data:", opportunity);
        console.log("Form data:", data);
        
        const updatedOpportunity = {
          ...data,
          createdAt: opportunity.createdAt,
          updatedAt: Timestamp.now(),
        };
        
        console.log("Merged data to update:", updatedOpportunity);
        
        await updateOpportunity(updatedOpportunity);
        
        console.log("Update opportunity call completed");
        toast({
          title: `Processo Seletivo atualizado`,
        });
        reset();
      } catch (error) {
        console.error("Error in updateOpportunity:", error);
        toast({
          title: "Error updating opportunity",
          description: "Please try again",
          variant: "destructive",
        });
      } finally {
        setLongLoading(false);
      }
    } else {
      try {
        if (quotas.opportunities <= 0) {
          throw new Error("Quota exceeded");
        }
        const opportunityId = v4();
        await addOpportunity(opportunityId, {
          ...data,
          id: opportunityId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          opportunityLink: data.opportunityLink,
          recruiterId: data.recruiterId,
          profileId: data.profileId,
          resumeId: data.resumeId,
          source: data.source,
          interviewStages: [],
        });
        await decreaseQuota('opportunities');
        toast({
          title: `Processo Seletivo adicionado`,
          description: `Você tem mais ${quotas.opportunities-1} processos disponíveis`,
        });
        reset();
        //eslint-disable-next-line
      } catch (error: any) {
        toast({
          title: "Error adding opportunity",
          description: error.message || "Please try again",
          variant: "destructive",
        });
      } finally {
        setLongLoading(false);
      }
    }
    setIsOpen(false);
  };

  const handleAddSource = () => {
    if (newSource && !defaultSources.includes(newSource) && !customSources.includes(newSource)) {
      setCustomSources([...customSources, newSource])
      setValue('source', newSource)
      setNewSource('')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {editMode ?
          <Button variant='outline'>
            Editar          
          </Button> :
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <PlusCircle className="mr-2 h-5 w-5" /> Processo seletivo
          </Button>
        }
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[460px] bg-gray-100 overflow-auto">
        <SheetHeader>
          <SheetTitle className='flex flex-row items-center mb-2'>
            <Handshake className='h-6 w-6 mr-2' />
            {opportunity ? 'Editar Processo' : 'Adcionar novo processo'}
          </SheetTitle>
        </SheetHeader>
        <form   onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w--sm mx-auto">
        <Card>
          <CardHeader className='flex flex-row items-center'>
            <div className='p-2 rounded-full bg-purple-100 mr-2'>
                <Building className='h-4 w-4 text-black'/>
            </div>
            <CardTitle className="text-sm">Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Empresa</Label>
              <Input id="companyName" {...register('companyName')} />
              {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input id="position" {...register('position')} />
              {errors.position && <p className="text-red-500 text-xs">{errors.position.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salário</Label>
              <Input id="salary" type="number" {...register('salary', { valueAsNumber: true })} />
              {errors.salary && <p className="text-red-500 text-xs">{errors.salary.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Local</Label>
              <Controller
                name="jobFormat"
                control={control}
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="remote" id="remote" />
                      <Label htmlFor="remote" className="text-sm">Remoto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="onsite" id="onsite" />
                      <Label htmlFor="onsite" className="text-sm">Presencial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hybrid" id="hybrid" />
                      <Label htmlFor="hybrid" className="text-sm">Híbrido</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opportunityLink">Link da vaga</Label>
              <Input id="opportunityLink" placeholder='https://www.emp..'{...register('opportunityLink')} />
              {errors.opportunityLink && <p className="text-red-500 text-xs">{errors.opportunityLink.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
        <CardHeader className='flex flex-row items-center'>
            <div className='p-2 rounded-full bg-purple-100 mr-2'>
                <User className='h-4 w-4 text-black'/>
            </div>
            <CardTitle className="text-sm">Informação do Recrutador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recruiterId">Recrutador</Label>
              <Controller
                name="recruiterId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="recruiterId">
                      <SelectValue placeholder="Selecione um recrutador" />
                    </SelectTrigger>
                    <SelectContent>
                      {recruiters.map((recruiter) => (
                        <SelectItem key={recruiter.id} value={recruiter.id}>{recruiter.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.recruiterId && <p className="text-red-500 text-xs">{errors.recruiterId.message}</p>}
            </div>
            {/* HAHAHH */}
            <Button onClick={() => setIsNewRecruiterDialogOpen(true)} variant="secondary" size="sm">Adcionar Recrutador</Button>
          </CardContent>
        </Card>

        <Card>
        <CardHeader className='flex flex-row items-center'>
            <div className='p-2 rounded-full bg-purple-100 mr-2'>
                <CalendarDays className='h-4 w-4 text-black'/>
            </div>
            <CardTitle className="text-sm">Suas Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileId">Perfil</Label>
              <Controller
                name="profileId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="profileId">
                      <SelectValue placeholder="Selecione um Perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>{profile.profileName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.profileId && <p className="text-red-500 text-xs">{errors.profileId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumeId">Currículo</Label>
              <Controller
                name="resumeId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="resumeId">
                      <SelectValue placeholder="Selecione um Currículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>{resume.resumeName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.resumeId && <p className="text-red-500 text-xs">{errors.resumeId.message}</p>}
            </div>
                </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center'>
                        <div className='p-2 rounded-full bg-purple-100 mr-2'>
                            <Radar className='h-4 w-4 text-black' />
                        </div>
                    <CardTitle className="text-sm">Fonte da vaga</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="source">Fonte</Label>
                    <Controller
                    name="source"
                    control={control}
                    render={({ field }) => (
                        <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        >
                        <SelectTrigger id="source">
                            <SelectValue placeholder="Selecione a fonte" />
                        </SelectTrigger>
                        <SelectContent>
                            {[...defaultSources, ...customSources].map((source) => (
                            <SelectItem key={source} value={source}>
                                {source}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    )}
                    />
                    {errors.source && <p className="text-red-500 text-xs">{errors.source.message}</p>}
                </div>
                <div className="flex space-x-2">
                    <Input
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="Add new source"
                    />
                    <Button onClick={handleAddSource} type="button" variant="secondary" size="sm">
                    Add
                    </Button>
                </div>
                </CardContent>
            </Card>

            <Card>  
              <CardHeader className='flex flex-row items-center'>
                <div className='p-2 rounded-full bg-purple-100 mr-2'>
                  <CalendarDays className='h-4 w-4 text-black'/>
                </div>
              <CardTitle className="text-sm">Status do Processo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(OpportunityStatusEnum).map(([key, value]) => (
                        <SelectItem key={key} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-red-500 text-xs">{errors.status.message}</p>}
            </div>
            {/* <Button onClick={() => setIsNewInterviewStageDialogOpen(true)} variant="secondary" size="sm">Adcionar Nova Intrevista</Button> */}
          </CardContent>
        </Card>

          <Button type="submit" disabled={loading || longLoading} className="w-full">
            <Loader className={loading || longLoading ? 'block animate-spin mr-2 h-4 w-4' : 'hidden mr-2'} />
              Salvar Processo
            </Button>
        </form>
      </SheetContent>

      <RecruiterFormDialog
        isOpen={isNewRecruiterDialogOpen}
        onOpenChange={setIsNewRecruiterDialogOpen}
        title="Adicionar Novo Recrutador"
        description="Registre informações de contatos de RH"
        submitButtonText="Adicionar Contato"
      />
    </Sheet>
  )
}