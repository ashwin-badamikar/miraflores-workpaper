import { currentVersion, formatCurrency } from '../data/dataHelpers'

function SplitRow({ label, federal, california, lineKey }) {
  const pct = federal > 0 ? Math.round((california / federal) * 100) : 0
  return (
    <div className="px-5 py-3 flex items-center gap-4 border-b last:border-0 hover:bg-gray-50">
      <div className="w-48 shrink-0">
        {lineKey && (
          <div className="text-xs font-mono text-gray-400 mb-0.5">{lineKey}</div>
        )}
        <div className="text-sm">{label}</div>
      </div>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-10 text-right">{pct}% CA</span>
      </div>
      <div className="w-32 text-right shrink-0">
        <div className="text-xs text-gray-400 mb-0.5">Federal</div>
        <div className="text-sm font-medium">{formatCurrency(federal)}</div>
      </div>
      <div className="w-32 text-right shrink-0">
        <div className="text-xs text-gray-400 mb-0.5">CA Source</div>
        <div className="text-sm font-medium text-blue-700">{formatCurrency(california)}</div>
      </div>
      <div className="w-32 text-right shrink-0">
        <div className="text-xs text-gray-400 mb-0.5">TX / Other</div>
        <div className="text-sm font-medium text-gray-500">
          {formatCurrency((federal || 0) - (california || 0))}
        </div>
      </div>
    </div>
  )
}

function getVal(lines, key) {
  const line = lines.find(l => l.key === key)
  return line?.value || 0
}

export default function StateSplit() {
  const fedLines = currentVersion.lines.filter(l => l.jurisdiction === 'federal')
  const caLines = currentVersion.lines.filter(l => l.jurisdiction === 'california')

  // Key federal amounts
  const fedWages = getVal(fedLines, 'F1040.1z')
  const fedInterest = getVal(fedLines, 'F1040.2b')
  const fedDividends = getVal(fedLines, 'F1040.3b')
  const fedCapGains = getVal(fedLines, 'F1040.7')
  const fedSchC = getVal(fedLines, 'SchC.31')
  const fedAGI = getVal(fedLines, 'F1040.11')
  const fedTotalTax = getVal(fedLines, 'F1040.24')

  // California source amounts from SchCA540NR
  const caWages = getVal(caLines, 'SchCA540NR.1z.B') || getVal(caLines, 'SchCA540NR.1a.B')
  const caInterest = getVal(caLines, 'SchCA540NR.2b.B')
  const caDividends = getVal(caLines, 'SchCA540NR.3b.B')
  const caCapGains = getVal(caLines, 'SchCA540NR.7.B')
  const caSchC = getVal(caLines, 'SchCA540NR.3.B') || 0
  const caAGI = getVal(caLines, 'F540NR.19') || getVal(caLines, 'SchCA540NR.22.B')
  const caTotalTax = getVal(caLines, 'F540NR.37') || getVal(caLines, 'F540NR.40')

  // Residency info
  const residency = [
    { state: 'California', from: '2025-01-01', to: '2025-07-14', days: 194 },
    { state: 'Texas', from: '2025-07-15', to: '2025-12-31', days: 170 },
  ]

  const summary = currentVersion.summary

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">State Split</h1>
      <p className="text-sm text-gray-500 mb-6">
        How income is allocated between California and Texas for the part-year return.
        California taxes income earned during CA residency (Jan 1 to Jul 14, 2025).
      </p>

      {/* Residency timeline */}
      <div className="bg-white border rounded-xl p-5 mb-6">
        <h2 className="font-semibold mb-4">2025 Residency</h2>
        <div className="flex rounded-lg overflow-hidden h-10 mb-3">
          <div
            className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: '53%' }}
          >
            California · 194 days
          </div>
          <div
            className="bg-orange-400 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: '47%' }}
          >
            Texas · 170 days
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Jan 1</span>
          <span>Jul 14 (moved)</span>
          <span>Dec 31</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {residency.map(r => (
            <div key={r.state} className="text-xs text-gray-600">
              <span className="font-medium">{r.state}:</span> {r.from} to {r.to} ({r.days} days)
            </div>
          ))}
        </div>
      </div>

      {/* Tax summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Federal AGI</div>
          <div className="text-2xl font-bold">{formatCurrency(fedAGI)}</div>
          <div className="text-xs text-gray-400 mt-1">All income regardless of state</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">California AGI</div>
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(summary?.california?.ca_agi)}
          </div>
          <div className="text-xs text-blue-500 mt-1">CA source income only</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">CA Tax / Federal Tax</div>
          <div className="text-2xl font-bold">
            {formatCurrency(summary?.california?.total_tax)}
            <span className="text-base font-normal text-gray-400"> / </span>
            {formatCurrency(summary?.federal?.total_tax)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Effective CA rate on CA income</div>
        </div>
      </div>

      {/* Income split table */}
      <div className="bg-white border rounded-xl mb-6">
        <div className="px-5 py-3 border-b">
          <h2 className="font-semibold">Income by Category</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Federal total vs California-source portion vs Texas/other
          </p>
        </div>
        <SplitRow
          label="Wages"
          lineKey="F1040.1z / SchCA540NR"
          federal={fedWages}
          california={caWages}
        />
        <SplitRow
          label="Taxable interest"
          lineKey="F1040.2b"
          federal={fedInterest}
          california={caInterest}
        />
        <SplitRow
          label="Ordinary dividends"
          lineKey="F1040.3b"
          federal={fedDividends}
          california={caDividends}
        />
        <SplitRow
          label="Capital gains"
          lineKey="F1040.7"
          federal={fedCapGains}
          california={caCapGains}
        />
        <SplitRow
          label="Schedule C (business)"
          lineKey="SchC.31"
          federal={fedSchC}
          california={caSchC}
        />
        <div className="px-5 py-3 bg-gray-50 border-t flex items-center gap-4">
          <div className="w-48 shrink-0 font-semibold text-sm">AGI Total</div>
          <div className="flex-1" />
          <div className="w-32 text-right">
            <div className="text-xs text-gray-400 mb-0.5">Federal</div>
            <div className="font-bold">{formatCurrency(fedAGI)}</div>
          </div>
          <div className="w-32 text-right">
            <div className="text-xs text-gray-400 mb-0.5">CA Source</div>
            <div className="font-bold text-blue-700">
              {formatCurrency(summary?.california?.ca_agi)}
            </div>
          </div>
          <div className="w-32 text-right">
            <div className="text-xs text-gray-400 mb-0.5">TX / Other</div>
            <div className="font-bold text-gray-500">
              {formatCurrency((fedAGI || 0) - (summary?.california?.ca_agi || 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <div className="text-sm font-medium text-amber-700 mb-2">Part-Year Allocation Notes</div>
        <ul className="space-y-1">
          <li className="text-xs text-amber-600">
            Wages are split by days worked in each state based on employer records and move date.
          </li>
          <li className="text-xs text-amber-600">
            The Sacramento rental property remains California-source income regardless of residency.
          </li>
          <li className="text-xs text-amber-600">
            Ridgeline Real Estate Fund has California-source income per the state supplement (D38).
          </li>
          <li className="text-xs text-amber-600">
            Erik's Schedule C income is allocated based on where services were performed.
          </li>
          <li className="text-xs text-amber-600">
            Texas has no state income tax — only California nonresident return (540NR) is required.
          </li>
        </ul>
      </div>
    </div>
  )
}