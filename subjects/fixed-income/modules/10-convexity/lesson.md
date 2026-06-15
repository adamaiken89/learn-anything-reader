# Module 10: Convexity

Est. study time: 2h

## Learning Objectives
- Explain convexity and why it matters
- Calculate convexity adjustment
- Distinguish positive vs negative convexity
- Compare barbell vs bullet convexity
- Use convexity in portfolio management

---

## Core Content

### What is convexity?

Duration is linear approximation of price-yield curve.

Actual price-yield curve is convex (curved, not straight).

**Convexity** = curvature measure. Improves price change estimate.

Without convexity: `ΔP/P ≈ -D_mod × Δy`

With convexity: `ΔP/P ≈ -D_mod × Δy + 0.5 × Convexity × (Δy)^2`

### Convexity formula

```
Convexity = [Σ t(t+1) × PV(CF_t)] / [P × (1+y)^2]
```

For semi-annual: divide by (1+y/2)^2 instead.

### Convexity benefit

Convexity always positive for straight bonds (no options):

- Rates fall → price rises MORE than duration predicts
- Rates rise → price falls LESS than duration predicts

Investors profit from convexity in volatile markets.

Why is this mechanical? Pull-to-par: as time passes, price-yield relationship becomes less curved (shorter maturity → less convex). This convergence is not driven by rates — pure math of discounting.

### Positive vs negative convexity

| Type | Description | Examples |
|------|-------------|----------|
| **Positive** | Price-yield curve bends upward. Good for holder | Straight bonds, Treasuries |
| **Negative** | Price-yield curve bends downward. Bad for holder | Callable bonds, MBS (prepayment) |

Callable bond: as rates fall, price capped at call price → negative convexity.

MBS: as rates fall, prepayment surges → price appreciation limited → negative convexity.

### Convexity adjustment

```
Price change = -D × Δy + 0.5 × C × (Δy)^2
```

Example: D = 6.0, C = 50, Δy = -1% (rates fall 1%)

Duration only: +6.0%
With convexity: +6.0% + 0.5 × 50 × (0.01)^2 = +6.0% + 0.25% = +6.25%

For Δy = +1% (rates rise):
Duration only: -6.0%
With convexity: -6.0% + 0.25% = -5.75%

Convexity dampens loss in rising rates, boosts gain in falling rates.

### Barbell vs bullet

| Strategy | Composition | Convexity |
|----------|-------------|-----------|
| **Bullet** | Single intermediate maturity | Lower |
| **Barbell** | Short + long maturities | Higher (same duration) |

Barbell has higher convexity than bullet with same duration.

Investor pays for convexity (barbell yields slightly less).

### Why convexity matters

- Large rate moves: duration-only estimate inaccurate
- Volatile markets: convexity adds value (asymmetric price response)
- Portfolio hedging: convexity mismatch creates risk
- Negative convexity: embedded options hurt performance in rally

Question: How large must a rate move be for convexity to matter? Answer: For IG bonds (C=50-100), 100bp move adds ~0.25-0.5% to price estimate. Below 25bp, convexity adjustment <0.03% — negligible. Rule of thumb: convexity matters when |Δy| > 50bp.

---

## Examples

### Example 1: Convexity calculation

Bond price $105, D_mod = 5.0, C = 60. Yield changes from 5% to 4.5% (-50bp).

Duration effect: -5.0 × (-0.005) = +2.50%
Convexity effect: 0.5 × 60 × (0.005)^2 = 0.5 × 60 × 0.000025 = 0.00075 = 0.075%

Total estimate: +2.575%

Actual (exact): likely ~2.58%. Duration alone would say 2.50%.

### Example 2: Negative convexity in MBS

Agency MBS with D = 4.0. Rates fall 1%.

Positive convexity bond (Treasury): price change ≈ +4.0% + convexity boost.

MBS: rates fall → prepayment speeds → average life shortens → duration shortens → price gain capped at ~2.5%.

MBS has negative convexity: duration falls as rates fall, rises as rates rise.

### Example 3: Private bank context

Client holds callable corporate bond. Rates rally (fall 1%).

Duration says +6.0%. But bond is callable → negative convexity → price capped at call price → gains only ~4.5%.

Client disappointed: "My bond didn't rally as much as Treasuries."

Explain: "Bond is callable. Issuer can refinance at lower rate → price appreciation capped. You received higher yield initially but sacrificed upside."

---

## Common Misconception

"Convexity always benefits bondholders." True for straight bonds. But you pay for convexity — barbell yields less than bullet at same duration. Negative convexity (MBS, callables) hurts holders in rallies, benefits them in selloffs.

## Key Takeaways
- Convexity corrects duration's linear approximation
- Positive convexity: gains > losses for same yield move. Good.
- Negative convexity: losses > gains. Bad. (Callable, MBS)
- Barbell > bullet convexity (at same duration)
- Convexity adjustment: +0.5 × C × (Δy)^2
- Negative convexity hurts most in rate rallies

---

## Feynman Explain
Explain convexity to a junior trader: "Why does a bond gain MORE when rates fall than it loses when rates rise?" Use graph of curvy line vs straight line.

*Self-check: Can you explain why MBS has negative convexity and how that affects performance in a rate rally?*

Run: `./scripts/learn.sh explain fixed-income 10-convexity`

---

## Reframe
When is convexity unimportant? (Small rate moves, short maturity bonds, held to maturity.) When is it critical? (Large rate shocks, option-embedded bonds, levered portfolios.) Write your answer.

---

## Drill
Take the quiz.

Run: `./scripts/learn.sh quiz fixed-income 10-convexity`
