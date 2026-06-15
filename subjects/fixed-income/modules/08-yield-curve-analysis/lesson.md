# Module 8: Yield Curve Analysis

Est. study time: 3h

## Learning Objectives
- Interpret yield curve shapes
- Explain expectations, liquidity preference, and market segmentation theories
- Calculate forward rates from spot rates
- Understand curve steepening/flattening
- Analyze curve as economic indicator

---

## Core Content

### What is yield curve?

Graph of yields vs maturity (usually Treasuries).

Normal shape: upward sloping (longer maturity = higher yield).

### Curve shapes

| Shape | Description | Signal |
|-------|-------------|--------|
| **Normal** | Upward sloping | Growth expected, term premium |
| **Flat** | Short = long yields | Transition phase |
| **Inverted** | Downward sloping | Recession expected (short > long) |
| **Humped** | Rise then fall | Mid-term uncertainty |

Inverted curve = strongest recession predictor (past 8 US recessions preceded by inversion).

### Three theories

**1. Expectations Theory**

Long-term yield = average of expected future short-term rates.

```
(1 + y_2)^2 = (1 + y_1)(1 + E[f_1])
```

Implies forward rates = expected future spot rates.

Limitation: ignores term premium. Predicts flat curve on average — wrong.

**2. Liquidity Preference Theory**

Investors demand premium for holding longer-term bonds.

Forward rate = expected future rate + liquidity premium.

Explains normal upward slope. Term premium increases with maturity.

**3. Market Segmentation Theory**

Different investors prefer different maturities:
- Money market funds: short end
- Pension/insurance: long end
- Supply/demand within each segment determines rates

**Preferred Habitat**: variation — investors prefer certain maturities but will switch if premium is enough.

### Forward rates

Forward rate = rate for future period implied by spot curve.

2yr spot = 4%, 1yr spot = 3.5%. 1yr forward rate 1yr from now:

```
(1.04)^2 = (1.035)(1 + f)
f = (1.04)^2 / 1.035 - 1 = 1.0816/1.035 - 1 = 4.50%
```

### Curve movements

| Movement | Description | Cause |
|----------|-------------|-------|
| **Parallel shift** | All yields change same amount | Broad rate move |
| **Steepening** | Long rates rise more or fall less than short | Growth expectations, inflation |
| **Flattening** | Short rates rise more or fall less than long | Tightening cycle |
| **Butterfly** | Curve curvature changes | Mid-term vs wings |

### Curve as economic indicator

- Inversion → recession 6-24 months later (reliable since 1960s)
- Steepening after inversion → recession imminent or recovery beginning
- Federal funds rate vs 10yr Treasury: most watched spread
- Curve steepness = proxy for growth + inflation expectations

### Swap curve

Interest rate swap curve complements Treasury curve.

- Treasuries: risk-free rate
- Swap curve: AA bank credit quality
- Swap spread = swap rate - Treasury rate (typically positive)

---

## Examples

### Example 1: Curve inversion

Jan 2023: 3-month T-Bill = 4.5%, 10yr Treasury = 3.5%.

Inversion = 4.5% - 3.5% = -100bp.

Signal: market expects economic slowdown → Fed will cut rates → long yields already falling in anticipation.

### Example 2: Steepener trade

Investor expects curve to steepen. Buys 30yr bond, shorts 2yr note.

If curve steepens: long bond price rises more or falls less than short position gains.

### Example 3: Private bank context

Client asks: "Should I extend duration now? Curve is flat."

Analysis: flat curve → little term premium. Extra yield for going 10yr vs 2yr is small. If recession comes, rates fall → longer bonds rally. Extension might pay off, but near-term volatility high.

---

## Key Takeaways
- Normal = up. Inverted = down → recession signal
- Expectations theory: yield = avg of expected future rates
- Liquidity preference: term premium for longer bonds
- Segmentation: supply/demand in maturity silos
- Forward rates derived from spot curve
- Steepening/flattening = relative movement of short vs long
- Swap curve alternative benchmark

---

## Feynman Explain
Explain yield curve inversion to a client: "Why do long-term rates sometimes fall below short-term rates, and what does it mean?" Use simple economic story (growth expectations, Fed policy).

*Self-check: Can you explain why forward rates differ from expected future rates under liquidity preference theory?*

Run: `./scripts/learn.sh explain fixed-income 08-yield-curve-analysis`

---

## Reframe
Critique yield curve as recession predictor: "Has inversion become less reliable?" Consider QE, global demand for Treasuries, structural low rates. Write your answer.

---

## Drill
Take the quiz.

Run: `./scripts/learn.sh quiz fixed-income 08-yield-curve-analysis`
