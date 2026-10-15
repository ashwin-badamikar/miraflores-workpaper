import { data, getDocument } from '../data/dataHelpers'

function formatCurrency(val) {
  if (val === null || val === undefined) return '—'
  if (val === 0) return '$0'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

function K1Card({ title, docId, data: k1data, type }) {
  const doc = getDocument(docId)

  return (
    <div className="bg-white border rounded-xl overflow-hidden mb-6">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-gray-50 flex items-start justify-between">
        <div>
          <div className="font-bold text-base">{title}</div>
          {doc && (
            <div className="text-xs text-gray-400 mt-0.5">
              {doc.id} · {doc.title} · Received {doc.received_at?.slice(0, 10)}
            </div>
          )}
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
            {type}
          </span>
        </div>
        {doc?.marked_corrected && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">CORRECTED</span>
        )}
      </div>

      {/* K-1 lines */}
      <div className="divide-y">
        {Object.entries(k1data || {}).map(([key, val]) => {
          if (typeof val === 'object' && val !== null) {
            return (
              <div key={key} className="px-5 py-2">
                <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{key}</div>
                <div className="pl-3 divide-y border-l-2 border-gray-100">
                  {Object.entries(val).map(([subkey, subval]) => (
                    <div key={subkey} className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-gray-600">{subkey}</span>
                      <span className="text-xs font-medium">
                        {typeof subval === 'number' ? formatCurrency(subval) : String(subval)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
          return (
            <div key={key} className="px-5 py-2 flex items-center justify-between">
              <span className="text-sm text-gray-700">{key}</span>
              <span className="text-sm font-medium">
                {typeof val === 'number' ? formatCurrency(val) : String(val ?? '—')}
              </span>
            </div>
          )
        })}
      </div>

      {/* Document content preview */}
      {doc && (
        <div className="border-t px-5 py-4 bg-gray-50">
          <div className="text-xs font-medium text-gray-500 mb-2">Source Document</div>
          {doc.pages?.slice(0, 2).map(page => (
            <div key={page.page} className="mb-2">
              <div className="text-xs text-gray-400 mb-1">Page {page.page}</div>
              <div className="text-xs font-mono text-gray-600 bg-white border rounded p-3 leading-relaxed whitespace-pre-wrap">
                {page.printed_content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function K1Detail() {
  const priorYear = data.prior_years
  const k1_1120s = priorYear?.return_2024?.K1_1120S
  const k1_1065 = priorYear?.return_2024?.K1_1065

  // Find current year K-1 documents
  const k1Docs = data.documents.filter(d =>
    d.document_type === 'k1_1065' ||
    d.document_type === 'k1_1120s' ||
    d.document_type === 'schedule_k1' ||
    d.title?.toLowerCase().includes('k-1')
  )

  // Group by entity
  const ridgeline = k1Docs.filter(d =>
    d.title?.toLowerCase().includes('ridgeline') ||
    d.title?.toLowerCase().includes('1065')
  )

  const lindqvist = k1Docs.filter(d =>
    d.title?.toLowerCase().includes('lindqvist') ||
    d.title?.toLowerCase().includes('1120')
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">K-1 Detail</h1>
      <p className="text-sm text-gray-500 mb-6">
        Pass-through income, losses, and credits from partnerships and S corporations.
      </p>

      {/* Related returns notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6">
        <div className="text-sm font-medium text-blue-700 mb-2">Related Returns</div>
        <div className="space-y-1">
          {data.household.related_returns?.map((r, i) => (
            <div key={i} className="text-xs text-blue-600">
              <span className="font-medium">{r.who}</span> · {r.return} · Prepared by {r.prepared_by}
              {!r.in_this_packet && <span className="ml-2 bg-blue-100 px-1.5 py-0.5 rounded">K-1s only</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Ridgeline Real Estate Fund */}
      <h2 className="text-lg font-bold mb-3">Ridgeline Real Estate Fund III LP</h2>
      <div className="text-xs text-gray-500 mb-3">Form 1065 · Partnership · Arizona composite return</div>
      {ridgeline.length > 0 ? (
        ridgeline.map(doc => (
          <K1Card
            key={doc.id}
            title={doc.title}
            docId={doc.id}
            data={k1_1065}
            type="Partnership (1065)"
          />
        ))
      ) : (
        <div className="bg-white border rounded-xl px-5 py-6 text-sm text-gray-400 mb-6">
          No Ridgeline K-1 documents found. Check document index for D37 and D38.
        </div>
      )}

      {/* Lindqvist Family Woodworks */}
      <h2 className="text-lg font-bold mb-3">Lindqvist Family Woodworks, Inc.</h2>
      <div className="text-xs text-gray-500 mb-3">Form 1120-S · S Corporation · Oregon composite return</div>
      {lindqvist.length > 0 ? (
        lindqvist.map(doc => (
          <K1Card
            key={doc.id}
            title={doc.title}
            docId={doc.id}
            data={k1_1120s}
            type="S Corporation (1120-S)"
          />
        ))
      ) : (
        <div className="bg-white border rounded-xl px-5 py-6 text-sm text-gray-400 mb-6">
          No Lindqvist K-1 documents found. Check document index for D39 and D40.
        </div>
      )}

      {/* Basis warning */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 mt-2">
        <div className="text-sm font-medium text-orange-700 mb-1">S Corporation Basis Gap</div>
        <div className="text-xs text-orange-600 leading-relaxed">
          Lindqvist Family Woodworks basis records have gaps from prior years.
          Beginning stock basis of $2,300 may be understated.
          Distributions of $42,000 exceed available basis of $20,785,
          resulting in $21,215 treated as capital gain (Form 7203).
          Confirm basis history with prior preparer.
        </div>
      </div>
    </div>
  )
}