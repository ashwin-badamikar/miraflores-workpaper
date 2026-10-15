import { useState } from 'react'
import { currentVersion, formatCurrency, resolveLineSources, getDocument } from '../data/dataHelpers'

const FORMS = [...new Set(currentVersion.lines.map(l => l.form))].sort()

function SourcePanel({ line, onClose }) {
  const sources = resolveLineSources(line)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="bg-white w-2/3 h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-400 font-mono mb-1">{line.key}</div>
            <div className="font-bold text-lg">{line.label}</div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(line.value)}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        {/* How it was built */}
        {line.inputs?.length > 0 && (
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-sm mb-3">Built From (Inputs)</h3>
            <div className="space-y-2">
              {line.inputs.map(inputKey => {
                const inputLine = currentVersion.lines.find(l => l.key === inputKey)
                return (
                  <div key={inputKey} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                    <div>
                      <span className="font-mono text-xs text-gray-400 mr-2">{inputKey}</span>
                      <span className="text-sm">{inputLine?.label || inputKey}</span>
                    </div>
                    <span className="font-medium text-sm">{formatCurrency(inputLine?.value)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Rule */}
        {line.rule && (
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-sm mb-1">Rule Applied</h3>
            <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{line.rule}</span>
            {line.note && <p className="text-sm text-gray-600 mt-2">{line.note}</p>}
          </div>
        )}

        {/* Source documents */}
        <div className="px-6 py-4">
          <h3 className="font-semibold text-sm mb-3">Source Documents ({sources.length})</h3>
          {sources.length === 0 && (
            <div className="text-sm text-gray-400">No direct document sources. Value derived from inputs above.</div>
          )}
          <div className="space-y-3">
            {sources.map((src, i) => {
              if (src.type === 'extracted_value') {
                const { ev, doc } = src
                return (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs text-gray-400 mr-2">{doc?.id}</span>
                        <span className="font-medium text-sm">{doc?.title}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        ev.confidence >= 0.95 ? 'bg-green-100 text-green-700' :
                        ev.confidence >= 0.80 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {Math.round(ev.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <div className="text-xs text-gray-400 mb-1">Extracted value <span className="font-mono">{ev.id}</span></div>
                      <div className="text-sm"><span className="text-gray-500">Field:</span> <span className="font-medium">{ev.field}</span></div>
                      <div className="text-sm"><span className="text-gray-500">Label:</span> {ev.label}</div>
                      <div className="text-sm"><span className="text-gray-500">As read:</span> <span className="font-mono">{ev.text_as_read || '(empty)'}</span></div>
                      <div className="text-sm"><span className="text-gray-500">Value used:</span> <span className="font-bold">{String(ev.value)}</span></div>
                      <div className="text-sm"><span className="text-gray-500">Page:</span> {ev.page}</div>

                      {/* Show the page content where this value came from */}
                      {doc && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                          <div className="text-xs text-yellow-700 font-medium mb-1">Source document page {ev.page}</div>
                          <div className="text-xs text-gray-600 font-mono leading-relaxed whitespace-pre-wrap">
                            {doc.pages?.find(p => p.page === ev.page)?.printed_content || 'Page content not available'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
              if (src.type === 'prior_year') {
                return (
                  <div key={i} className="border rounded-lg px-4 py-3 bg-purple-50">
                    <div className="text-xs text-purple-600 font-medium mb-1">Prior Year Reference</div>
                    <div className="font-mono text-xs text-gray-600">{src.ref}</div>
                  </div>
                )
              }
              if (src.type === 'agency') {
                return (
                  <div key={i} className="border rounded-lg px-4 py-3 bg-blue-50">
                    <div className="text-xs text-blue-600 font-medium mb-1">Tax Agency Record</div>
                    <div className="font-mono text-xs text-gray-600">{src.ref}</div>
                  </div>
                )
              }
              return (
                <div key={i} className="border rounded-lg px-4 py-3 bg-gray-50">
                  <div className="font-mono text-xs text-gray-500">{src.ref}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReturnLines() {
  const [selectedForm, setSelectedForm] = useState('F1040')
  const [selectedLine, setSelectedLine] = useState(null)
  const [search, setSearch] = useState('')
  const [jurisdiction, setJurisdiction] = useState('federal')

  const lines = currentVersion.lines.filter(l => {
    const matchForm = l.form === selectedForm
    const matchJurisdiction = l.jurisdiction === jurisdiction
    const matchSearch = search === '' ||
      l.label?.toLowerCase().includes(search.toLowerCase()) ||
      l.key?.toLowerCase().includes(search.toLowerCase())
    return matchForm && matchJurisdiction && matchSearch
  })

  const forms = [...new Set(currentVersion.lines
    .filter(l => l.jurisdiction === jurisdiction)
    .map(l => l.form))].sort()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Return Lines</h1>
      <p className="text-sm text-gray-500 mb-6">Click any line to trace it to its source documents</p>

      {/* Controls */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex rounded-lg border overflow-hidden">
          {['federal', 'california'].map(j => (
            <button
              key={j}
              onClick={() => { setJurisdiction(j); setSelectedForm(j === 'federal' ? 'F1040' : 'F540NR') }}
              className={`px-4 py-2 text-sm ${jurisdiction === j ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {j === 'federal' ? 'Federal' : 'California'}
            </button>
          ))}
        </div>

        <select
          value={selectedForm}
          onChange={e => setSelectedForm(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {forms.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <input
          type="text"
          placeholder="Search lines..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lines table */}
      <div className="bg-white rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b">
              <th className="text-left px-4 py-2">Key</th>
              <th className="text-left px-4 py-2">Label</th>
              <th className="text-right px-4 py-2">Value</th>
              <th className="text-right px-4 py-2">Sources</th>
              <th className="text-left px-4 py-2">Rule</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(line => (
              <tr
                key={line.key}
                onClick={() => setSelectedLine(line)}
                className="border-b last:border-0 hover:bg-blue-50 cursor-pointer"
              >
                <td className="px-4 py-2 font-mono text-xs text-gray-400">{line.key}</td>
                <td className="px-4 py-2">{line.label}</td>
                <td className="px-4 py-2 text-right font-medium">
                  {typeof line.value === 'number' ? formatCurrency(line.value) : String(line.value ?? '—')}
                </td>
                <td className="px-4 py-2 text-right">
                  {line.sources?.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{line.sources.length}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <span className="text-xs text-gray-400 font-mono">{line.rule}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lines.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">No lines found for this form.</div>
        )}
      </div>

      {selectedLine && <SourcePanel line={selectedLine} onClose={() => setSelectedLine(null)} />}
    </div>
  )
}