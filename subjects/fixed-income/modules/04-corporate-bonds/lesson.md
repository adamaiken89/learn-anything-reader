# Module 4: Corporate Bonds

Est. study time: 2.5h

## Learning Objectives
- Distinguish investment grade vs high yield
- Interpret credit ratings from S&P, Moody's, Fitch
- Explain bond covenants and their purpose
- Understand seniority, recovery rates, and capital structure
- Calculate credit spreads

---

## Core Content

### Investment grade vs high yield

| Category | S&P | Moody's | Fitch | Characteristics |
|----------|-----|---------|-------|-----------------|
| **Investment Grade** | AAA to BBB- | Aaa to Baa3 | AAA to BBB- | Low default risk, institutional buyers |
| **High Yield (Junk)** | BB+ to D | Ba1 to C | BB+ to D | Higher yield, higher risk, limited buyers |
| **Default** | D | C | D | Payment missed |

### Credit ratings

Three major agencies: S&P Global, Moody's, Fitch.

Rating factors:
- Business risk: industry, competitive position, diversification
- Financial risk: leverage, coverage ratios, liquidity
- Management: strategy, governance, track record
- Country/regulatory: legal environment, sovereign rating ceiling

Rating watch vs outlook:
- **Outlook**: 6-24 month direction (positive/negative/stable)
- **Watch**: near-term possible change (within 90 days)

### Bond covenants

**Affirmative covenants**: things issuer must do (pay interest, maintain insurance).

**Negative covenants**: things issuer cannot do (incur more debt, sell assets, pay dividends beyond limit).

Protection for bondholders. Stronger in high yield.

### Seniority & capital structure

| Priority | Security | Risk | Recovery |
|----------|----------|------|----------|
| 1 | Senior secured | Lowest | 60-80% |
| 2 | Senior unsecured | | 40-60% |
| 3 | Senior subordinated | | 20-40% |
| 4 | Subordinated | | 10-30% |
| 5 | Junior subordinated | Highest | 0-10% |

Lower priority = higher yield.

### Credit spread

```
Credit spread = Bond yield - Treasury yield of same maturity
```

Drivers:
- Credit quality (rating)
- Liquidity
- Maturity
- Market risk appetite
- Economic cycle

Spread widens in recession, narrows in expansion.

Question: Spread widens even though company fundamentals unchanged — why? Answer: Market risk aversion (investors demand higher premium for bearing any risk). This is why credit spreads are called "risk premium" not just "default premium."

### Default & recovery

Historical default rates (1970-2023):
- AAA: ~0% annual
- AA: ~0.02% annual
- A: ~0.05% annual
- BBB: ~0.2% annual
- BB: ~0.8% annual
- B: ~2.5% annual
- CCC: ~12% annual

IG (BBB+ and above): ~0.1% annual. HY: ~2-4% annual (varies with cycle).

Recovery rate: % of face value recovered after default.
- Senior secured: ~50-70%
- Senior unsecured: ~30-50%
- Subordinated: ~10-30%

### Make-whole call

Most IG corporates have make-whole call provision.
If issuer calls early, pays bondholder PV of remaining coupons + principal.
Makes early call expensive for issuer → de facto non-callable.

---

## Examples

### Example 1: Credit spread interpretation

5yr Apple bond yields 4.50%. 5yr Treasury yields 4.20%.

Spread = 4.50% - 4.20% = 30bp.

Apple's spread reflects its AA rating, strong liquidity, tech industry position.

### Example 2: High yield scenario

Client asks about 7% yielding bond from CCC-rated retailer. During recession:

- Retail earnings fall → leverage rises → downgrade risk
- Spread widens (risk aversion increases)
- Bond price falls more than IG
- Recovery if default? Senior unsecured → ~40%

### Example 3: Private bank context

Client holds $2M of BBB-rated telecom bonds. Upgrade to A- happens.
- Spread tightens (less credit risk)
- Price rises
- Bond now eligible for more institutional mandates
- Client benefits from price appreciation + tighter yield

---

## Common Misconception

"IG bonds won't default." BBB-rated bonds default ~0.2%/yr — rare but real. "Fallen angels" (IG→HY) happen during stress (2008 saw 10% of IG universe downgraded to HY).

## Key Takeaways
- IG (BBB-/Baa3+) vs HY (BB+/Ba1+): default risk spectrum
- Ratings reflect business + financial risk profile
- Covenants protect bondholders — stronger in HY
- Seniority determines recovery in default
- Credit spread = risk premium over Treasuries
- Make-whole call: expensive early redemption

---

## Feynman Explain
Explain credit ratings to a private banking client. "Why does an A-rated bond yield less than a BB-rated bond?" Use simple risk analogy — lending money to different people.

*Self-check: Can you explain why a bond's spread might widen even without a downgrade?*

Run: `./scripts/learn.sh explain fixed-income 04-corporate-bonds`

---

## Reframe
Critique credit ratings: "Are ratings useful or harmful?" Consider: rating agencies' conflicts of interest (issuer-pays model), rating lag (downgrade after crisis), and herding behavior. Write your answer.

---

## Drill
Take the quiz.

Run: `./scripts/learn.sh quiz fixed-income 04-corporate-bonds`
