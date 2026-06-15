# Module 5: Municipal Bonds

Est. study time: 1.5h

## Learning Objectives
- Distinguish general obligation vs revenue bonds
- Understand tax-exempt status and tax-equivalent yield
- Describe muni market structure and participants
- Compare muni credit quality to corporate bonds

---

## Core Content

### What are municipal bonds?

Debt issued by states, cities, counties, and special districts.

Two main types:

| Type | Backing | Risk | Examples |
|------|---------|------|----------|
| **General Obligation (GO)** | Full faith & credit, taxing power | Lowest muni risk | State GO, city GO |
| **Revenue** | Specific revenue stream (tolls, fees, rents) | Higher than GO | Toll road, water, airport |

### Tax treatment

Key feature: interest exempt from federal income tax.

Why exempt? Constitutional doctrine of intergovernmental tax immunity (states/feds can't tax each other's debt). Also policy: lower borrowing cost for public infrastructure.

Also exempt from state/local tax if investor lives in issuing state.

Tax-equivalent yield (TEY):
```
TEY = Tax-exempt yield / (1 - marginal tax rate)
```

Example: Muni yields 3.5%, investor in 37% federal bracket.
```
TEY = 3.5% / (1 - 0.37) = 3.5% / 0.63 = 5.56%
```
Tax-equivalent yield ~5.56% — competitive with taxable bonds.

Question: At what tax bracket does muni become better than corporate of same risk? Answer: Breakeven bracket = 1 - (muni_yield / corporate_yield). If muni=3.5%, corporate=5%, breakeven=30%. Above 30%, muni wins after-tax.

### Alternative Minimum Tax (AMT)

Some munis subject to AMT (private activity bonds).
Tax-exempt for regular tax, but taxable under AMT.
Important for high-income clients subject to AMT.

### Muni market structure

- ~$4 trillion market
- Mostly retail and institutional buy-and-hold
- Less liquid than corporates
- Many small, infrequent issuers
- Trades OTC, often via electronic platforms (Electronic Municipal Market Access - EMMA)

### Credit quality

Historically high. Defaults rare vs corporates.

Muni 10-year cumulative default rate: ~0.1% for A-rated, ~0.5% for BBB-rated (vs corporate ~0.5% and ~2.5% respectively). GO defaults virtually zero for general-purpose states. Revenue bonds (healthcare, housing, industrial development) have higher default rates comparable to HY corporates.

Muni defaults concentrated in:
- Revenue bonds (especially healthcare, housing)
- Small issuers with weak economies
- Puerto Rico (sovereign-like, not US state bankruptcy)

Ratings approach differs: cash flow focus vs corporate balance sheet focus.

### Insured munis

Bond insurance (e.g., Assured Guaranty, Build America Mutual) wraps bond with insurer's credit.

AAA-rated insurer backs bond → bond rated AAA.

Insurance value eroded after 2008 (monoline insurers weakened).

### Build America Bonds (BABs)

2009-2010 program: taxable munis with federal subsidy.

Issued during financial crisis. Higher yields attracted institutional demand.

---

## Examples

### Example 1: Private bank tax-equivalent yield

Client in 32% bracket. Muni yields 4.2%.

TEY = 4.2% / (1 - 0.32) = 4.2% / 0.68 = 6.18%

Comparable corporate would need to yield >6.18% to be better after-tax.

### Example 2: GO vs revenue

City issues GO bond backed by property tax. Also issues revenue bond for airport.

Rating: GO = AA, airport revenue = A. Revenue bond higher yield due to lower security.

During pandemic: GO stable (property tax collected). Airport revenue fell sharply (travel dropped), spread widened.

---

## Common Misconception

"All munis are tax-free." Private activity bonds (airports, stadiums, housing) may trigger AMT. Out-of-state munis taxed at state level. Some munis (BABs) are taxable.

## Key Takeaways
- GO bonds: full faith & credit. Revenue: specific project revenue
- Muni interest federally tax-exempt. TEY calculation for comparison
- Market less liquid than corporates. Mostly buy-and-hold
- Default rare for GO. Revenue bonds have more risk
- Bond insurance wraps credit but insurer risk matters
- Private bank clients: tax-exempt yield often beats taxable after-tax

---

## Feynman Explain
Explain tax-equivalent yield to a client. "Why would you accept 4% tax-free from a muni instead of 6% taxable from a corporate?" Use take-home pay analogy.

*Self-check: Can you explain why high-net-worth clients tilt portfolios toward munis? What tax bracket makes munis attractive?*

Run: `./scripts/learn.sh explain fixed-income 05-municipal-bonds`

---

## Reframe
Critique tax-exempt munis: "Do munis benefit wealthy investors at public expense?" Consider: federal tax expenditure, market efficiency, and who holds munis. Write your answer.

---

## Drill
Take the quiz.

Run: `./scripts/learn.sh quiz fixed-income 05-municipal-bonds`
