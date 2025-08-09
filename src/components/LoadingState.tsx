/**
 * Loading State Component
 * Shows progress and status during bundle generation
 */

import React, { useState, useEffect } from 'react'

const LOADING_STEPS = [
  'Analyzing gift preferences...',
  'Searching product catalog...',
  'Assembling gift bundles...',
  'Calculating best options...',
  'Adding finishing touches...',
]

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1000)

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) {
          return prev + Math.random() * 10
        }
        return prev
      })
    }, 300)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="loading-state bg-white rounded-lg shadow-sm border p-8 text-center">
      {/* Loading animation */}
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4">
          <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2 font-['Suisse_Intl']">
          🎁 Creating Your Perfect Gifts
        </h2>
        
        <p className="text-gray-600 mb-6">
          {LOADING_STEPS[currentStep]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>

      <p className="text-sm text-gray-500">
        This usually takes 5-10 seconds...
      </p>

      {/* Decorative elements */}
      <div className="flex justify-center gap-4 mt-8 text-2xl">
        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🎁</span>
        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>✨</span>
        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>🎉</span>
      </div>
    </div>
  )
}

export default LoadingState
