import { currentVersion, getVersion, formatCurrency, data } from '../data/dataHelpers'

const FEDERAL_LINES = [
  'F1040.1z', 'F1040.2b', 'F1040.3b', 'F1040.7', 'F1040.8',
  'F1040.9', 'F1040.11', 'F1040.15', 'F1040.16', 'F1040.24',
  'F1040.33', 'F1040.37'
]

function getLineValue(version, key) {
  const line = version?.lines?.find(l => l.key === key)
  return line ? line.value : null
}

function getLineLabel(version, key) {
  const line = version?.lines?.find(l => l.key === key)
  return line ? line.label : key
}

function DeltaBadge({ current, prior }) {
  if (prior === null || prior === undefined || current === null || current === undefined) return null
  const diff = current - prior
  if (diff === 0) return <span className="text-xs text-gray-400">no change</span>
  const color = diff > 0 ? 'text-red-600' : 'text-green-600'
  const sign = diff > 0 ? '+' : ''
  return <span className={`text-xs font-medium ${color}`}>{sign}{formatCurrency(diff)}</span>
}

export default function Summary() {
  const v3 = currentVersion
  const v2 = getVersion('v2')
  const prior = data.prior_years?.return_2024

  const fed = v3.summary?.federal
  const cal = v3.summary?.california

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Return Summary</h1>
      <p className="text-sm text-gray-500 mb-6">Version 3 · Computed {v3.computed_at?.slice(0, 10)} · Triggered by: {v3.trigger}</p>

      {/* Top cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Federal Balance Due</div>
          <div className="text-3xl font-bold text-red-600">{formatCurrency(fed?.balance_due)}</div>
          <div className="text-xs text-gray-400 mt-1">Total tax {formatCurrency(fed?.total_tax)} · Payments {formatCurrency(fed?.payments)}</div>
          <div className="text-xs text-gray-400">AGI {formatCurrency(fed?.agi)} · Taxable income {formatCurrency(fed?.taxable_income)}</div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">California Refund</div>
          <div className="text-3xl font-bold text-green-600">{formatCurrency(Math.abs(cal?.balance_due))}</div>
          <div className="text-xs text-gray-400 mt-1">Total tax {formatCurrency(cal?.total_tax)} · Payments {formatCurrency(cal?.payments)}</div>
          <div className="text-xs text-gray-400">CA AGI {formatCurrency(cal?.ca_agi)}</div>
        </div>
      </div>

      {/* Year over year comparison */}
      <div className="bg-white rounded-xl border mb-8">
        <div className="px-5 py-3 border-b">
          <h2 className="font-semibold">Federal Key Lines: 2025 vs 2024</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="text-left px-5 py-2">Line</th>
              <th className="text-right px-5 py-2">2024 (filed)</th>
              <th className="text-right px-5 py-2">2025 (current)</th>
              <th className="text-right px-5 py-2">Change</th>
            </tr>
          </thead>
          <tbody>
            {FEDERAL_LINES.map(key => {
              const curr = getLineValue(v3, key)
              const priorVal = prior?.lines?.[key] ?? null
              const label = getLineLabel(v3, key)
              return (
                <tr key={key} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-2">
                    <span className="text-xs text-gray-400 mr-2">{key}</span>
                    {label}
                  </td>
                  <td className="text-right px-5 py-2 text-gray-500">{formatCurrency(priorVal)}</td>
                  <td className="text-right px-5 py-2 font-medium">{formatCurrency(curr)}</td>
                  <td className="text-right px-5 py-2">
                    <DeltaBadge current={curr} prior={priorVal} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Changes from v2 to v3 */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-3 border-b">
          <h2 className="font-semibold">What Changed: v2 → v3</h2>
          <p className="text-xs text-gray-400 mt-0.5">Trigger: {v3.trigger}</p>
        </div>
        <div className="divide-y">
          {v3.changes_from_previous?.slice(0, 20).map((ch, i) => (
            <div key={i} className="px-5 py-2 flex items-center justify-between text-sm">
              <span className="font-mono text-xs text-gray-500 w-48 shrink-0">{ch.key}</span>
              <span className="flex-1 text-gray-400 text-xs">{ch.change}</span>
              <span className="text-gray-400 text-xs mr-4">{formatCurrency(ch.old)}</span>
              <span className="font-medium text-xs">{formatCurrency(ch.new)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}