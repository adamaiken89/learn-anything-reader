# Module 14: Bond Settlement & Custody

Est. study time: 2h

## Learning Objectives
- Explain DVP settlement model
- Understand settlement fails and penalties
- Describe clearing house role (FICC, NSCC, Euroclear)
- Contrast physical vs book-entry custody
- Understand tri-party repo custody

---

## Core Content

### Trade lifecycle

```
Trade date (T) → Settlement date (T+1, T+2, T+3)
```

| Asset | Settlement | Standard |
|-------|-----------|----------|
| Treasuries | T+1 | Since 2017 (was T+2) |
| Corporate bonds | T+1 | Since 2024 (was T+2) |
| Muni bonds | T+1 | Since 2024 |
| MBS | T+1 (specified pool) | |
| Repo | Same day (T+0) | |

### DVP (Delivery vs Payment)

Simultaneous exchange: bonds delivered ↔ cash paid.

Eliminates principal risk (one party delivers, other doesn't pay).

Why DVP instead of trust? Before DVP, settlement required trust or letters of credit. DVP makes settlement atomic — like an escrow. Fedwire Securities Service moves bonds and cash simultaneously.

DVP Model 1: gross settlement, trade-by-trade.
DVP Model 2: net cash, gross securities.
DVP Model 3: net securities, net cash.

### Settlement fails

Fail = seller fails to deliver bonds on settlement date.

Causes:
- Operational error (trade not matched)
- Short position (bond not located)
- Market disruption

Penalties:
- Treasury fails: charged at spread below Fed funds (since 2009)
- Corporate bonds: contractual, varies
- Fails in high-demand securities: special repo rates

Question: What happens if both sides fail simultaneously? Answer: "Link" or "daisy chain" fails cascade — one fail causes another. FICC netting reduces this. In 2020, Treasury fails briefly spiked to ~$1T before penalty regime kicked in.

### Clearing houses

| Entity | Role |
|--------|------|
| **FICC** (Fixed Income Clearing Corp) | Treasury, agency MBS clearing |
| **DTCC** | Corporate bond settlement |
| **Euroclear / Clearstream** | International bonds (Eurobonds) |
| **LCH** | Repo clearing, CDS clearing |

Clearing house becomes central counterparty (CCP) — guarantees trade completion.

### Book-entry vs physical

| Type | Description | Current status |
|------|-------------|----------------|
| **Physical certificate** | Paper bond | Obsolete (except some munis) |
| **Book-entry** | Electronic record at depository | Standard (Fedwire, DTC) |

Treasuries: book-entry at Fedwire Securities Service.
Corporate bonds: book-entry at DTC (Depository Trust Company).

### Custody

Custodian holds securities on behalf of client.

| Type | Examples | Services |
|------|----------|----------|
| **Global custodian** | BNY, State Street, JPMorgan | Settlement, safekeeping, FX, reporting |
| **Prime broker** | For hedge funds | Financing, leverage, securities lending |
| **Sub-custodian** | Local market agents | Access to foreign markets |

### Margin and collateral management

Variation margin: daily mark-to-market for derivatives.
Initial margin: upfront collateral for non-cleared derivatives.

Collateral transformation: convert available assets into required collateral type.

### Asset servicing

- Coupon collection
- Maturity redemption
- Corporate actions (tender, exchange, consent solicitation)
- Withholding tax processing

---

## Examples

### Example 1: Settlement timeline

Client buys $5M corporate bond on Monday.

Trade date: Monday
Settlement: Wednesday (T+2 → now T+1)

Client must have $5M + accrued in account by settlement.
If not: failed trade, penalties.

### Example 2: Fail penalty

Client sells $10M Treasury. Fails to deliver because bond on loan.

Penalty: shortfall × (fail rate) × days.

Fail rate = Fed funds - 3% (if Fed funds = 5.33%, fail rate = 2.33%).

$10M × 2.33% × 1/360 = $647 per day.

### Example 3: Private bank context

Client holds international bond portfolio across US, EU, Asia.

Custodian BNY handles:
- US bonds at DTC
- EU bonds at Euroclear
- Asian bonds via sub-custodian network

Client sees single aggregated statement. Underlying settlement happens in each market.

---

## Key Takeaways
- DVP: simultaneous delivery vs payment. Eliminates principal risk
- T+1 settlement new standard for most bonds
- Fails: penalty costs for late delivery
- FICC clears Treasuries, agency MBS. DTC for corporate bonds
- Book-entry electronic — physical certificates obsolete
- Custodians provide safekeeping, settlement, income collection
- Collateral management essential for derivatives

---

## Feynman Explain
Explain settlement to a client: "You bought a bond today. When do you need to pay?" Use Amazon delivery analogy (order today, receive tomorrow + pay on delivery).

*Self-check: Can you explain why DVP eliminates principal risk but not operational risk?*

Run: `./scripts/learn.sh explain fixed-income 14-bond-settlement-and-custody`

---

## Reframe
Critique T+1 settlement: "Is faster settlement always better?" Consider: operational burden, cross-border complexity, error reconciliation time, Asian market timing. Write your answer.

---

## Drill
Take the quiz.

Run: `./scripts/learn.sh quiz fixed-income 14-bond-settlement-and-custody`
