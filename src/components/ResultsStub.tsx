import React from 'react'
import { GachaIntent } from '../types/quickPicker'
import { buildFalRequest } from '../services/falPayload'

export function ResultsStub({ intent, onBack }: { intent: GachaIntent; onBack: () => void }) {
  const falPayload = buildFalRequest(intent)
  const json = JSON.stringify(falPayload, null, 2)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(json)
    } catch {}
  }

  const downloadJson = () => {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fal-request.json'
    a.click()
    URL.revokeObjectURL(url)
  }
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
      <div className="mt-4 rounded-2xl shadow-sm p-4 bg-white border">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">Fal request payload</div>
          <div className="flex gap-2">
            <button className="text-sm text-blue-600" onClick={copyToClipboard}>Copy</button>
            <button className="text-sm text-blue-600" onClick={downloadJson}>Download</button>
          </div>
        </div>
        <pre className="text-xs whitespace-pre-wrap break-all">{json}</pre>
      </div>
      <div className="mt-4 text-sm text-gray-500">This is a stub. Next step: call your LLM service with this payload.</div>
    </div>
  )
}

