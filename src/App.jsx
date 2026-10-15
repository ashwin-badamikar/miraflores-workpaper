import { useState } from 'react'
import { data, currentVersion, formatCurrency, getDiagnostics } from './data/dataHelpers'
import Summary from './components/Summary'
import Documents from './components/Documents'
import ReturnLines from './components/ReturnLines'
import Diagnostics from './components/Diagnostics'
import Timeline from './components/Timeline'
import ReviewPanel from './components/ReviewPanel'
import Depreciation from './components/Depreciation'
import Carryovers from './components/Carryovers'
import WhatIf from './components/WhatIf'
import K1Detail from './components/K1Detail'
import ClientMessages from './components/ClientMessages'
import StateSplit from './components/StateSplit'
import BooksToTax from './components/BooksToTax'
import Search from './components/Search'

const ROLES = ['Preparer', 'Reviewer', 'Partner']

const NAV = [
  { id: 'search', label: '🔍 Search' },
  { id: 'summary', label: 'Return Summary' },
  { id: 'documents', label: 'Documents' },
  { id: 'return', label: 'Return Lines' },
  { id: 'diagnostics', label: 'Diagnostics & Errors' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'review', label: 'Review & Sign-off' },
  { id: 'depreciation', label: 'Depreciation' },
  { id: 'carryovers', label: 'Carryovers' },
  { id: 'whatif', label: 'What-If Scenarios' },
  { id: 'k1', label: 'K-1 Detail' },
  { id: 'client', label: 'Client Communications' },
  { id: 'statesplit', label: 'State Split' },
  { id: 'bookstotax', label: 'Books to Tax' },
]

export default function App() {
  const [page, setPage] = useState('summary')
  const [role, setRole] = useState('Preparer')
  const household = data.household
  const tp = household.people.find(p => p.role === 'taxpayer')
  const sp = household.people.find(p => p.role === 'spouse')
  const warnings = getDiagnostics().filter(d => d.severity === 'warning').length
  const infos = getDiagnostics().filter(d => d.severity === 'info').length

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Miraflores</div>
          <div className="font-bold text-base leading-tight">{tp?.name} &amp; {sp?.name}</div>
          <div className="text-xs text-slate-400 mt-1">2025 · MFJ · CA→TX</div>
          <div className="text-xs text-slate-400">Client {data.packet.client_id}</div>
        </div>

        {/* Role switcher */}
        <div className="p-4 border-b border-slate-700">
          <div className="text-xs text-slate-400 mb-2">Viewing as</div>
          <div className="flex gap-1">
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`text-xs px-2 py-1 rounded ${role === r ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full text-left px-3 py-2 rounded text-sm mb-1 flex items-center justify-between ${page === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              {item.label}
              {item.id === 'diagnostics' && (warnings + infos) > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{warnings + infos}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
          <div>v3 · {currentVersion.computed_at?.slice(0, 10)}</div>
          <div className="mt-1">Federal balance: <span className="text-white font-medium">{formatCurrency(currentVersion.summary?.federal?.balance_due)}</span></div>
          <div>CA refund: <span className="text-white font-medium">{formatCurrency(Math.abs(currentVersion.summary?.california?.balance_due))}</span></div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {page === 'search' && <Search role={role} onNavigate={setPage} />}
          {page === 'summary' && <Summary role={role} />}
          {page === 'documents' && <Documents role={role} />}
          {page === 'return' && <ReturnLines role={role} />}
          {page === 'diagnostics' && <Diagnostics role={role} />}
          {page === 'timeline' && <Timeline role={role} />}
          {page === 'review' && <ReviewPanel role={role} />}
          {page === 'depreciation' && <Depreciation role={role} />}
          {page === 'carryovers' && <Carryovers role={role} />}
          {page === 'whatif' && <WhatIf role={role} />}
          {page === 'k1' && <K1Detail role={role} />}
          {page === 'client' && <ClientMessages role={role} />}
          {page === 'statesplit' && <StateSplit role={role} />}
          {page === 'bookstotax' && <BooksToTax role={role} />}
        </div>
      </main>
    </div>
  )
}