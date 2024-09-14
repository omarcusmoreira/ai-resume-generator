'use client'

import { useState, useReducer } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ResumeState = {
  profileName: string
  keywords: string
  qualificationSummary: string
  professionalExperience: string
  academicBackground: string
  idioms: { name: string; level: string }[]
  extracurricular: string
}

type Action =
  | { type: 'UPDATE_FIELD'; field: keyof ResumeState; value: string }
  | { type: 'ADD_IDIOM'; idiom: { name: string; level: string } }
  | { type: 'UPDATE_IDIOM'; index: number; field: 'name' | 'level'; value: string }

const initialState: ResumeState = {
  profileName: '',
  keywords: '',
  qualificationSummary: '',
  professionalExperience: '',
  academicBackground: '',
  idioms: [{ name: '', level: '' }],
  extracurricular: '',
}

function resumeReducer(state: ResumeState, action: Action): ResumeState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value }
    case 'ADD_IDIOM':
      return { ...state, idioms: [...state.idioms, action.idiom] }
    case 'UPDATE_IDIOM':
      return {
        ...state,
        idioms: state.idioms.map((idiom, index) =>
          index === action.index ? { ...idiom, [action.field]: action.value } : idiom
        ),
      }
    default:
      return state
  }
}

type ProfileWizardComponentProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (state: ResumeState) => void
}

export function ProfileWizardComponent({ isOpen, onClose, onSave }: ProfileWizardComponentProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [state, dispatch] = useReducer(resumeReducer, initialState)

  const steps = [
    { title: "Let's get started!", component: Step1 },
    { title: "Qualification Summary", component: Step2 },
    { title: "Professional Experience", component: Step3 },
    { title: "Academic Background", component: Step4 },
    { title: "Idioms", component: Step5 },
    { title: "Extracurricular/Certifications", component: Step6 },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onSave(state)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader className="flex flex-col space-y-1.5 text-center sm:text-left mt-4">
          <div className="flex items-center">
            <DialogTitle className="flex-grow">{steps[currentStep].title}</DialogTitle>
            <Stepper currentStep={currentStep} totalSteps={steps.length} />
          </div>
        </DialogHeader>
        <CurrentStepComponent state={state} dispatch={dispatch} />
        <div className="flex justify-between mt-4">
          <Button onClick={handleBack} disabled={currentStep === 0}>
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Stepper({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full ${
            index <= currentStep ? 'bg-primary' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

function Step1({ state, dispatch }: { state: ResumeState; dispatch: React.Dispatch<Action> }) {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Profile Name"
        value={state.profileName}
        onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'profileName', value: e.target.value })}
        required
      />
      <Input
        placeholder="Keywords (optional)"
        value={state.keywords}
        onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'keywords', value: e.target.value })}
      />
    </div>
  )
}

function Step2({ state, dispatch }: { state: ResumeState; dispatch: React.Dispatch<Action> }) {
  return (
    <Textarea
      placeholder="Summarize your qualifications..."
      value={state.qualificationSummary}
      onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'qualificationSummary', value: e.target.value })}
      required
    />
  )
}

function Step3({ state, dispatch }: { state: ResumeState; dispatch: React.Dispatch<Action> }) {
  return (
    <Textarea
      placeholder="Describe your professional experience..."
      value={state.professionalExperience}
      onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'professionalExperience', value: e.target.value })}
      required
    />
  )
}

function Step4({ state, dispatch }: { state: ResumeState; dispatch: React.Dispatch<Action> }) {
  return (
    <Textarea
      placeholder="Describe your academic background..."
      value={state.academicBackground}
      onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'academicBackground', value: e.target.value })}
      required
    />
  )
}

function Step5({ state, dispatch }: { state: ResumeState; dispatch: React.Dispatch<Action> }) {
  return (
    <div className="space-y-4">
      {state.idioms.map((idiom, index) => (
        <div key={index} className="flex space-x-2">
          <Input
            placeholder="Idiom name"
            value={idiom.name}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_IDIOM', index, field: 'name', value: e.target.value })
            }
            required
          />
          <Select
            value={idiom.level}
            onValueChange={(value) =>
              dispatch({ type: 'UPDATE_IDIOM', index, field: 'level', value })
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="fluent">Fluent/Native</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}
      <Button onClick={() => dispatch({ type: 'ADD_IDIOM', idiom: { name: '', level: '' } })}>
        Add Idiom
      </Button>
    </div>
  )
}

function Step6({ state, dispatch }: { state: ResumeState; dispatch: React.Dispatch<Action> }) {
  return (
    <Textarea
      placeholder="List your extracurricular activities and certifications..."
      value={state.extracurricular}
      onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'extracurricular', value: e.target.value })}
      required
    />
  )
}