'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Upload, FileText, CheckCircle, PenTool } from 'lucide-react'
import { toast } from 'sonner'

interface OnboardingTask {
  id: string
  applicationId: string
  jobTitle: string
  company: string
  taskType: string
  title: string
  description?: string
  isRequired: boolean
  dueDate?: string
  status: string
}

interface OnboardingTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: OnboardingTask
  onSubmit: (taskId: string, data: any) => Promise<void>
}

export default function OnboardingTaskModal({ isOpen, onClose, task, onSubmit }: OnboardingTaskModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [signatureName, setSignatureName] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      let submitData: any = { notes }

      if (task.taskType === 'document_upload') {
        if (!file) {
          toast.error('Please select a file to upload')
          return
        }
        // In a real app, you'd upload the file first
        submitData.fileName = file.name
        submitData.fileSize = file.size
      }

      if (task.taskType === 'acknowledgment' && !acknowledged) {
        toast.error('Please acknowledge to continue')
        return
      }
      submitData.acknowledged = acknowledged

      if (task.taskType === 'e_sign') {
        if (!signatureName.trim()) {
          toast.error('Please enter your name to sign')
          return
        }
        submitData.signatureName = signatureName
        submitData.signedAt = new Date().toISOString()
      }

      await onSubmit(task.id, submitData)
      onClose()
    } catch (error: any) {
      console.error('Task submission error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getTaskIcon = () => {
    switch (task.taskType) {
      case 'document_upload': return <Upload className="h-5 w-5 text-cyan-400" />
      case 'form_fill': return <FileText className="h-5 w-5 text-purple-400" />
      case 'e_sign': return <PenTool className="h-5 w-5 text-green-400" />
      case 'acknowledgment': return <CheckCircle className="h-5 w-5 text-orange-400" />
      default: return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  const renderTaskContent = () => {
    switch (task.taskType) {
      case 'document_upload':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-10 w-10 text-gray-500 mx-auto mb-3" />
                {file ? (
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-white">Click to upload</p>
                    <p className="text-sm text-gray-400">PDF, DOC, or image files</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        )

      case 'acknowledgment':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-gray-300">{task.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acknowledge"
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
              />
              <label htmlFor="acknowledge" className="text-sm text-gray-300 cursor-pointer">
                I acknowledge and understand the above information
              </label>
            </div>
          </div>
        )

      case 'e_sign':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-gray-300 text-sm">{task.description}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signature" className="text-gray-300">Type your full legal name to sign</Label>
              <Input
                id="signature"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="bg-white/5 border-white/20 text-white text-lg font-signature"
                placeholder="Your full name"
              />
              <p className="text-xs text-gray-500">
                By typing your name, you agree this constitutes your electronic signature
              </p>
            </div>
          </div>
        )

      case 'form_fill':
      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white/5 border-white/20 text-white min-h-[120px]"
                placeholder="Enter any additional information..."
              />
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0B0B0D] border-cyan-500/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {getTaskIcon()}
            {task.title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {task.jobTitle} at {task.company}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderTaskContent()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
