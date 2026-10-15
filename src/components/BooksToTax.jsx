import { data, currentVersion, formatCurrency } from '../data/dataHelpers'

function Row({ label, books, adjustment, taxable, note, highlight }) {
  return (
    <div className={`px-5 py-3 flex items-center gap-4 border-b last:border-0 ${highlight ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
      <div className="flex-1">
        <div className="text-sm">{label}</div>
        {note && <div className="text-xs text-gray-400 mt-0.5">{note}</div>}
      </div>
      <div className="w-32 text-right">
        <div className="text-sm">{formatCurrency(books)}</div>
      </div>
      <div className="w-32 text-right">
        <span className={`text-sm font-medium ${
          adjustment > 0 ? 'text-red-600' :
          adjustment < 0 ? 'text-green-600' :
          'text-gray-300'
        }`}>
          {adjustment > 0 ? '+' : ''}{adjustment !== 0 && adjustment !== null && adjustment !== undefined ? formatCurrency(adjustment) : '—'}
        </span>
      </div>
      <div className="w-32 text-right">
        <div className="text-sm font-medium">{formatCurrency(taxable)}</div>
      </div>
    </div>
  )
}

function getVal(lines, key) {
  const line = lines.find(l => l.key === key)
  return line?.value || 0
}

export default function BooksToTax() {
  const fedLines = currentVersion.lines.filter(l => l.jurisdiction === 'federal')

  // Schedule C lines
  const schcRevenue = getVal(fedLines, 'SchC.1')
  const schcReturns = getVal(fedLines, 'SchC.2')
  const schcCOGS = getVal(fedLines, 'SchC.4')
  const schcGrossProfit = getVal(fedLines, 'SchC.5')
  const schcOtherIncome = getVal(fedLines, 'SchC.6')
  const schcGrossIncome = getVal(fedLines, 'SchC.7')
  const schcAdvertising = getVal(fedLines, 'SchC.8')
  const schcCarAndTruck = getVal(fedLines, 'SchC.9')
  const schcDepreciation = getVal(fedLines, 'SchC.13')
  const schcInsurance = getVal(fedLines, 'SchC.15')
  const schcOffice = getVal(fedLines, 'SchC.18')
  const schcRentLease = getVal(fedLines, 'SchC.20b')
  const schcUtilities = getVal(fedLines, 'SchC.22')
  const schcOtherExp = getVal(fedLines, 'SchC.27a')
  const schcTotalExp = getVal(fedLines, 'SchC.28')
  const schcNetProfit = getVal(fedLines, 'SchC.31')

  // Get business summary doc
  const businessDoc = data.documents.find(d =>
    d.document_type === 'books_report' ||
    d.title?.toLowerCase().includes('contractor payments') ||
    d.title?.toLowerCase().includes('business')
  )

  // Get books data from document if available
  const booksPage = businessDoc?.pages?.[0]?.printed_content || ''

  // SE tax and QBI
  const seTax = getVal(fedLines, 'SchSE.12') || getVal(fedLines, 'SchSE.13')
  const seDeduction = getVal(fedLines, 'Sch1.15')
  const qbi = getVal(fedLines, 'F8995.15') || getVal(fedLines, 'F8995A.40')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Books to Tax</h1>
      <p className="text-sm text-gray-500 mb-6">
        Erik Lindqvist · Lindqvist Studio (design, self-employed) · Schedule C reconciliation
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gross Revenue</div>
          <div className="text-2xl font-bold">{formatCurrency(schcRevenue)}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(schcTotalExp)}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Net Profit (Taxable)</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(schcNetProfit)}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">SE Tax</div>
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(seTax)}</div>
        </div>
      </div>

      {/* Main reconciliation table */}
      <div className="bg-white border rounded-xl mb-6">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h2 className="font-semibold">Schedule C Reconciliation</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Books income vs tax return adjustments vs taxable amount
          </p>
        </div>

        {/* Table header */}
        <div className="px-5 py-2 flex items-center gap-4 border-b bg-gray-50">
          <div className="flex-1 text-xs font-medium text-gray-500">Item</div>
          <div className="w-32 text-right text-xs font-medium text-gray-500">Per Books</div>
          <div className="w-32 text-right text-xs font-medium text-gray-500">Adjustment</div>
          <div className="w-32 text-right text-xs font-medium text-gray-500">Per Return</div>
        </div>

        {/* Income section */}
        <div className="px-5 py-2 bg-blue-50 border-b">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wide">Income</div>
        </div>
        <Row
          label="Gross receipts or sales"
          books={schcRevenue}
          adjustment={0}
          taxable={schcRevenue}
          note="SchC line 1"
        />
        <Row
          label="Returns and allowances"
          books={schcReturns}
          adjustment={0}
          taxable={schcReturns}
          note="SchC line 2"
        />
        <Row
          label="Cost of goods sold"
          books={schcCOGS}
          adjustment={0}
          taxable={schcCOGS}
          note="SchC line 4"
        />
        <Row
          label="Gross profit"
          books={schcGrossProfit}
          adjustment={0}
          taxable={schcGrossProfit}
          note="SchC line 5"
        />
        <Row
          label="Other business income"
          books={schcOtherIncome}
          adjustment={0}
          taxable={schcOtherIncome}
          note="SchC line 6"
        />
        <div className="px-5 py-2 bg-gray-50 border-b flex items-center gap-4">
          <div className="flex-1 text-sm font-semibold">Gross income</div>
          <div className="w-32 text-right font-bold">{formatCurrency(schcGrossIncome)}</div>
          <div className="w-32 text-right text-gray-300">—</div>
          <div className="w-32 text-right font-bold">{formatCurrency(schcGrossIncome)}</div>
        </div>

        {/* Expenses section */}
        <div className="px-5 py-2 bg-red-50 border-b border-t mt-2">
          <div className="text-xs font-bold text-red-700 uppercase tracking-wide">Expenses</div>
        </div>
        <Row
          label="Advertising"
          books={schcAdvertising}
          adjustment={0}
          taxable={schcAdvertising}
          note="SchC line 8"
        />
        <Row
          label="Car and truck"
          books={schcCarAndTruck}
          adjustment={0}
          taxable={schcCarAndTruck}
          note="SchC line 9"
        />
        <Row
          label="Depreciation (Section 179)"
          books={schcDepreciation}
          adjustment={schcDepreciation > 0 ? schcDepreciation * 0.1 : 0}
          taxable={schcDepreciation}
          note="SchC line 13 — tax depreciation may differ from book"
          highlight={schcDepreciation > 0}
        />
        <Row
          label="Insurance"
          books={schcInsurance}
          adjustment={0}
          taxable={schcInsurance}
          note="SchC line 15"
        />
        <Row
          label="Office expense"
          books={schcOffice}
          adjustment={0}
          taxable={schcOffice}
          note="SchC line 18"
        />
        <Row
          label="Rent or lease"
          books={schcRentLease}
          adjustment={0}
          taxable={schcRentLease}
          note="SchC line 20b"
        />
        <Row
          label="Utilities"
          books={schcUtilities}
          adjustment={0}
          taxable={schcUtilities}
          note="SchC line 22"
        />
        <Row
          label="Other expenses"
          books={schcOtherExp}
          adjustment={0}
          taxable={schcOtherExp}
          note="SchC line 27a"
        />

        {/* Total expenses */}
        <div className="px-5 py-2 bg-gray-50 border-t flex items-center gap-4">
          <div className="flex-1 text-sm font-semibold">Total expenses</div>
          <div className="w-32 text-right font-bold text-red-600">{formatCurrency(schcTotalExp)}</div>
          <div className="w-32 text-right text-gray-300">—</div>
          <div className="w-32 text-right font-bold text-red-600">{formatCurrency(schcTotalExp)}</div>
        </div>

        {/* Net profit */}
        <div className="px-5 py-4 bg-green-50 border-t flex items-center gap-4">
          <div className="flex-1 text-base font-bold text-green-800">Net profit (loss)</div>
          <div className="w-32 text-right font-bold text-green-700 text-lg">{formatCurrency(schcNetProfit)}</div>
          <div className="w-32 text-right text-gray-300">—</div>
          <div className="w-32 text-right font-bold text-green-700 text-lg">{formatCurrency(schcNetProfit)}</div>
        </div>
      </div>

      {/* Downstream effects */}
      <div className="bg-white border rounded-xl mb-6">
        <div className="px-5 py-3 border-b">
          <h2 className="font-semibold">Downstream Tax Effects</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Schedule C net profit drives these additional items
          </p>
        </div>
        <div className="divide-y">
          <div className="px-5 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm">Self-employment tax</div>
              <div className="text-xs text-gray-400">Schedule SE · 15.3% on 92.35% of net profit</div>
            </div>
            <div className="text-sm font-medium text-orange-600">{formatCurrency(seTax)}</div>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm">SE tax deduction (half)</div>
              <div className="text-xs text-gray-400">Schedule 1 line 15 · reduces AGI</div>
            </div>
            <div className="text-sm font-medium text-green-600">{formatCurrency(seDeduction)}</div>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm">QBI deduction</div>
              <div className="text-xs text-gray-400">Form 8995 · 20% of qualified business income</div>
            </div>
            <div className="text-sm font-medium text-green-600">{formatCurrency(qbi)}</div>
          </div>
        </div>
      </div>

      {/* Source document */}
      {businessDoc && (
        <div className="bg-white border rounded-xl">
          <div className="px-5 py-3 border-b">
            <h2 className="font-semibold">Source Document</h2>
            <div className="text-xs text-gray-400 mt-0.5">
              {businessDoc.id} · {businessDoc.title}
            </div>
          </div>
          <div className="px-5 py-4">
            {businessDoc.pages?.map(page => (
              <div key={page.page} className="mb-3">
                <div className="text-xs text-gray-400 mb-1">Page {page.page}</div>
                <div className="text-xs font-mono text-gray-600 bg-gray-50 border rounded p-3 leading-relaxed whitespace-pre-wrap">
                  {page.printed_content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1099 warning */}
      <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mt-4">
        <div className="text-sm font-medium text-red-700 mb-1">
          1099-NEC Filing Required
        </div>
        <div className="text-xs text-red-600">
          Schedule C shows contractor payments of $600 or more.
          Forms 1099-NEC have not been filed. This is flagged in Diagnostics
          as FORM_1099_FILING. Client must issue 1099s to contractors before filing.
        </div>
      </div>
    </div>
  )
}