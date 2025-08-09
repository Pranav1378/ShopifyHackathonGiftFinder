/**
 * Recipient Profile Form Component
 * Mobile-optimized form for capturing recipient details
 */

import React, { useState } from 'react'
import { ProfileFormProps, RecipientProfile } from '../types/giftFinder'

const RELATIONSHIP_OPTIONS = [
  { value: 'partner', label: '💕 Partner' },
  { value: 'parent', label: '👨‍👩‍👧‍👦 Parent' },
  { value: 'sibling', label: '👫 Sibling' },
  { value: 'friend', label: '👯 Friend' },
  { value: 'coworker', label: '💼 Coworker' },
  { value: 'other', label: '🎭 Other' },
]

const AGE_RANGE_OPTIONS = [
  { value: 'teen', label: '👶 Teen' },
  { value: '20s', label: '🎓 20s' },
  { value: '30s', label: '💼 30s' },
  { value: '40s', label: '🏠 40s' },
  { value: '50s', label: '🎯 50s' },
  { value: '60plus', label: '🎖️ 60+' },
]

const GENDER_OPTIONS = [
  { value: 'masc', label: 'Masculine' },
  { value: 'fem', label: 'Feminine' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'unknown', label: 'Prefer not to say' },
]

const COMMON_INTERESTS = [
  'tea', 'coffee', 'reading', 'cooking', 'fitness', 'music', 'art', 'travel',
  'tech gadgets', 'skincare', 'home decor', 'plants', 'pets', 'wine',
  'photography', 'gaming', 'yoga', 'jewelry', 'fashion', 'wellness'
]

const COMMON_STYLES = [
  'minimal', 'boho', 'modern', 'vintage', 'streetwear', 'classic',
  'earthy', 'luxe', 'casual', 'edgy', 'romantic', 'preppy'
]

const CLIMATE_OPTIONS = [
  { value: 'cold', label: '❄️ Cold' },
  { value: 'temperate', label: '🌤️ Temperate' },
  { value: 'hot', label: '☀️ Hot' },
  { value: 'mixed', label: '🌦️ Mixed' },
  { value: 'unknown', label: '❓ Unknown' },
]

export function ProfileForm({ profile, onChange }: ProfileFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateProfile = (updates: Partial<RecipientProfile>) => {
    onChange({ ...profile, ...updates })
  }

  const toggleArrayItem = (array: string[] = [], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item]
  }

  const handleInterestToggle = (interest: string) => {
    updateProfile({
      interests: toggleArrayItem(profile.interests, interest)
    })
  }

  const handleStyleToggle = (style: string) => {
    updateProfile({
      style: toggleArrayItem(profile.style, style)
    })
  }

  const handleDislikeAdd = (dislike: string) => {
    if (dislike.trim() && !profile.dislikes?.includes(dislike.trim())) {
      updateProfile({
        dislikes: [...(profile.dislikes || []), dislike.trim()]
      })
    }
  }

  const handleDislikeRemove = (dislike: string) => {
    updateProfile({
      dislikes: profile.dislikes?.filter(d => d !== dislike)
    })
  }

  return (
    <div className="profile-form space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4">
        {/* Relationship */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship to recipient
          </label>
          <div className="grid grid-cols-2 gap-2">
            {RELATIONSHIP_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateProfile({ relationship: option.value as any })}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  profile.relationship === option.value
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age range
          </label>
          <div className="grid grid-cols-3 gap-2">
            {AGE_RANGE_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateProfile({ ageRange: option.value as any })}
                className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                  profile.ageRange === option.value
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interests & hobbies
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_INTERESTS.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => handleInterestToggle(interest)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                profile.interests?.includes(interest)
                  ? 'bg-green-100 border border-green-500 text-green-700'
                  : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select all that apply to help us find relevant gifts
        </p>
      </div>

      {/* Style Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Style preferences
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_STYLES.map(style => (
            <button
              key={style}
              type="button"
              onClick={() => handleStyleToggle(style)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                profile.style?.includes(style)
                  ? 'bg-purple-100 border border-purple-500 text-purple-700'
                  : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        {showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Options
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 border-t pt-4">
          {/* Gender Presentation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender presentation (optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GENDER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateProfile({ genderPresentation: option.value as any })}
                  className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                    profile.genderPresentation === option.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Climate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location climate
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CLIMATE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateProfile({ locationClimate: option.value as any })}
                  className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                    profile.locationClimate === option.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dislikes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dislikes & things to avoid
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.dislikes?.map(dislike => (
                <span
                  key={dislike}
                  className="bg-red-100 border border-red-500 text-red-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                >
                  {dislike}
                  <button
                    type="button"
                    onClick={() => handleDislikeRemove(dislike)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add something to avoid (press Enter)"
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleDislikeAdd(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }}
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional notes
            </label>
            <textarea
              value={profile.notes || ''}
              onChange={(e) => updateProfile({ notes: e.target.value })}
              placeholder="Any other details that might help..."
              className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileForm
