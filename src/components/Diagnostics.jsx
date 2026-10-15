import { useState } from 'react'
import { getDiagnostics, currentVersion, formatCurrency, getDocument, getExtractedValue } from '../data/dataHelpers'

const SEVERITY_CONFIG = {
  warning: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: '⚠️', label: 'Warning' },
  info: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: 'ℹ️', label: 'Info' },
}

function resolveRef(ref) {
  if (!ref) return null
  if (ref.startsWith('ev-')) {
    const ev = getExtractedValue(ref)
    if (ev) {
      const doc = getDocument(ev.document_id)
      return { type: 'ev', ev, doc }
    }
  }
  if (ref.startsWith('D')) {
    const doc = getDocument(ref)
    if (doc) return { type: 'doc', doc }
  }
  return { type: 'other', ref }
}

function RefTag({ refStr }) {
  const resolved = resolveRef(refStr)
  if (!resolved) return <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{refStr}</span>

  if (resolved.type === 'ev') {
    return (
      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
        {refStr} · {resolved.doc?.id} · {resolved.ev.label} = {String(resolved.ev.value)}
      </span>
    )
  }
  if (resolved.type === 'doc') {
    return (
      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
        {resolved.doc.id} · {resolved.doc.title}
      </span>
    )
  }
  return <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{refStr}</span>
}

function DiagnosticCard({ diag }) {
  const [open, setOpen] = useState(false)
  const cfg = SEVERITY_CONFIG[diag.severity] || SEVERITY_CONFIG.info

  // Try to find the related line in the return
  const relatedLine = diag.refs
    ?.map(r => currentVersion.lines.find(l => l.key === r))
    .find(Boolean)

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} mb-3`}>
      <div
        className="px-5 py-4 cursor-pointer flex items-start justify-between gap-4"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-start gap-3 flex-1">
          <span className="text-lg mt-0.5">{cfg.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${cfg.badge}`}>{cfg.label}</span>
              <span className="font-mono text-xs text-gray-400">{diag.code}</span>
            </div>
            <div className="text-sm font-medium text-gray-800">{diag.message}</div>
          </div>
        </div>
        <span className="text-gray-400 text-sm shrink-0">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="px-5 pb-4 border-t border-dashed border-gray-200 pt-3">
          {/* Referenced lines */}
          {relatedLine && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1 font-medium">Related Return Line</div>
              <div className="bg-white rounded-lg border px-4 py-2 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-gray-400 mr-2">{relatedLine.key}</span>
                  <span className="text-sm">{relatedLine.label}</span>
                </div>
                <span className="font-bold text-sm">{formatCurrency(relatedLine.value)}</span>
              </div>
            </div>
          )}

          {/* All refs */}
          {diag.refs?.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2 font-medium">References</div>
              <div className="flex flex-wrap gap-2">
                {diag.refs.map((r, i) => <RefTag key={i} refStr={r} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Diagnostics() {
  const all = getDiagnostics()
  const [filter, setFilter] = useState('all')

  const warnings = all.filter(d => d.severity === 'warning')
  const infos = all.filter(d => d.severity === 'info')

  const shown = filter === 'all' ? all : all.filter(d => d.severity === filter)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Diagnostics & Errors</h1>
      <p className="text-sm text-gray-500 mb-6">
        Issues flagged by the extraction pipeline and engine. Click any card to expand.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-600">{warnings.length}</div>
          <div className="text-sm text-red-700">Warnings</div>
          <div className="text-xs text-red-500 mt-1">Require review before filing</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-600">{infos.length}</div>
          <div className="text-sm text-yellow-700">Info</div>
          <div className="text-xs text-yellow-500 mt-1">Notable items to consider</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-700">{all.length}</div>
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-xs text-gray-400 mt-1">Across all areas</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {['all', 'warning', 'info'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-4 py-1.5 rounded-lg border ${filter === f ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            {f === 'all' ? 'All' : f === 'warning' ? 'Warnings' : 'Info'} ({f === 'all' ? all.length : f === 'warning' ? warnings.length : infos.length})
          </button>
        ))}
      </div>

      {/* Cards */}
      <div>
        {shown.map((diag, i) => (
          <DiagnosticCard key={i} diag={diag} />
        ))}
        {shown.length === 0 && (
          <div className="text-center text-gray-400 py-12">No diagnostics in this category.</div>
        )}
      </div>
    </div>
  )
}