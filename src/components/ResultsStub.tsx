import React, { useEffect, useMemo, useState } from 'react'
import { GachaIntent } from '../types/quickPicker'
import { buildFalRequest } from '../services/falPayload'
import { callFal } from '../services/falClient'

export function ResultsStub({ intent, onBack }: { intent: GachaIntent; onBack: () => void }) {
  const payload = useMemo(() => buildFalRequest(intent), [intent])
  const [output, setOutput] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await callFal(payload)
        if (!mounted) return
        setOutput(res)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message ?? 'Fal call failed')
      }
    })()
    return () => { mounted = false }
  }, [payload])

  const copy = async () => {
    try { await navigator.clipboard.writeText(output) } catch {}
  }

  const download = () => {
    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gacha-output.json'
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
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">Output JSON</div>
          <div className="flex gap-2">
            <button className="text-sm text-blue-600" onClick={copy}>Copy</button>
            <button className="text-sm text-blue-600" onClick={download}>Download</button>
          </div>
        </div>
        {error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <pre className="text-xs whitespace-pre-wrap break-all">{output || '{\n  "status": "loading..."\n}'}</pre>
        )}
      </div>
    </div>
  )
}

