import { useState } from 'react'
import { data, currentVersion, formatCurrency } from '../data/dataHelpers'

function highlight(text, query) {
  if (!query || !text) return text
  const str = String(text)
  const idx = str.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return str
  return (
    <>
      {str.slice(0, idx)}
      <mark className="bg-yellow-200 rounded px-0.5">{str.slice(idx, idx + query.length)}</mark>
      {str.slice(idx + query.length)}
    </>
  )
}

function searchAll(query) {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  const results = []

  // Search documents
  data.documents.forEach(doc => {
    if (
      doc.title?.toLowerCase().includes(q) ||
      doc.id?.toLowerCase().includes(q) ||
      doc.document_type?.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'document',
        id: doc.id,
        title: doc.title,
        subtitle: `${doc.id} · ${doc.document_type} · ${doc.belongs_to}`,
        value: null,
        target: 'documents',
      })
    }

    // Search page content
    doc.pages?.forEach(page => {
      if (page.printed_content?.toLowerCase().includes(q)) {
        results.push({
          type: 'document_content',
          id: `${doc.id}-p${page.page}`,
          title: doc.title,
          subtitle: `${doc.id} · Page ${page.page}`,
          excerpt: page.printed_content,
          value: null,
          target: 'documents',
        })
      }
    })
  })

  // Search return lines
  currentVersion.lines.forEach(line => {
    if (
      line.label?.toLowerCase().includes(q) ||
      line.key?.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'return_line',
        id: line.key,
        title: line.label,
        subtitle: `${line.key} · ${line.form} · ${line.jurisdiction}`,
        value: line.value,
        target: 'return',
      })
    }
  })

  // Search extracted values
  data.extracted_values?.forEach(ev => {
    if (
      ev.label?.toLowerCase().includes(q) ||
      ev.field?.toLowerCase().includes(q) ||
      String(ev.value)?.toLowerCase().includes(q)
    ) {
      const doc = data.documents.find(d => d.id === ev.document_id)
      results.push({
        type: 'extracted_value',
        id: ev.id,
        title: ev.label,
        subtitle: `${ev.id} · ${doc?.title || ev.document_id} · ${ev.field}`,
        value: ev.value,
        target: 'documents',
      })
    }
  })

  // Search diagnostics
  currentVersion.diagnostics?.forEach(diag => {
    if (
      diag.message?.toLowerCase().includes(q) ||
      diag.code?.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'diagnostic',
        id: diag.code,
        title: diag.message,
        subtitle: `${diag.code} · ${diag.severity}`,
        value: null,
        target: 'diagnostics',
        severity: diag.severity,
      })
    }
  })

  // Search timeline
  data.timeline?.forEach(event => {
    if (
      event.detail?.toLowerCase().includes(q) ||
      event.event?.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'timeline',
        id: event.id,
        title: event.event.replace(/_/g, ' '),
        subtitle: `${event.id} · ${event.at?.slice(0, 10)}`,
        excerpt: event.detail,
        value: null,
        target: 'timeline',
      })
    }
  })

  // Search client questionnaire
  data.client?.questionnaire?.forEach(q2 => {
    if (
      q2.question?.toLowerCase().includes(q) ||
      q2.answer?.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'client_qa',
        id: q2.id,
        title: q2.question,
        subtitle: `${q2.id} · Answered by ${q2.answered_by}`,
        excerpt: q2.answer,
        value: null,
        target: 'client',
      })
    }
  })

  // Search client messages
  data.client?.messages?.forEach(msg => {
    if (msg.text?.toLowerCase().includes(q)) {
      results.push({
        type: 'client_message',
        id: msg.id,
        title: `Message from ${msg.from}`,
        subtitle: `${msg.id} · ${msg.sent_at?.slice(0, 10)}`,
        excerpt: msg.text,
        value: null,
        target: 'client',
      })
    }
  })

  return results.slice(0, 50)
}

const TYPE_CONFIG = {
  document: { label: 'Document', color: 'bg-blue-100 text-blue-700' },
  document_content: { label: 'Doc Content', color: 'bg-blue-50 text-blue-600' },
  return_line: { label: 'Return Line', color: 'bg-green-100 text-green-700' },
  extracted_value: { label: 'Extracted Value', color: 'bg-purple-100 text-purple-700' },
  diagnostic: { label: 'Diagnostic', color: 'bg-red-100 text-red-700' },
  timeline: { label: 'Timeline', color: 'bg-gray-100 text-gray-600' },
  client_qa: { label: 'Q&A', color: 'bg-teal-100 text-teal-700' },
  client_message: { label: 'Message', color: 'bg-teal-50 text-teal-600' },
}

function getExcerpt(text, query, maxLen = 200) {
  if (!text) return ''
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text.slice(0, maxLen)
  const start = Math.max(0, idx - 60)
  const end = Math.min(text.length, idx + query.length + 100)
  return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '')
}

export default function Search({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const results = searchAll(query)

  const types = ['all', ...new Set(results.map(r => r.type))]

  const filtered = filter === 'all' ? results : results.filter(r => r.type === filter)

  const counts = {}
  results.forEach(r => {
    counts[r.type] = (counts[r.type] || 0) + 1
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Search</h1>
      <p className="text-sm text-gray-500 mb-6">
        Search across the entire workpaper — documents, return lines, diagnostics, messages, and more.
      </p>

      {/* Search input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search documents, lines, values, messages..."
          className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 pl-12 text-base focus:outline-none"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Results count and filters */}
      {query.length >= 2 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-gray-500">
            {results.length} result{results.length !== 1 ? 's' : ''} for
            <span className="font-medium text-gray-800 ml-1">"{query}"</span>
          </span>
          <div className="flex gap-2 flex-wrap ml-2">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`text-xs px-3 py-1 rounded-full border ${
                  filter === t
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t === 'all' ? 'All' : TYPE_CONFIG[t]?.label || t}
                {t !== 'all' && counts[t] && (
                  <span className="ml-1 opacity-70">({counts[t]})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {query.length >= 2 && (
        <div className="space-y-2">
          {filtered.map((result, i) => {
            const cfg = TYPE_CONFIG[result.type] || { label: result.type, color: 'bg-gray-100 text-gray-600' }
            const excerpt = result.excerpt
              ? getExcerpt(result.excerpt, query)
              : null

            return (
              <div
                key={`${result.id}-${i}`}
                className="bg-white border rounded-xl px-5 py-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
                onClick={() => onNavigate && onNavigate(result.target)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {result.severity && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          result.severity === 'warning' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {result.severity}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 truncate">{result.subtitle}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      {highlight(result.title, query)}
                    </div>
                    {excerpt && (
                      <div className="text-xs text-gray-500 leading-relaxed">
                        {highlight(excerpt, query)}
                      </div>
                    )}
                  </div>
                  {result.value !== null && result.value !== undefined && typeof result.value === 'number' && (
                    <div className="text-sm font-bold text-gray-700 shrink-0">
                      {formatCurrency(result.value)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-12 bg-white rounded-xl border">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {query.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <div className="text-base font-medium mb-2">Search the entire workpaper</div>
          <div className="text-sm">
            Try searching for a document name, line key, dollar amount, or keyword
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {['W-2', 'capital gain', 'rental', 'basis', 'crypto', 'K-1', 'Sweden'].map(s => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {query.length === 1 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Type at least 2 characters to search
        </div>
      )}
    </div>
  )
}