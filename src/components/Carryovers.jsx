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

  const federalIn = incoming.federal || {}
  const californiaIn = incoming.california || {}
  const federalOut = outgoing.federal || {}
  const californiaOut = outgoing.california || {}

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
          incoming={federalIn.capital_loss_short}
          outgoing={federalOut.capital_loss_short}
        />
        <Row
          label="Long-term capital loss carryforward"
          incoming={federalIn.capital_loss_long}
          outgoing={federalOut.capital_loss_long}
        />
      </Section>

      <Section title="Passive Activity Losses">
        <Row
          label="Rental passive loss carryforward"
          incoming={federalIn.passive_loss_rental}
          outgoing={federalOut.passive_loss_rental}
          note="Sacramento rental activity"
        />
        <Row
          label="Other passive loss carryforward"
          incoming={federalIn.passive_loss_other}
          outgoing={federalOut.passive_loss_other}
        />
      </Section>

      <Section title="Credits and Other">
        <Row
          label="Charitable contribution carryforward"
          incoming={federalIn.charitable_contribution}
          outgoing={federalOut.charitable_contribution}
        />
        <Row
          label="Section 1231 loss carryforward"
          incoming={federalIn.section_1231_losses}
          outgoing={federalOut.section_1231_losses}
        />
        <Row
          label="AMT minimum tax credit"
          incoming={federalIn.amt_credit}
          outgoing={federalOut.amt_credit}
          note="Form 8801 — may be usable in 2026"
        />
        <Row
          label="Foreign tax credit carryforward"
          incoming={federalIn.foreign_tax_credit}
          outgoing={federalOut.foreign_tax_credit}
        />
        <Row
          label="QBI loss carryforward"
          incoming={federalIn.qbi_loss}
          outgoing={federalOut.qbi_loss}
        />
      </Section>

      <h2 className="text-lg font-bold mb-3 mt-6">California</h2>

      <Section title="Capital Losses">
        <Row
          label="Short-term capital loss carryforward"
          incoming={californiaIn.capital_loss_short}
          outgoing={californiaOut.capital_loss_short}
        />
        <Row
          label="Long-term capital loss carryforward"
          incoming={californiaIn.capital_loss_long}
          outgoing={californiaOut.capital_loss_long}
        />
      </Section>

      <Section title="Passive Activity Losses">
        <Row
          label="Rental passive loss carryforward"
          incoming={californiaIn.passive_loss_rental}
          outgoing={californiaOut.passive_loss_rental}
        />
        <Row
          label="Other passive loss carryforward"
          incoming={californiaIn.passive_loss_other}
          outgoing={californiaOut.passive_loss_other}
        />
      </Section>

      <Section title="Other California">
        <Row
          label="Charitable contribution carryforward"
          incoming={californiaIn.charitable_contribution}
          outgoing={californiaOut.charitable_contribution}
        />
        <Row
          label="AMT credit"
          incoming={californiaIn.amt_credit}
          outgoing={californiaOut.amt_credit}
        />
      </Section>

      {/* Planning note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mt-2">
        <div className="text-sm font-medium text-blue-700 mb-1">2026 Planning Note</div>
        <div className="text-xs text-blue-600 leading-relaxed">
          After the move to Texas, California will only tax California-source income in 2026.
          The Sacramento rental and Ridgeline's California share remain California-source.
          The AMT minimum tax credit carrying out of 2025 may be usable on Form 8801 next year.
        </div>
      </div>
    </div>
  )
}