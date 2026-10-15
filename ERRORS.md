# Errors Found in the Okafor-Lindqvist Packet

## Error 1: Theo's SSN Transposition (Prior Preparer Error)

**Where found:** Comparing household.people vs prior_years.return_2024.dependents

**What it is:** The 2024 filed return lists Theo Lindqvist-Okafor's SSN as 666-74-3390.
The household organizer records it as 666-74-3309. One digit is transposed.

**How the workpaper surfaces it:** Visible by comparing the household panel against
the prior year return (D06). A blocking review note prevents filing until confirmed.

**Tax impact:** A mismatched dependent SSN causes IRS rejection of the e-filed return
and potential loss of the child tax credit.

---

## Error 2: RSU Cost Basis Reported as Zero (High Confidence, Wrong)

**Where found:** Return Lines, F8949 lots, extracted values for RSU transactions

**What it is:** Multiple RSU sale lots show basis = $0 with 95% or higher confidence.
RSU basis should equal the fair market value at vesting, which is already included in
W-2 Box 1 as ordinary income. Using $0 basis causes the entire sale proceeds to be
taxed again as capital gain, resulting in double taxation.

**How the workpaper surfaces it:** The Diagnostics screen flags this. Clicking any RSU
line in Return Lines shows the source panel with the extracted value, confidence score,
and the W-2 document alongside it.

**Tax impact:** RSU proceeds of approximately $53,000 across four lots. Overstates
capital gains tax by roughly $8,000.

---

## Error 3: Meridian Brokerage Corrected 1099 Risk (D30 vs D31)

**Where found:** Document Index, documents D30 and D31

**What it is:** The original Meridian Brokerage 1099 (D30) was superseded by a
CORRECTED version (D31). Both exist in the packet with partial extraction status.
A new preparer could accidentally use D30.

**How the workpaper surfaces it:** The Document Index shows a red CORRECTED badge
on D31. The return_versions show D30 in documents_superseded for v2, confirming
the engine switched to D31.

**Tax impact:** Depends on what changed between original and corrected 1099.
The corrected document must always be used.

---

## Error 4: S Corporation Distributions Exceed Basis

**Where found:** K-1 Detail screen, Form 7203 lines, prior_years.basis_records

**What it is:** Lindqvist Family Woodworks distributions of $42,000 exceed available
stock basis of $20,785. The engine treats the $21,215 excess as capital gain.
Beginning basis of $2,300 appears understated due to gaps in prior year records.

**How the workpaper surfaces it:** The K-1 Detail screen shows the basis gap warning.
The Carryovers screen shows the basis rollforward. Return Lines shows Form 7203
with sources.

**Tax impact:** If beginning basis is actually higher, the capital gain from excess
distributions would be reduced. The prior preparer noted this as an open item in D07.

---

## Error 5: 1099-NEC Not Filed for Contractor Payments

**Where found:** Books to Tax screen, Diagnostics (FORM_1099_FILING warning), D27

**What it is:** Erik's contractor payments report shows payments to Mara Quintero
($4,800) and Dev Patel ($2,600). No Forms 1099-NEC have been issued. Payments
of $600 or more require a 1099-NEC by January 31.

**How the workpaper surfaces it:** Diagnostics flags this as a warning. Books to Tax
shows the source document with contractor names, amounts, and a red alert.

**Tax impact:** Penalties of $60 to $310 per unfiled form depending on timing.

---

## Error 6: FBAR Required but Outside Engagement Scope

**Where found:** Diagnostics (FBAR_OUTSIDE_RETURN), Document D36

**What it is:** Erik holds a Sparbanken Norrland account with approximately 185,000 SEK
year-end balance, equal to roughly $18,800 at the 2025 average rate. This exceeds
the $10,000 FBAR threshold. FinCEN Form 114 is required separately.

**How the workpaper surfaces it:** Diagnostics flags this. The engagement letter (D01)
explicitly excludes FBAR from scope. Both are visible in one place.

**Tax impact:** No income tax impact. Failure to file FBAR carries civil penalties
of up to $10,000 per violation for non-willful violations.