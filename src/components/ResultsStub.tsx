import React from 'react'
import { GachaIntent } from '../types/quickPicker'

export function ResultsStub({ intent, onBack }: { intent: GachaIntent; onBack: () => void }) {
  return (
    <div className="pt-4 pb-6 px-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Results</h2>
        <button className="text-sm text-blue-600" onClick={onBack}>Back</button>
      </div>
      <div className="rounded-2xl shadow-sm p-4 bg-white border">
        <div className="text-sm text-gray-600 mb-2">Submitted intent</div>
        <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(intent, null, 2)}</pre>
      </div>
      <div className="mt-4 text-sm text-gray-500">This is a stub. Next step: call your LLM service with this payload.</div>
    </div>
  )
}

