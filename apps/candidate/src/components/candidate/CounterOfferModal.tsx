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
import { Loader2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

interface CounterOfferModalProps {
  offer: {
    id: string
    jobTitle: string
    company: string
    salaryOffered: number
    currency: string
    salaryType: string
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CounterOfferModal({ offer, isOpen, onClose, onSuccess }: CounterOfferModalProps) {
  const { session } = useAuth()
  const [requestedSalary, setRequestedSalary] = useState(offer.salaryOffered.toString())
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!session?.access_token) return

    const salary = parseFloat(requestedSalary)
    if (isNaN(salary) || salary <= 0) {
      toast.error('Please enter a valid salary amount')
      return
    }

    if (salary <= offer.salaryOffered) {
      toast.error('Counter offer must be higher than the original offer')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/candidate/offers/${offer.id}/counter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          requestedSalary: salary,
          requestedCurrency: offer.currency,
          candidateMessage: message || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit counter offer')
      }

      toast.success('Counter offer submitted! Waiting for employer response.')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit counter offer')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0B0B0D] border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            Make a Counter Offer
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Negotiate your salary for {offer.jobTitle} at {offer.company}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Current Offer</p>
            <p className="text-2xl font-bold text-white">
              {offer.currency} {offer.salaryOffered.toLocaleString()}
              <span className="text-sm font-normal text-gray-400">/{offer.salaryType}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary" className="text-gray-300">Your Counter Offer ({offer.currency})</Label>
            <Input
              id="salary"
              type="number"
              value={requestedSalary}
              onChange={(e) => setRequestedSalary(e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-300">Message to Employer (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-white/5 border-white/20 text-white min-h-[100px]"
              placeholder="Explain why you're requesting this amount..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Counter Offer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
