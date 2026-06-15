# Module 2: Time Value of Money & Bond Pricing

Est. study time: 2h

## Learning Objectives
- Explain time value of money concept
- Calculate present value of future cash flows
- Price bond using discounted cash flow method
- Understand YTM as IRR of bond cash flows
- Distinguish spot rates from YTM

---

## Core Content

### Time Value of Money

$1 today worth more than $1 tomorrow. Reason: can invest today's dollar and earn interest.

Key variables:
- **PV**: Present Value (price today)
- **FV**: Future Value (principal + interest)
- **r**: Discount rate (yield)
- **n**: Number of periods
- **PMT**: Periodic payment

### Future Value

```
FV = PV × (1 + r)^n
```

Example: $1,000 today at 5% for 3 years
```
FV = 1,000 × (1.05)^3 = $1,157.63
```

### Present Value

```
PV = FV / (1 + r)^n
```

Example: $1,000 received in 3 years, discount at 5%
```
PV = 1,000 / (1.05)^3 = $863.84
```

### Bond Pricing Formula

Bond price = PV of all future cash flows (coupons + principal)

```
P = C/(1+r)^1 + C/(1+r)^2 + ... + C/(1+r)^n + FV/(1+r)^n
```

Where:
- C = coupon payment per period
- r = periodic yield (YTM / periods per year)
- n = total periods
- FV = face value (par)

### Semi-annual convention

Most bonds pay coupons semi-annually (2x per year).

Example: 5yr bond, 6% coupon, YTM 5%, semi-annual

```
Periodic coupon = (0.06 × $1,000) / 2 = $30
Periods = 5 × 2 = 10
Periodic yield = 5% / 2 = 2.5%
```

Price = PV of 10 semi-annual coupons of $30 + PV of $1,000 at maturity

P = $30 × [1 - (1.025)^-10] / 0.025 + $1,000 / (1.025)^10

P = $30 × 8.752 + $1,000 × 0.7812

P = $262.56 + $781.20 = $1,043.76 (premium bond)

### Annuity formula shortcut

Coupons form an annuity. Use:

```
PV_annuity = C × [1 - (1+r)^-n] / r
```

Then add PV of principal.

### YTM as IRR

YTM = discount rate that makes PV of cash flows equal market price.

Cannot solve directly (iterative). Use financial calculator or `=YIELD()` in Excel.

```
Price = Σ C/(1+YTM/2)^t + FV/(1+YTM/2)^n
```

### Spot rates vs YTM

| Concept | Definition |
|---------|------------|
| **Spot rate** | Yield on zero-coupon bond for specific maturity |
| **YTM** | Single discount rate applied to ALL cash flows |
| **Implication** | YTM assumes constant reinvestment rate across time — unrealistic |

Bootstrapping: derive spot rates from coupon bonds.

### Accrued interest & clean/dirty price

- **Clean price**: Quoted price, excludes accrued interest
- **Dirty price**: Clean + accrued interest = actual cash paid
- **Accrued interest**: Coupon earned by seller since last payment

Transaction settled between coupon dates → buyer pays seller accrued interest.

---

## Examples

### Example 1: Basic bond pricing

Bond: $1,000 face, 4% coupon (annual), 3yr maturity, YTM 3.5%

```
P = 40/(1.035)^1 + 40/(1.035)^2 + 1040/(1.035)^3
P = 38.65 + 37.34 + 939.78
P = $1,015.77 (premium)
```

### Example 2: Private bank context

Client sees bond quoted at clean price 98.50. Coupon 5% semi-annual, last coupon paid 60 days ago (182-day period).

```
Accrued interest = (5%/2) × (60/182) × $1,000 = 2.5% × 0.33 × $1,000 = $8.24
Dirty price = $985.00 + $8.24 = $993.24
Client pays $993.24.
```

### Example 3: YTM approximation

Bond: $1,000 face, 5% coupon, 5yr, price $960

Approximate YTM formula:
```
YTM ≈ [C + (FV - P)/n] / [(FV + P)/2]
YTM ≈ [50 + (1000-960)/5] / [(1000+960)/2]
YTM ≈ [50 + 8] / 980 = 58/980 = 5.92%
```

Check: actual YTM ≈ 5.95% (close).

---

## Key Takeaways
- Bond price = sum of PV of future cash flows
- Semi-annual convention: halve coupon and yield, double periods
- YTM = single discount rate matching price to cash flows
- Spot rates differ from YTM — YTM assumes flat reinvestment rate
- Clean price excludes accrued interest; dirty price is actual cost

---

## Feynman Explain
Explain bond pricing to a colleague: "Why does a bond's price change when rates move?" Use discounting concept — no formulas. Connect to Module 1's price-yield relationship using TVM reasoning.

*Self-check: Can you explain why a $1,000 par bond paying $30 semi-annually for 10 years is worth MORE than $1,000 when rates are 5% but LESS when rates are 7%?*

Run: `./scripts/learn.sh explain fixed-income 02-time-value-of-money-and-bond-pricing`

---

## Reframe
When does bond pricing as PV of cash flows break down? Consider: perpetual bonds (no maturity), floating-rate notes (coupon resets), convertible bonds (equity option embedded). Write your answer.

---

## Drill
Take the quiz. MCQs test TVM calculations, bond pricing, YTM, and accrued interest.

Run: `./scripts/learn.sh quiz fixed-income 02-time-value-of-money-and-bond-pricing`
