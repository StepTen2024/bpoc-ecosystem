'use client'

import { useState, useCallback } from 'react'
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
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Loader2, Upload, FileText, CheckCircle, PenTool, User, 
  CreditCard, GraduationCap, HeartPulse, Shield, Phone,
  Sparkles, AlertCircle, Check
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

interface OnboardingTask {
  id: string
  applicationId: string
  jobTitle: string
  company: string
  taskType: string
  title: string
  description?: string
  isRequired: boolean
  status: string
  icon?: string
}

interface ExtractedData {
  [key: string]: any
}

interface OnboardingWizardModalProps {
  isOpen: boolean
  onClose: () => void
  task: OnboardingTask
  onboardingId: string
  onComplete: () => void
}

// Map task types to document types for AI processing
const TASK_TO_DOC_TYPE: Record<string, string> = {
  'personal_info': 'valid_id',
  'gov_id': 'gov_id',
  'education': 'education',
  'medical': 'medical',
}

export default function OnboardingWizardModal({ 
  isOpen, 
  onClose, 
  task, 
  onboardingId,
  onComplete 
}: OnboardingWizardModalProps) {
  const { session } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [signatureName, setSignatureName] = useState('')
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    relationship: '',
    phone: '',
  })

  const taskKey = task.id.split('-').pop() || ''
  const docType = TASK_TO_DOC_TYPE[taskKey]
  const canProcessWithAI = !!docType

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setExtractedData(null)
    }
  }, [])

  const handleProcessDocument = async () => {
    if (!file || !session?.access_token) return

    setProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('docType', docType)
      formData.append('onboardingId', onboardingId)

      const response = await fetch('/api/candidate/onboarding/process-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setExtractedData(data.extractedData)
        toast.success('Document processed! Please verify the extracted information.')
      } else {
        toast.error(data.error || 'Failed to process document')
      }
    } catch (error) {
      console.error('Processing error:', error)
      toast.error('Failed to process document')
    } finally {
      setProcessing(false)
    }
  }

  const handleSubmit = async () => {
    if (!session?.access_token) return

    setUploading(true)
    try {
      // Build update payload based on task type
      let updateData: Record<string, any> = {}
      let statusField = `${taskKey}_status`

      if (taskKey === 'data_privacy') {
        if (!acknowledged) {
          toast.error('Please acknowledge the data privacy agreement')
          return
        }
        updateData = {
          accepts_data_privacy: true,
          data_privacy_signed_at: new Date().toISOString(),
        }
      } else if (taskKey === 'signature') {
        if (!signatureName.trim()) {
          toast.error('Please type your name to sign')
          return
        }
        updateData = {
          signature_date: new Date().toISOString(),
        }
      } else if (taskKey === 'emergency_contact') {
        if (!emergencyContact.name || !emergencyContact.phone) {
          toast.error('Please fill in emergency contact details')
          return
        }
        updateData = {
          emergency_contact_name: emergencyContact.name,
          emergency_contact_relationship: emergencyContact.relationship,
          emergency_contact_phone: emergencyContact.phone,
        }
      } else if (extractedData) {
        // For document-based tasks, data was already saved during processing
        // Just need to update status
      }

      // Update the status to submitted
      updateData[statusField] = 'submitted'

      const response = await fetch(`/api/candidate/onboarding/${onboardingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast.success('Task submitted for review!')
        onComplete()
        onClose()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to submit task')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit task')
    } finally {
      setUploading(false)
    }
  }

  const getTaskIcon = () => {
    const iconClass = "h-5 w-5"
    switch (taskKey) {
      case 'personal_info': return <User className={`${iconClass} text-blue-400`} />
      case 'gov_id': return <CreditCard className={`${iconClass} text-yellow-400`} />
      case 'education': return <GraduationCap className={`${iconClass} text-purple-400`} />
      case 'medical': return <HeartPulse className={`${iconClass} text-red-400`} />
      case 'data_privacy': return <Shield className={`${iconClass} text-green-400`} />
      case 'resume': return <FileText className={`${iconClass} text-cyan-400`} />
      case 'signature': return <PenTool className={`${iconClass} text-orange-400`} />
      case 'emergency_contact': return <Phone className={`${iconClass} text-pink-400`} />
      default: return <FileText className={`${iconClass} text-gray-400`} />
    }
  }

  const renderDocumentUpload = () => (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-cyan-500/50 transition-colors">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
          {file ? (
            <div>
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-white">Click to upload document</p>
              <p className="text-sm text-gray-400">Image or PDF</p>
            </div>
          )}
        </label>
      </div>

      {/* AI Process Button */}
      {file && canProcessWithAI && !extractedData && (
        <Button
          onClick={handleProcessDocument}
          disabled={processing}
          className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              AI Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Extract with AI
            </>
          )}
        </Button>
      )}

      {/* Extracted Data Display */}
      {extractedData && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Check className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-medium">Data Extracted</span>
          </div>
          <div className="space-y-2 text-sm">
            {Object.entries(extractedData).map(([key, value]) => (
              value && (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-white">{String(value)}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderDataPrivacy = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 max-h-48 overflow-y-auto">
        <p className="text-gray-300 text-sm leading-relaxed">
          I hereby consent to the collection, processing, and storage of my personal data 
          in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173) and its 
          Implementing Rules and Regulations. I understand that my data will be used for 
          employment purposes, including but not limited to payroll processing, government 
          compliance, and HR management. I have been informed of my rights as a data subject 
          and acknowledge that I may withdraw my consent at any time.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="acknowledge"
          checked={acknowledged}
          onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
        />
        <label htmlFor="acknowledge" className="text-sm text-gray-300 cursor-pointer">
          I have read and agree to the Data Privacy Agreement
        </label>
      </div>
    </div>
  )

  const renderSignature = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
        <p className="text-gray-300 text-sm">
          By typing your full legal name below, you certify that all information provided 
          is true and accurate, and you agree to the terms of employment.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signature" className="text-gray-300">Type your full legal name</Label>
        <Input
          id="signature"
          value={signatureName}
          onChange={(e) => setSignatureName(e.target.value)}
          className="bg-white/5 border-white/20 text-white text-xl font-serif italic"
          placeholder="Juan Dela Cruz"
        />
      </div>
    </div>
  )

  const renderEmergencyContact = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-gray-300">Contact Name</Label>
        <Input
          value={emergencyContact.name}
          onChange={(e) => setEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
          className="bg-white/5 border-white/20 text-white"
          placeholder="Full name"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-300">Relationship</Label>
        <Input
          value={emergencyContact.relationship}
          onChange={(e) => setEmergencyContact(prev => ({ ...prev, relationship: e.target.value }))}
          className="bg-white/5 border-white/20 text-white"
          placeholder="e.g., Spouse, Parent, Sibling"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-300">Phone Number</Label>
        <Input
          value={emergencyContact.phone}
          onChange={(e) => setEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
          className="bg-white/5 border-white/20 text-white"
          placeholder="+63 XXX XXX XXXX"
        />
      </div>
    </div>
  )

  const renderContent = () => {
    switch (taskKey) {
      case 'personal_info':
      case 'gov_id':
      case 'education':
      case 'medical':
      case 'resume':
        return renderDocumentUpload()
      case 'data_privacy':
        return renderDataPrivacy()
      case 'signature':
        return renderSignature()
      case 'emergency_contact':
        return renderEmergencyContact()
      default:
        return renderDocumentUpload()
    }
  }

  const canSubmit = () => {
    if (taskKey === 'data_privacy') return acknowledged
    if (taskKey === 'signature') return signatureName.trim().length > 0
    if (taskKey === 'emergency_contact') return emergencyContact.name && emergencyContact.phone
    if (canProcessWithAI) return !!extractedData
    return !!file
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
            {task.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderContent()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploading || !canSubmit()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit for Review'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
