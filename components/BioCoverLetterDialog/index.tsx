"use client"

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Pencil, Save } from 'lucide-react'

interface CoverLetterDialogProps {
  completion: string
  isOpen: boolean
  onClose: () => void
  dialogTitle: string
  quota: number
}

export default function BioCoverLetterDialog({
  completion,
  isOpen,
  onClose,
  dialogTitle,
  quota,
}: CoverLetterDialogProps) {
  const [coverLetter, setCoverLetter] = useState(completion)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setCoverLetter(completion)
  }, [completion])

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter)
      .then(() => alert('Carta de apresentação copiada para a área de transferência!'))
      .catch((err) => console.error('Failed to copy: ', err))
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] bg-white">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            <p>
              Você pode editar o texto gerado ou copiar para a área de transferência para enviar para a oportunidade pretendida.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {isEditing ? (
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[300px] w-full p-2"
            />
          ) : (
            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md max-h-[400px] overflow-y-auto">
              {coverLetter}
            </pre>
          )}
        </div>
        <div className="flex justify-between items-center space-x-2 mt-4">
          <div className="text-sm text-gray-500">
          {`Voce pode gerar mais ${quota-1} ${dialogTitle}.`} 
          </div>
          <div className='flex gap-2'>
            {isEditing ? (
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
            </Button>
          ) : (
            <>
              <Button onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
            </Button>
            </>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}