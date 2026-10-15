import { useState } from 'react'
import { data, getExtractedValuesForDoc } from '../data/dataHelpers'

const TYPE_LABELS = {
  w2: 'W-2',
  form_1099_b: '1099-B',
  form_1099_div: '1099-DIV',
  form_1099_int: '1099-INT',
  form_1099_r: '1099-R',
  form_1099_misc: '1099-MISC',
  form_1099_nec: '1099-NEC',
  k1_1065: 'K-1 (1065)',
  k1_1120s: 'K-1 (1120-S)',
  schedule_k1: 'K-1',
  prior_year_return: 'Prior Year Return',
  engagement_letter: 'Engagement Letter',
  consent_7216: 'Consent 7216',
  identity_document: 'ID Document',
  irs_ip_pin_notice: 'IRS IP PIN',
  brokerage_statement: 'Brokerage',
  crypto_statement: 'Crypto',
  foreign_account: 'Foreign Account',
  rental_closing: 'Rental Closing',
  depreciation_schedule: 'Depreciation',
  client_organizer: 'Organizer',
  gift_documentation: 'Gift Docs',
  retirement_statement: 'Retirement',
  college_expenses: 'College',
  business_summary: 'Business',
  mortgage_statement: 'Mortgage',
  property_tax: 'Property Tax',
  charitable_contribution: 'Charitable',
  medical_expenses: 'Medical',
}

function confidenceBadge(conf) {
  if (conf === undefined || conf === null) return null
  if (conf >= 0.95) return <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{Math.round(conf * 100)}%</span>
  if (conf >= 0.80) return <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">{Math.round(conf * 100)}%</span>
  return <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{Math.round(conf * 100)}%</span>
}

function DocDetail({ doc, onClose }) {
  const evs = getExtractedValuesForDoc(doc.id)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="bg-white w-2/3 h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-start justify-between">
          <div>
            <div className="font-bold text-lg">{doc.title}</div>
            <div className="text-xs text-gray-500 mt-0.5">{doc.id} · {doc.document_type} · {doc.file_name}</div>
            <div className="text-xs text-gray-400">Received {doc.received_at?.slice(0, 10)} · Uploaded by {doc.uploaded_by}</div>
            {doc.marked_corrected && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded mt-1 inline-block">CORRECTED</span>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        {/* Pages / printed content */}
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-sm mb-3">Document Content</h3>
          {doc.pages?.map(page => (
            <div key={page.page} className="mb-4 bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-2 font-medium">Page {page.page}</div>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">{page.printed_content}</div>
            </div>
          ))}
        </div>

        {/* Extracted values */}
        <div className="px-6 py-4">
          <h3 className="font-semibold text-sm mb-3">Extracted Values ({evs.length})</h3>
          {evs.length === 0 && <div className="text-sm text-gray-400">No extracted values for this document.</div>}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b">
                <th className="text-left py-1">Field</th>
                <th className="text-left py-1">Label</th>
                <th className="text-right py-1">Value</th>
                <th className="text-right py-1">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {evs.map(ev => (
                <tr key={ev.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-1.5 text-xs text-gray-400 font-mono">{ev.field}</td>
                  <td className="py-1.5 text-xs">{ev.label}</td>
                  <td className="py-1.5 text-right font-medium text-xs">
                    {ev.text_as_read || String(ev.value)}
                  </td>
                  <td className="py-1.5 text-right">{confidenceBadge(ev.confidence)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function Documents() {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const docs = data.documents

  const belongs = [...new Set(docs.map(d => d.belongs_to))]

  const filtered = docs.filter(doc => {
    const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.id.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || doc.belongs_to === filter
    return matchSearch && matchFilter
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Document Index</h1>
      <p className="text-sm text-gray-500 mb-6">{docs.length} documents · Click any row to view content and extracted values</p>

      {/* Controls */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All parties</option>
          {belongs.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b">
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Belongs To</th>
              <th className="text-left px-4 py-2">Received</th>
              <th className="text-right px-4 py-2">Values</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(doc => (
              <tr
                key={doc.id}
                onClick={() => setSelected(doc)}
                className="border-b last:border-0 hover:bg-blue-50 cursor-pointer"
              >
                <td className="px-4 py-2 font-mono text-xs text-gray-400">{doc.id}</td>
                <td className="px-4 py-2 font-medium">
                  {doc.title}
                  {doc.marked_corrected && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">CORRECTED</span>}
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">{TYPE_LABELS[doc.document_type] || doc.document_type}</td>
                <td className="px-4 py-2 text-xs text-gray-500">{doc.belongs_to}</td>
                <td className="px-4 py-2 text-xs text-gray-400">{doc.received_at?.slice(0, 10)}</td>
                <td className="px-4 py-2 text-right text-xs">{doc.extraction?.values ?? '—'}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    doc.extraction?.status === 'extracted' ? 'bg-green-100 text-green-700' :
                    doc.extraction?.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {doc.extraction?.status || 'unknown'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <DocDetail doc={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}