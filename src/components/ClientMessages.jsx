import { data } from '../data/dataHelpers'

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function QACard({ item }) {
  return (
    <div className="border rounded-xl overflow-hidden mb-3">
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
        <span className="text-xs font-mono text-gray-400">{item.id}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Answered by {item.answered_by}</span>
          <span className="text-xs text-gray-400">{formatDate(item.answered_at)}</span>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="text-sm font-medium text-gray-700 mb-2">{item.question}</div>
        <div className="text-sm text-gray-900 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          {item.answer || <span className="text-gray-400 italic">No answer provided</span>}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ msg }) {
  const isClient = msg.from === 'client' || !msg.from?.includes('@miraflores')
  return (
    <div className={`flex mb-4 ${isClient ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-2xl ${isClient ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-center gap-2 mb-1 ${isClient ? '' : 'justify-end'}`}>
          <span className="text-xs font-medium text-gray-600">{msg.from}</span>
          <span className="text-xs text-gray-400">{formatDate(msg.sent_at)} {formatTime(msg.sent_at)}</span>
        </div>
        <div className={`rounded-2xl px-4 py-3 text-sm ${
          isClient
            ? 'bg-white border text-gray-800 rounded-tl-none'
            : 'bg-blue-600 text-white rounded-tr-none'
        }`}>
          {msg.text}
        </div>
      </div>
    </div>
  )
}

function CallNote({ call }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden mb-3">
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
        <span className="text-xs font-mono text-gray-400">{call.id}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">📞 Call · {formatDate(call.date)}</span>
          <span className="text-xs text-gray-400">{call.participants?.join(', ')}</span>
        </div>
      </div>
      <div className="px-4 py-3">
        <ul className="space-y-1">
          {call.notes?.map((note, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-gray-300 mt-0.5">•</span>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function ClientMessages() {
  const questionnaire = data.client?.questionnaire || []
  const messages = data.client?.messages || []
  const calls = data.client?.call_notes || []

  const answered = questionnaire.filter(q => q.answer)
  const unanswered = questionnaire.filter(q => !q.answer)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Client Communications</h1>
      <p className="text-sm text-gray-500 mb-6">
        Questionnaire answers, messages, and call notes — all part of the workpaper record.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-2xl font-bold">{questionnaire.length}</div>
          <div className="text-sm text-gray-500">Questions</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">{answered.length}</div>
          <div className="text-sm text-gray-500">Answered</div>
        </div>
        <div className={`border rounded-xl p-4 ${unanswered.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
          <div className={`text-2xl font-bold ${unanswered.length > 0 ? 'text-red-600' : 'text-gray-300'}`}>
            {unanswered.length}
          </div>
          <div className="text-sm text-gray-500">Unanswered</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-2xl font-bold">{messages.length}</div>
          <div className="text-sm text-gray-500">Messages</div>
        </div>
      </div>

      {/* Unanswered questions alert */}
      {unanswered.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
          <div className="font-medium text-red-700 mb-1">
            {unanswered.length} unanswered question{unanswered.length > 1 ? 's' : ''}
          </div>
          <div className="text-sm text-red-600">
            These questions still need client responses before the return can be completed.
          </div>
        </div>
      )}

      {/* Questionnaire */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3">
          Questionnaire
          <span className="ml-2 text-sm font-normal text-gray-400">({questionnaire.length} items)</span>
        </h2>

        {unanswered.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">
              Unanswered
            </div>
            {unanswered.map(item => <QACard key={item.id} item={item} />)}
          </div>
        )}

        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
            Answered
          </div>
          {answered.map(item => <QACard key={item.id} item={item} />)}
        </div>
      </div>

      {/* Messages */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3">
          Messages
          <span className="ml-2 text-sm font-normal text-gray-400">({messages.length} messages)</span>
        </h2>
        <div className="bg-white border rounded-xl px-6 py-5">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-8">No messages found.</div>
          )}
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        </div>
      </div>

      {/* Call notes */}
      <div>
        <h2 className="text-lg font-bold mb-3">
          Call Notes
          <span className="ml-2 text-sm font-normal text-gray-400">({calls.length} calls)</span>
        </h2>
        {calls.length === 0 && (
          <div className="bg-white border rounded-xl px-5 py-8 text-center text-gray-400">
            No call notes found.
          </div>
        )}
        {calls.map(call => <CallNote key={call.id} call={call} />)}
      </div>
    </div>
  )
}