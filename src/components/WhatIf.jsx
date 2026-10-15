import { data, formatCurrency } from '../data/dataHelpers'

function DiffBadge({ base, alternative }) {
  if (base === undefined || alternative === undefined) return null
  const diff = alternative - base
  if (diff === 0) return <span className="text-xs text-gray-400">no change</span>
  const color = diff > 0 ? 'text-red-600' : 'text-green-600'
  const sign = diff > 0 ? '+' : ''
  return <span className={`text-xs font-medium ${color}`}>{sign}{formatCurrency(diff)}</span>
}

function ScenarioCard({ scenario }) {
  const fed = scenario.federal
  const cal = scenario.california
  const totalChange = (fed.total_tax_change || 0) + (cal.total_tax_change || 0)

  return (
    <div className="bg-white border rounded-xl overflow-hidden mb-6">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-start justify-between">
        <div>
          <div className="font-bold text-base">{scenario.description}</div>
          <div className="text-xs text-gray-400 mt-0.5">Base: {scenario.base_version}</div>
        </div>
        <div className={`text-right ${totalChange > 0 ? 'text-red-600' : totalChange < 0 ? 'text-green-600' : 'text-gray-500'}`}>
          <div className="text-lg font-bold">
            {totalChange === 0 ? 'No change' : (totalChange > 0 ? '+' : '') + formatCurrency(totalChange)}
          </div>
          <div className="text-xs">Total tax impact</div>
        </div>
      </div>

      {/* Federal vs California side by side */}
      <div className="grid grid-cols-2 divide-x">
        {/* Federal */}
        <div className="p-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Federal</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b">
                <th className="text-left pb-1">Item</th>
                <th className="text-right pb-1">Current</th>
                <th className="text-right pb-1">Alternative</th>
                <th className="text-right pb-1">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-1.5 text-xs">AGI</td>
                <td className="py-1.5 text-right text-xs">{formatCurrency(fed.base?.agi)}</td>
                <td className="py-1.5 text-right text-xs">{formatCurrency(fed.alternative?.agi)}</td>
                <td className="py-1.5 text-right"><DiffBadge base={fed.base?.agi} alternative={fed.alternative?.agi} /></td>
              </tr>
              <tr>
                <td className="py-1.5 text-xs">Taxable income</td>
                <td className="py-1.5 text-right text-xs">{formatCurrency(fed.base?.taxable_income)}</td>
                <td className="py-1.5 text-right text-xs">{formatCurrency(fed.alternative?.taxable_income)}</td>
                <td className="py-1.5 text-right"><DiffBadge base={fed.base?.taxable_income} alternative={fed.alternative?.taxable_income} /></td>
              </tr>
              <tr>
                <td className="py-1.5 text-xs font-medium">Total tax</td>
                <td className="py-1.5 text-right text-xs font-medium">{formatCurrency(fed.base?.total_tax)}</td>
                <td className="py-1.5 text-right text-xs font-medium">{formatCurrency(fed.alternative?.total_tax)}</td>
                <td className="py-1.5 text-right"><DiffBadge base={fed.base?.total_tax} alternative={fed.alternative?.total_tax} /></td>
              </tr>
              <tr>
                <td className="py-1.5 text-xs">Payments</td>
                <td className="py-1.5 text-right text-xs">{formatCurrency(fed.base?.payments)}</td>
                <td className="py-1.5 text-right text-xs">{formatCurrency(fed.alternative?.payments)}</td>
                <td className="py-1.5 text-right"><DiffBadge base={fed.base?.payments} alternative={fed.alternative?.payments} /></td>
              </tr>
              <tr>
                <td className="py-1.5 text-xs font-medium">Balance due</td>
                <td className="py-1.5 text-right text-xs font-medium">{formatCurrency(fed.base?.balance_due)}</td>
                <td className="py-1.5 text-right text-xs font-medium">{formatCurrency(fed.alternative?.balance_due)}</td>
                <td className="py-1.5 text-right"><DiffBadge base={fed.base?.balance_due} alternative={fed.alternative?.balance_due} /></td>
              </tr>
              {fed.penalty_change !== 0 && (
                <tr>
                  <td className="py-1.5 text-xs text-orange-600">Penalty change</td>
                  <td colSpan={2} />
                  <td className="py-1.5 text-right">
                    <span className="text-xs text-orange-600 font-medium">
                      {fed.penalty_change > 0 ? '+' : ''}{formatCurrency(fed.penalty_change)}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* California */}
        <div className="p-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">California</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b">
                <th className="text-left pb-1">Item</th>
                <th className="text-right pb-1">Current</th>
                <th className="text-right pb-1">Alternative</th>
                <th className="text-right pb-1">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-1.5 text-xs">Total AGI</td>
                <td className="py-1.5 text-right text-xs">{formatCurrency(cal.base?.total_agi)}</td>
                <td className="py-1.5 text-right text-xs">{formatCurrency(cal.alternative?.total_agi)}</td>
                <td className="py-1.5 text-right"><DiffBadge base={cal.base?.total_agi} alternative={cal.alternative?.total_agi} /></td>
              </tr>
              <tr>
                <td className="py-1.5 text-xs">CA AGI</td>
                <td className="py-1.5 text-right text-xs">{formatCurrency(cal.base?.ca_agi)}</td>
                <td className="py-1.5 text-right text-xs">{formatCurrency(cal.alternative?.ca_agi)}</td>
                <td className="py-1.5 text-right"><DiffBadge base={cal.base?.ca_agi} alternative={cal.alternative?.ca_agi} /></td>
              </tr>
              <tr>
                <td className="py-1.5 text-xs font-medium">Total tax</td>
                <td className="py-1.5 text-right text-xs font-medium">{formatCurrency(cal.base?.total_tax)}</td>
                <td className="py-1.5 text-right text-xs font-medium">{formatCurrency(cal.alternative?.total_tax)}</td>
                <td className="py-1.5 text-right"><DiffBadge base={cal.base?.total_tax} alternative={cal.alternative?.total_tax} /></td>
              </tr>
              <tr>
                <td className="py-1.5 text-xs">Payments</td>
                <td className="py-1.5 text-right text-xs">{formatCurrency(cal.base?.payments)}</td>
                <td className="py-1.5 text-right text-xs">{formatCurrency(cal.alternative?.payments)}</td>
                <td className="py-1.5 text-right"><DiffBadge base={cal.base?.payments} alternative={cal.alternative?.payments} /></td>
              </tr>
              <tr>
                <td className="py-1.5 text-xs font-medium">Balance due</td>
                <td className="py-1.5 text-right text-xs font-medium">{formatCurrency(cal.base?.balance_due)}</td>
                <td className="py-1.5 text-right text-xs font-medium">{formatCurrency(cal.alternative?.balance_due)}</td>
                <td className="py-1.5 text-right"><DiffBadge base={cal.base?.balance_due} alternative={cal.alternative?.balance_due} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Changed lines */}
      {scenario.changed_lines?.length > 0 && (
        <div className="border-t px-5 py-4">
          <div className="text-xs font-medium text-gray-500 mb-2">
            Affected Lines ({scenario.changed_lines.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {scenario.changed_lines.slice(0, 12).map((ch, i) => (
              <div key={i} className="text-xs bg-gray-50 border rounded px-2 py-1">
                <span className="font-mono text-gray-400 mr-1">{ch.key}</span>
                <span className="text-gray-500">{formatCurrency(ch.old)}</span>
                <span className="text-gray-400 mx-1">→</span>
                <span className="font-medium">{formatCurrency(ch.new)}</span>
              </div>
            ))}
            {scenario.changed_lines.length > 12 && (
              <div className="text-xs text-gray-400 px-2 py-1">
                +{scenario.changed_lines.length - 12} more lines
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function WhatIf() {
  const alternatives = data.what_if?.alternatives || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">What-If Scenarios</h1>
      <p className="text-sm text-gray-500 mb-6">
        Pre-computed alternatives showing the tax impact of different elections and methods.
        These do not change the filed return — they are planning tools only.
      </p>

      {alternatives.length === 0 && (
        <div className="bg-white border rounded-xl px-5 py-12 text-center text-gray-400">
          No what-if scenarios found in this packet.
        </div>
      )}

      {alternatives.map(scenario => (
        <ScenarioCard key={scenario.id} scenario={scenario} />
      ))}
    </div>
  )
}