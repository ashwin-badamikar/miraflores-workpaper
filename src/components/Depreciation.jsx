import { currentVersion, data } from '../data/dataHelpers'

function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

export default function Depreciation() {
  const assets = currentVersion.assets || []
  const priorAssets = data.prior_years?.asset_records || []

  const enriched = assets.map(a => {
    const prior = priorAssets.find(p => p.asset_id === a.asset_id)
    const federal2025 = parseFloat(a.federal?.depreciation_2025) || 0
    const california2025 = parseFloat(a.california?.depreciation_2025) || 0
    const amt2025 = parseFloat(a.amt?.depreciation_2025) || 0
    const accumulated = parseFloat(a.federal?.accumulated_end) || 0
    return {
      ...a,
      federal2025,
      california2025,
      amt2025,
      accumulated,
      prior
    }
  })

  const totalFederal = enriched.reduce((s, a) => s + a.federal2025, 0)
  const totalCalifornia = enriched.reduce((s, a) => s + a.california2025, 0)
  const totalAMT = enriched.reduce((s, a) => s + a.amt2025, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Depreciation Schedule</h1>
      <p className="text-sm text-gray-500 mb-6">
        2025 depreciation by asset — federal, California, and AMT.
      </p>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Federal Total</div>
          <div className="text-2xl font-bold">{formatCurrency(totalFederal)}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">California Total</div>
          <div className="text-2xl font-bold">{formatCurrency(totalCalifornia)}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">AMT Total</div>
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalAMT)}</div>
        </div>
      </div>

      {/* Asset table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b bg-gray-50">
              <th className="text-left px-4 py-3">Asset</th>
              <th className="text-left px-4 py-3">Activity</th>
              <th className="text-left px-4 py-3">Method</th>
              <th className="text-left px-4 py-3">Life</th>
              <th className="text-right px-4 py-3">Cost</th>
              <th className="text-right px-4 py-3">Accum.</th>
              <th className="text-right px-4 py-3">Federal 2025</th>
              <th className="text-right px-4 py-3">CA 2025</th>
              <th className="text-right px-4 py-3">AMT 2025</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((asset, i) => (
              <tr key={asset.asset_id || i} className="border-b last:border-0 hover:bg-blue-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-sm">{asset.description || asset.asset_id}</div>
                  <div className="text-xs text-gray-400">
                    {asset.placed_in_service ? `In service: ${asset.placed_in_service}` : ''}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{asset.activity || '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                    {asset.method || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {asset.life_years ? `${asset.life_years} yr` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  {formatCurrency(asset.cost)}
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-500">
                  {formatCurrency(asset.accumulated)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(asset.federal2025)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={asset.california2025 !== asset.federal2025 ? 'text-orange-600 font-medium' : ''}>
                    {formatCurrency(asset.california2025)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={asset.amt2025 > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
                    {formatCurrency(asset.amt2025)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {asset.disposed ? (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Disposed</span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t font-semibold">
              <td className="px-4 py-3 text-sm" colSpan={6}>Totals</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totalFederal)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totalCalifornia)}</td>
              <td className="px-4 py-3 text-right text-red-600">{formatCurrency(totalAMT)}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        {assets.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400">
            No depreciation assets found in current version.
          </div>
        )}
      </div>

      {enriched.some(a => a.california2025 !== a.federal2025) && (
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl px-5 py-4">
          <div className="text-sm font-medium text-orange-700 mb-1">California vs Federal Differences</div>
          <div className="text-xs text-orange-600">
            Assets highlighted in orange have different California depreciation than federal,
            typically due to California not conforming to bonus depreciation or Section 179 elections.
          </div>
        </div>
      )}
    </div>
  )
}