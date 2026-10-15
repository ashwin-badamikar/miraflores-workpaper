import packet from './okafor_lindqvist_2025_packet.json'

export const data = packet

// Get the latest return version (v3)
export const currentVersion = packet.return_versions.find(v => v.version === 'v3')

// Get a specific return version
export const getVersion = (v) => packet.return_versions.find(rv => rv.version === v)

// Get a document by ID (e.g. "D01")
export const getDocument = (id) => packet.documents.find(d => d.id === id)

// Get all extracted values for a document
export const getExtractedValuesForDoc = (docId) =>
  packet.extracted_values.filter(ev => ev.document_id === docId)

// Get a single extracted value by ID (e.g. "ev-0001")
export const getExtractedValue = (id) =>
  packet.extracted_values.find(ev => ev.id === id)

// Get a return line by key from a version
export const getLine = (version, key) =>
  version.lines.find(l => l.key === key)

// Get all lines for a specific form (e.g. "F1040")
export const getLinesForForm = (version, form) =>
  version.lines.filter(l => l.form === form)

// Get all diagnostics for current version
export const getDiagnostics = () => currentVersion.diagnostics

// Get all warnings
export const getWarnings = () => currentVersion.diagnostics.filter(d => d.severity === 'warning')

// Get all errors (info level)
export const getInfos = () => currentVersion.diagnostics.filter(d => d.severity === 'info')

// Get staff member by id
export const getStaff = (id) => packet.firm.staff.find(s => s.id === id)

// Get all documents grouped by type
export const getDocumentsByType = () => {
  const grouped = {}
  packet.documents.forEach(doc => {
    if (!grouped[doc.document_type]) grouped[doc.document_type] = []
    grouped[doc.document_type].push(doc)
  })
  return grouped
}

// Format currency
export const formatCurrency = (val) => {
  if (val === null || val === undefined) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

// Format confidence as a percentage color
export const confidenceColor = (conf) => {
  if (conf >= 0.95) return 'text-green-600'
  if (conf >= 0.80) return 'text-yellow-600'
  return 'text-red-600'
}

// Get sources for a line and resolve them to documents/extracted values
export const resolveLineSources = (line) => {
  if (!line || !line.sources) return []
  return line.sources.map(src => {
    if (src.startsWith('ev-')) {
      const ev = getExtractedValue(src)
      if (ev) {
        const doc = getDocument(ev.document_id)
        return { type: 'extracted_value', ev, doc }
      }
    }
    if (src.startsWith('py:/')) return { type: 'prior_year', ref: src }
    if (src.startsWith('agency:/')) return { type: 'agency', ref: src }
    return { type: 'other', ref: src }
  })
}