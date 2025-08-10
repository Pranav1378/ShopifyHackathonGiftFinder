import React, { useState } from 'react'
import { RecipientProfile, GachaIntent } from '../types/quickPicker'
import { RecipientScreen } from './quick/RecipientScreen'
import { DetailsScreen } from './quick/DetailsScreen'
import { useProfiles } from '../services/useProfiles'

type Step = 'recipient' | 'details'

export function QuickGiftPicker({ onSubmit }: { onSubmit: (intent: GachaIntent) => void }) {
  const [step, setStep] = useState<Step>('recipient')
  const [profile, setProfile] = useState<RecipientProfile | null>(null)
  const { setLastUsed } = useProfiles()

  const handleRecipientContinue = async (p: RecipientProfile) => {
    console.info('ui_recipient_selected', { profileId: p.id })
    await setLastUsed({ profileId: p.id })
    setProfile(p)
    setStep('details')
  }

  if (step === 'recipient') {
    return (
      <RecipientScreen
        onContinue={handleRecipientContinue}
        onManageProfiles={() => {
          // Stub: navigate to /profiles via parent app routing if available
          console.info('navigate', { route: '/profiles' })
        }}
      />
    )
  }

  return (
    <DetailsScreen
      profile={profile as RecipientProfile}
      onSpin={(intent) => {
        onSubmit(intent)
      }}
      onRefine={() => console.info('refine_after_results')}
    />
  )
}

