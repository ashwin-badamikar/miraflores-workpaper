import { data, getDocument, getStaff } from '../data/dataHelpers'

const EVENT_CONFIG = {
  engagement_signed: { color: 'bg-green-500', label: 'Engagement Signed' },
  questionnaire_submitted: { color: 'bg-blue-500', label: 'Questionnaire Submitted' },
  client_marked_upload_complete: { color: 'bg-blue-400', label: 'Upload Complete' },
  document_received: { color: 'bg-gray-400', label: 'Document Received' },
  return_computed: { color: 'bg-purple-500', label: 'Return Computed' },
  work_started: { color: 'bg-indigo-500', label: 'Work Started' },
  irs_transcript_pulled: { color: 'bg-cyan-500', label: 'IRS Transcript Pulled' },
  staff_joined_engagement: { color: 'bg-indigo-400', label: 'Staff Joined' },
  client_call: { color: 'bg-teal-500', label: 'Client Call' },
  extension_filed_with_payment: { color: 'bg-orange-500', label: 'Extension Filed' },
  client_message: { color: 'bg-blue-300', label: 'Client Message' },
  client_approved_and_signed_8879: { color: 'bg-green-600', label: 'Client Approved & Signed' },
  efile_rejected: { color: 'bg-red-500', label: 'E-file Rejected' },
  efile_accepted_federal: { color: 'bg-green-500', label: 'E-file Accepted (Federal)' },
  efile_accepted_california: { color: 'bg-green-400', label: 'E-file Accepted (CA)' },
  federal_balance_paid: { color: 'bg-emerald-500', label: 'Federal Balance Paid' },
  california_refund_issued: { color: 'bg-emerald-400', label: 'CA Refund Issued' },
  quality_review_selected_return: { color: 'bg-yellow-500', label: 'Quality Review Selected' },
  next_year_engagement_started: { color: 'bg-blue-600', label: 'Next Year Engagement' },
  notice_received: { color: 'bg-red-600', label: 'Notice Received' },
}

function formatDate(at) {
  if (!at) return ''
  const d = new Date(at)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(at) {
  if (!at) return ''
  const d = new Date(at)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function resolveRefs(refs) {
  if (!refs || refs.length === 0) return []
  return refs.map(ref => {
    if (ref.startsWith('D')) {
      const doc = getDocument(ref)
      return doc ? { type: 'doc', label: `${doc.id}: ${doc.title}` } : { type: 'other', label: ref }
    }
    return { type: 'other', label: ref }
  })
}

function TimelineEvent({ event, isLast }) {
  const cfg = EVENT_CONFIG[event.event] || { color: 'bg-gray-400', label: event.event }
  const actor = event.actor ? getStaff(event.actor) : null
  const refs = resolveRefs(event.refs)

  return (
    <div className="flex gap-4">
      {/* Line and dot */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${cfg.color}`} />
        {!isLast && <div className="w-0.5 bg-gray-200 flex-1 mt-1" />}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 ${isLast ? '' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className={`text-xs px-2 py-0.5 rounded text-white font-medium ${cfg.color}`}>
              {cfg.label}
            </span>
            {actor && (
              <span className="ml-2 text-xs text-gray-500">{actor.name} · {actor.role}</span>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-gray-500">{formatDate(event.at)}</div>
            <div className="text-xs text-gray-400">{formatTime(event.at)}</div>
          </div>
        </div>

        {/* Detail */}
        {event.detail && (
          <div className="mt-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
            {event.detail}
          </div>
        )}

        {/* Refs */}
        {refs.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {refs.map((r, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-0.5 rounded ${r.type === 'doc' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-500'}`}
              >
                {r.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Timeline() {
  const events = data.timeline || []

  // Group events by month
  const grouped = {}
  events.forEach(event => {
    const month = event.at?.slice(0, 7) || 'Unknown'
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(event)
  })

  const months = Object.keys(grouped).sort()

  const stats = {
    total: events.length,
    docs: events.filter(e => e.event === 'document_received').length,
    computed: events.filter(e => e.event === 'return_computed').length,
    filed: events.some(e => e.event === 'efile_accepted_federal'),
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Timeline</h1>
      <p className="text-sm text-gray-500 mb-6">Full engagement history from signing to post-filing</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Events</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-2xl font-bold">{stats.docs}</div>
          <div className="text-sm text-gray-500">Documents Received</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-2xl font-bold">{stats.computed}</div>
          <div className="text-sm text-gray-500">Return Versions</div>
        </div>
        <div className={`border rounded-xl p-4 ${stats.filed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className={`text-2xl font-bold ${stats.filed ? 'text-green-600' : 'text-yellow-600'}`}>
            {stats.filed ? 'Filed' : 'Pending'}
          </div>
          <div className="text-sm text-gray-500">Filing Status</div>
        </div>
      </div>

      {/* Timeline grouped by month */}
      <div className="bg-white rounded-xl border px-6 py-5">
        {months.map(month => (
          <div key={month} className="mb-6">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b">
              {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            {grouped[month].map((event, i) => (
              <TimelineEvent
                key={event.id}
                event={event}
                isLast={i === grouped[month].length - 1 && month === months[months.length - 1]}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}