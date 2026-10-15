import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function ReviewPanel({ role }) {
  const [notes, setNotes] = useState([])
  const [audit, setAudit] = useState([])
  const [newNote, setNewNote] = useState('')
  const [area, setArea] = useState('General')
  const [priority, setPriority] = useState('normal')
  const [showAudit, setShowAudit] = useState(false)
  const [loading, setLoading] = useState(true)

  const AREAS = ['General', 'Wages', 'Capital Gains', 'Schedule C', 'Rental', 'K-1s', 'California', 'Credits', 'Foreign', 'Crypto']

  useEffect(() => {
    fetchNotes()
    fetchAudit()

    // Real-time subscription for notes
    const notesSubscription = supabase
      .channel('review_notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'review_notes' }, () => {
        fetchNotes()
      })
      .subscribe()

    // Real-time subscription for audit log
    const auditSubscription = supabase
      .channel('audit_log_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_log' }, () => {
        fetchAudit()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(notesSubscription)
      supabase.removeChannel(auditSubscription)
    }
  }, [])

  async function fetchNotes() {
    const { data, error } = await supabase
      .from('review_notes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setNotes(data || [])
    setLoading(false)
  }

  async function fetchAudit() {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('at', { ascending: false })
    if (!error) setAudit(data || [])
  }

  async function addNote() {
    if (!newNote.trim()) return
    const id = Date.now().toString()
    const note = {
      id,
      text: newNote.trim(),
      area,
      priority,
      role,
      status: 'open',
      created_at: new Date().toISOString(),
      signed_off: false,
      signed_off_by: null,
      signed_off_at: null,
    }
    const { error } = await supabase.from('review_notes').insert(note)
    if (!error) {
      await supabase.from('audit_log').insert({
        id: Date.now().toString() + '_a',
        at: new Date().toISOString(),
        action: 'NOTE_ADDED',
        details: `${area} · ${priority} · "${newNote.trim().slice(0, 60)}..."`,
        role,
      })
      setNewNote('')
      fetchNotes()
      fetchAudit()
    }
  }

  async function signOff(note) {
    const { error } = await supabase
      .from('review_notes')
      .update({
        signed_off: true,
        signed_off_by: role,
        signed_off_at: new Date().toISOString(),
        status: 'resolved',
      })
      .eq('id', note.id)
    if (!error) {
      await supabase.from('audit_log').insert({
        id: Date.now().toString() + '_a',
        at: new Date().toISOString(),
        action: 'NOTE_SIGNED_OFF',
        details: `"${note.text.slice(0, 60)}..." signed off by ${role}`,
        role,
      })
      fetchNotes()
      fetchAudit()
    }
  }

  async function reopen(note) {
    const { error } = await supabase
      .from('review_notes')
      .update({
        signed_off: false,
        signed_off_by: null,
        signed_off_at: null,
        status: 'open',
      })
      .eq('id', note.id)
    if (!error) {
      await supabase.from('audit_log').insert({
        id: Date.now().toString() + '_a',
        at: new Date().toISOString(),
        action: 'NOTE_REOPENED',
        details: `"${note.text.slice(0, 60)}..." reopened by ${role}`,
        role,
      })
      fetchNotes()
      fetchAudit()
    }
  }

  async function deleteNote(id) {
    await supabase.from('review_notes').delete().eq('id', id)
    fetchNotes()
  }

  const open = notes.filter(n => n.status === 'open')
  const resolved = notes.filter(n => n.status === 'resolved')
  const blocking = open.filter(n => n.priority === 'blocking')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Loading review notes...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Review Notes & Sign-offs</h1>
      <p className="text-sm text-gray-500 mb-6">
        Notes are shared across all firm staff in real time. Blocking notes prevent filing.
      </p>

      {/* Blocking alert */}
      {blocking.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <span className="text-red-500 text-xl">🚫</span>
          <div>
            <div className="font-bold text-red-700">Filing is blocked</div>
            <div className="text-sm text-red-600 mt-0.5">
              {blocking.length} blocking issue{blocking.length > 1 ? 's' : ''} must be resolved before this return can be filed.
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-2xl font-bold text-red-600">{blocking.length}</div>
          <div className="text-sm text-gray-500">Blocking</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-600">{open.length}</div>
          <div className="text-sm text-gray-500">Open</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">{resolved.length}</div>
          <div className="text-sm text-gray-500">Resolved</div>
        </div>
      </div>

      {/* Add note form */}
      <div className="bg-white border rounded-xl p-5 mb-6">
        <h2 className="font-semibold mb-3">Add Review Note</h2>
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Describe the issue, question, or decision..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-none"
          rows={3}
        />
        <div className="flex gap-3 flex-wrap">
          <select
            value={area}
            onChange={e => setArea(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="blocking">Blocking (prevents filing)</option>
          </select>
          <button
            onClick={addNote}
            disabled={!newNote.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Open notes */}
      {open.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-3 text-gray-700">Open ({open.length})</h2>
          <div className="space-y-3">
            {open.map(note => (
              <div
                key={note.id}
                className={`bg-white border rounded-xl p-4 ${note.priority === 'blocking' ? 'border-red-300 bg-red-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{note.area}</span>
                      {note.priority === 'blocking' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">🚫 Blocking</span>
                      )}
                      <span className="text-xs text-gray-400">Added by {note.role}</span>
                      <span className="text-xs text-gray-400">{new Date(note.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-800">{note.text}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {(role === 'Reviewer' || role === 'Partner') && (
                      <button
                        onClick={() => signOff(note)}
                        className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium"
                      >
                        Sign Off
                      </button>
                    )}
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved notes */}
      {resolved.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-3 text-gray-500">Resolved ({resolved.length})</h2>
          <div className="space-y-3">
            {resolved.map(note => (
              <div key={note.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-75">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{note.area}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✓ Signed off by {note.signed_off_by}</span>
                      <span className="text-xs text-gray-400">{new Date(note.signed_off_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-through">{note.text}</p>
                  </div>
                  <button
                    onClick={() => reopen(note)}
                    className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-200 shrink-0"
                  >
                    Reopen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length === 0 && (
        <div className="text-center text-gray-400 py-12 bg-white rounded-xl border">
          No review notes yet. Add one above.
        </div>
      )}

      {/* Audit Log */}
      <div className="mt-8">
        <button
          onClick={() => setShowAudit(o => !o)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
        >
          <span>{showAudit ? '▲' : '▼'}</span>
          Audit Log ({audit.length} entries)
        </button>

        {showAudit && (
          <div className="mt-3 bg-white border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50">
              <h2 className="font-semibold text-sm">Audit Log</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Every action recorded with timestamp and role. Shared across all firm staff.
              </p>
            </div>
            {audit.length === 0 && (
              <div className="px-5 py-6 text-center text-gray-400 text-sm">
                No actions recorded yet.
              </div>
            )}
            <div className="divide-y">
              {audit.map(entry => (
                <div key={entry.id} className="px-5 py-3 flex items-start gap-4">
                  <div className="shrink-0 text-right w-32">
                    <div className="text-xs text-gray-400">
                      {new Date(entry.at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(entry.at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        entry.action === 'NOTE_ADDED' ? 'bg-blue-100 text-blue-700' :
                        entry.action === 'NOTE_SIGNED_OFF' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {entry.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500">{entry.role}</span>
                    </div>
                    <div className="text-xs text-gray-600">{entry.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}