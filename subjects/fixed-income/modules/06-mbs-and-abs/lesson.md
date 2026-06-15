# Module 6: MBS & ABS

Est. study time: 2.5h

## Learning Objectives
- Explain mortgage pass-through mechanics
- Understand prepayment risk and CPR/PSA
- Describe CMO structure and tranches
- Distinguish ABS from MBS
- Analyze senior/subordinate structures

---

## Core Content

### Securitization process

Originator (bank) pools loans → sells to SPV → SPV issues securities.

Key players:
- **Originator**: originates mortgages/loans
- **SPV (Special Purpose Vehicle)**: bankruptcy-remote entity
- **Servicer**: collects payments, handles delinquencies
- **Trustee**: oversees cash flow distribution
- **Rating agency**: assigns credit ratings to tranches

### Mortgage pass-through

Agency MBS (Fannie Mae, Freddie Mac, Ginnie Mae):
- Ginnie Mae: explicit US government guarantee
- Fannie/Freddie: implicit guarantee (but now under conservatorship)
- Pass through monthly payments (interest + principal)

Monthly cash flow = scheduled principal + interest + prepayments.

### Prepayment risk

Borrowers can prepay mortgages anytime (US). This creates uncertainty.

Prepayment speed measures:
- **CPR** (Conditional Prepayment Rate): annualized prepayment rate
- **PSA** (Public Securities Association): benchmark curve
- **SMM** (Single Monthly Mortality): monthly prepayment rate

```
SMM = 1 - (1 - CPR)^(1/12)
```

### CPR vs PSA

100% PSA = prepayment ramps up from 0.2% CPR at month 1 to 6% CPR at month 30, then stays at 6%.

150% PSA = 1.5x the benchmark.

Drivers of prepayment:
- **Refinancing incentive**: mortgage rates drop → borrowers refinance
- **Housing turnover**: home sales → loan payoff
- **Seasonality**: summer/spring higher
- **Burnout**: prepayment slows over time (rate-sensitive borrowers already left)

### CMO (Collateralized Mortgage Obligation)

CMO redistributes prepayment risk across tranches.

| Tranche | Priority | Prepayment risk | Average life |
|---------|----------|-----------------|--------------|
| **Sequential A** | First principal | Shortest | Shortest |
| **Sequential B** | After A | Medium | Medium |
| **Sequential C** | After B | Low | Long |
| **Z-Tranche (Accrual)** | Last | Lowest | Longest |

**IO (Interest Only)**: gets only interest. Price moves WITH rates (prepayment kills IO).
**PO (Principal Only)**: gets only principal. Price moves AGAINST rates (prepayment beneficial).

### Non-agency MBS

Private-label MBS (no government guarantee).

Credit enhancement:
- **Senior/subordinate structure**: senior tranches get paid first
- **Overcollateralization**: pool value > bonds issued
- **Excess spread**: interest from pool > bond coupons
- **Reserve accounts**: cash buffer for losses

### ABS overview

Asset-Backed Securities: non-mortgage collateral.

Common types:
| Type | Collateral | WAL | Prepayment |
|------|-----------|-----|------------|
| Credit card ABS | Receivables | 3-7yr | High, seasonal |
| Auto ABS | Car loans | 2-5yr | Moderate |
| Student loan ABS | Student debt | 5-15yr | Low |
| CLO | Leveraged loans | 5-12yr | Low (callable) |

### Cash flow waterfalls

Senior tranche gets paid first. Junior tranches absorb losses first.

Example:
1. Interest: pool cash → pay senior interest → pay mezzanine → pay subordinate
2. Principal: pool cash → pay senior principal → mezzanine → subordinate
3. Losses: absorbed by subordinate (first loss piece) → mezzanine → senior

---

## Examples

### Example 1: CPR calculation

MBS pool has SMM = 0.5% monthly. What is CPR?

CPR = 1 - (1 - 0.005)^12 = 1 - 0.994^12 = 1 - 0.9416 = 5.84%

### Example 2: Prepayment scenario

Rates drop 1%. MBS pool at 100% PSA (6% CPR) now likely moves to ~250% PSA (15% CPR).

Investor in pass-through gets principal back faster → must reinvest at lower rates (contraction risk).

CMO sequential A tranche gets hit first. Z-tranche unaffected until earlier tranches paid off.

### Example 3: Private bank context

Client holds agency MBS fund. Fed cuts rates → prepayments spike → fund duration shortens → yield declines.

Client asks: "Why did my MBS fund pay out so much principal this month?"

Answer: "Prepayments increased as homeowners refinance at lower rates. You received principal earlier — must reinvest at current lower yields."

---

## Key Takeaways
- Agency MBS: government-guaranteed. Non-agency: credit tranching
- Prepayment risk measured by CPR/PSA. Driven by rates, seasonality, burnout
- CMO redistributes prepayment risk into tranches
- IO: bet on rates rising. PO: bet on rates falling
- ABS: diverse collateral. Senior/sub structure protects top tranches
- WAL not fixed — prepayment creates uncertainty

---

## Feynman Explain
Explain prepayment risk to a client: "Why does a mortgage bond lose value when rates fall?" Connect to what happened in 2020-2021 refinancing wave.

*Self-check: Can you explain why IO tranche price RISES when rates rise?*

Run: `./scripts/learn.sh explain fixed-income 06-mbs-and-abs`

---

## Reframe
Critique securitization: "Is securitization good or bad for financial stability?" Consider 2008 crisis versus benefits of credit access. Write your answer.

---

## Drill
Take the quiz.

Run: `./scripts/learn.sh quiz fixed-income 06-mbs-and-abs`
