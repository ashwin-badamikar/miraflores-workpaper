import { data, currentVersion } from '../data/dataHelpers'

function formatCurrency(val) {
  if (val === null || val === undefined) return '—'
  if (val === 0) return '$0'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border mb-4">
      <div className="px-5 py-3 border-b bg-gray-50 rounded-t-xl">
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="divide-y">{children}</div>
    </div>
  )
}

function Row({ label, incoming, outgoing, note }) {
  return (
    <div className="px-5 py-3 flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="text-sm">{label}</div>
        {note && <div className="text-xs text-gray-400 mt-0.5">{note}</div>}
      </div>
      <div className="flex gap-8 shrink-0 text-right">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Into 2025</div>
          <div className={`text-sm font-medium ${incoming ? 'text-blue-700' : 'text-gray-300'}`}>
            {formatCurrency(incoming)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Out of 2025</div>
          <div className={`text-sm font-medium ${outgoing ? 'text-purple-700' : 'text-gray-300'}`}>
            {formatCurrency(outgoing)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Carryovers() {
  const incoming = data.prior_years?.carryovers_into_2025 || {}
  const outgoing = currentVersion.carryovers_out || {}

  const fedOut = outgoing.federal || {}
  const calOut = outgoing.california || {}
  const calIn = incoming.california || {}

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Carryovers</h1>
      <p className="text-sm text-gray-500 mb-6">
        Amounts carried into 2025 from prior years, and amounts carrying out of 2025 into future years.
      </p>

      {/* Legend */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="text-xs text-gray-600">Into 2025 (from prior years)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-600" />
          <span className="text-xs text-gray-600">Out of 2025 (into future years)</span>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3">Federal</h2>

      <Section title="Capital Losses">
        <Row
          label="Short-term capital loss carryforward"
          incoming={incoming.capital_loss_short}
          outgoing={fedOut.capital_loss_short}
        />
        <Row
          label="Long-term capital loss carryforward"
          incoming={incoming.capital_loss_long}
          outgoing={fedOut.capital_loss_long}
        />
      </Section>

      <Section title="Passive Activity Losses">
        <Row
          label="1450 Fremont Way passive loss (Sacramento rental)"
          incoming={incoming.passive_1450_fremont}
          outgoing={fedOut.passive_1450_fremont}
          note="Sacramento rental property"
        />
        <Row
          label="1200 Barton Hills passive loss (Austin rental)"
          incoming={incoming.passive_1200_barton_hills}
          outgoing={fedOut.passive_1200_barton_hills}
          note="Austin rental property — sold in 2025"
        />
      </Section>

      <Section title="Credits and Other">
        <Row
          label="Charitable contribution carryforward"
          incoming={incoming.charitable}
          outgoing={fedOut.charitable}
        />
        <Row
          label="Section 1231 loss carryforward"
          incoming={incoming.section_1231_losses}
          outgoing={fedOut.section_179}
        />
        <Row
          label="AMT minimum tax credit"
          incoming={incoming.amt_credit}
          outgoing={fedOut.minimum_tax_credit_from_2025_amt}
          note="Form 8801 — usable in 2026"
        />
        <Row
          label="Foreign tax credit carryforward"
          incoming={incoming.foreign_tax_credit}
          outgoing={null}
        />
        <Row
          label="QBI loss carryforward"
          incoming={incoming.qbi_loss}
          outgoing={null}
        />
        <Row
          label="SEP contribution not deductible for 2025"
          incoming={null}
          outgoing={fedOut.sep_contribution_not_deductible_for_2025}
          note="Carries to 2026 SEP limit calculation"
        />
        <Row
          label="S corp stock basis end of year"
          incoming={null}
          outgoing={fedOut.scorp_stock_basis_end}
          note="Lindqvist Family Woodworks — basis exhausted"
        />
        <Row
          label="Ridgeline capital account end of year"
          incoming={null}
          outgoing={fedOut.ridgeline_capital_account_end}
          note="Ridgeline Real Estate Fund III LP"
        />
      </Section>

      <h2 className="text-lg font-bold mb-3 mt-6">California</h2>

      <Section title="Capital Losses">
        <Row
          label="Short-term capital loss carryforward"
          incoming={calIn.capital_loss_short}
          outgoing={calOut.capital_loss}
        />
        <Row
          label="Long-term capital loss carryforward"
          incoming={calIn.capital_loss_long}
          outgoing={null}
        />
      </Section>

      <Section title="Passive Activity Losses">
        <Row
          label="1450 Fremont Way passive loss"
          incoming={calIn.passive_1450_fremont}
          outgoing={calOut.passive}
        />
        <Row
          label="1200 Barton Hills passive loss"
          incoming={calIn.passive_1200_barton_hills}
          outgoing={null}
        />
      </Section>

      {/* Planning note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mt-2">
        <div className="text-sm font-medium text-blue-700 mb-1">2026 Planning Note</div>
        <div className="text-xs text-blue-600 leading-relaxed">
          After the move to Texas, California will only tax California-source income in 2026.
          The Sacramento rental and Ridgeline's California share remain California-source.
          The AMT minimum tax credit of $3,871 carrying out of 2025 may be usable on Form 8801 next year.
        </div>
      </div>
    </div>
  )
}