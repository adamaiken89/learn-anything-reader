# Module 12: Credit Derivatives (CDS)

Est. study time: 2h

## Learning Objectives
- Explain CDS mechanics and terminology
- Understand CDS pricing and spread interpretation
- Describe CDS basis trade
- Understand CDS indices and standardized contracts

---

## Core Content

### What is CDS?

Credit Default Swap = insurance against default.

- **Protection buyer**: pays periodic premium (spread)
- **Protection seller**: makes payment if credit event occurs

Contract terms:
- **Reference entity**: company or sovereign
- **Notional**: amount protected
- **Maturity**: 1yr, 3yr, 5yr, 7yr, 10yr (5yr most liquid)
- **Coupon**: standard 100bp or 500bp
- **Upfront payment**: difference between standard coupon and market spread

### Credit events

ISDA (International Swaps and Derivatives Association) defines:

1. **Bankruptcy** (corporate)
2. **Failure to pay** (corporate + sovereign)
3. **Restructuring** (corporate)
4. **Obligation acceleration** (rare)
5. **Repudiation/Moratorium** (sovereign)

2009 "Big Bang" protocol: standardized auctions for settlement.

### CDS pricing

```
CDS spread ≈ (1 - Recovery) × Probability of default
```

Example: Recovery = 40%, PD = 2% annually
CDS spread ≈ (1 - 0.40) × 2% = 1.2% = 120bp

Market CDS spread reflects market's view of credit risk.

### Upfront payment

Standard coupons: 100bp (IG) or 500bp (HY).

If market spread > standard coupon → protection seller pays upfront (buyer pays less premium).

If market spread < standard coupon → protection buyer pays upfront.

Example: 5yr CDS at 180bp. Standard coupon = 100bp.
Buyer pays ≈ 80bp × duration as upfront.

### CDS indices

| Index | Region | Entities | Type |
|-------|--------|----------|------|
| **CDX.NA.IG** | North America | 125 | IG |
| **CDX.NA.HY** | North America | 100 | HY |
| **iTraxx Europe** | Europe | 125 | IG |
| **iTraxx Crossover** | Europe | 75 | HY |

Traded as single contract. Each series has fixed membership, rolls every 6 months.

### CDS basis

```
Basis = CDS spread - Bond spread (over same reference rate)
```

| Basis | Meaning | Trade |
|-------|---------|-------|
| **Positive** | CDS > bond spread | Sell CDS, buy bond (cheap funding) |
| **Negative** | CDS < bond spread | Buy CDS, short bond |
| **Zero** | Fair value | No arb |

Negative basis common in stressed markets (CDS cheap vs cash).

### Uses of CDS

1. **Hedging credit exposure** without selling bond
2. **Short credit** (buy protection) when bond hard to borrow
3. **Synthetic long credit** (sell protection) for yield
4. **Basis trading** (cash vs synthetic arb)
5. **Portfolio management** (adjust credit exposure efficiently)

### Sovereign CDS

Same mechanics but credit events include:
- Failure to pay
- Moratorium/Repudiation
- Restructuring

Sovereign CDS spreads: Greece >1000bp (2012), Germany ~10bp.

---

## Examples

### Example 1: CDS hedge

Bank holds $10M of BBB corporate bonds. Wants to hedge credit risk.

Buys $10M CDS protection at 150bp.

Annual cost = $10M × 1.5% = $150,000

If bond defaults: bank loses on bond, but CDS pays out (par - recovery).

Net position: hedged.

### Example 2: Negative basis trade

Bond yields 200bp over LIBOR. CDS = 150bp.

Basis = -50bp.

Buy bond (earn 200bp), buy CDS (pay 150bp). Net = 50bp risk-free + carry.

Trade works if basis converges to zero.

### Example 3: Private bank context

Client's portfolio concentrated in banking sector. Comfort with bank credit but wants to dial down sector weight temporarily.

Instead of selling bonds (tax, transaction cost): buy CDS protection on bank index for 6 months.

Synthetic hedge. Remove when comfortable.

---

## Key Takeaways
- CDS = credit insurance. Protection buyer pays spread
- Standard coupons: 100bp (IG), 500bp (HY). Upfront payment for difference
- Credit events: bankruptcy, failure to pay, restructuring
- CDS spread ≈ (1-Recovery) × PD
- Indices: CDX (US), iTraxx (Europe)
- Basis = CDS spread - bond spread. Negative basis = cash cheap vs CDS
- CDS enables synthetic long/short credit exposure

---

## Feynman Explain
Explain CDS to a colleague: "How can you insure a bond against default?" Use car insurance analogy. Who pays premium, who receives payout.

*Self-check: Can you explain why CDS spread can differ from bond spread (basis) and what a negative basis means?*

Run: `./scripts/learn.sh explain fixed-income 12-credit-derivatives-cds`

---

## Reframe
Critique CDS market: "Are CDS speculators destabilizing?" Consider: AIG 2008, naked CDS (buying protection without owning bond), transparency reforms. Write your answer.

---

## Drill
Take the quiz.

Run: `./scripts/learn.sh quiz fixed-income 12-credit-derivatives-cds`
