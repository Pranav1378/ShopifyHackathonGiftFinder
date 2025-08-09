/**
 * Empty State Component
 * Shown when no gift bundles can be generated
 */

import React from 'react'

interface EmptyStateProps {
  onRetry: () => void
  onEditPreferences: () => void
  budget: number
}

export function EmptyState({ onRetry, onEditPreferences, budget }: EmptyStateProps) {
  const suggestions = [
    `Try increasing your budget to $${Math.ceil(budget * 1.3)}`,
    'Remove some specific dislikes or constraints',
    'Broaden the gift description to include more options',
    'Try different interests or style preferences',
  ]

  return (
    <div className="empty-state bg-white rounded-lg shadow-sm border p-8 text-center">
      {/* Empty state illustration */}
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
          🤔
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2 font-['Suisse_Intl']">
          No Perfect Matches Found
        </h2>
        
        <p className="text-gray-600 mb-6">
          We couldn't find gift bundles that match all your criteria. Let's try a different approach!
        </p>
      </div>

      {/* Suggestions */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          💡 Suggestions to find great gifts:
        </h3>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left"
            >
              <span className="text-blue-700 text-sm">{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onRetry}
          className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          🔄 Try Again with Relaxed Constraints
        </button>
        
        <button
          onClick={onEditPreferences}
          className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          ✏️ Edit Preferences & Budget
        </button>
      </div>

      {/* Additional help */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>💭 Tip:</strong> The more specific your requirements, the harder it is to find matches. 
          Try starting with broader preferences and then narrowing down from the results.
        </p>
      </div>
    </div>
  )
}

export default EmptyState
