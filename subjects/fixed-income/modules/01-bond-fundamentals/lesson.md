# Module 1: Bond Fundamentals

Est. study time: 2h

## Learning Objectives
- Define key bond terms: face value, coupon, maturity, yield
- Explain inverse relationship between price and yield
- Distinguish premium, par, and discount bonds
- Calculate current yield and understand YTM

---

## Core Content

### What is a bond?

Bond = loan from investor to issuer. Issuer pays periodic interest, repays principal at maturity.

### Key terms

| Term | Definition |
|------|------------|
| **Face value (par)** | Principal repaid at maturity. Usually $1,000 per bond |
| **Coupon rate** | Annual interest rate (% of face value) |
| **Coupon payment** | Periodic interest = coupon rate × face value ÷ frequency |
| **Maturity** | Date principal is repaid |
| **Yield** | Return investor earns (varies with price) |
| **Price** | Market price (can be above, below, or at par) |

### Price-yield relationship

**Inverse**: When yield goes UP, price goes DOWN. When yield goes DOWN, price goes UP.

Reason: fixed coupon. If market rates rise, existing bonds with lower coupons become less valuable → price falls to match new yield.

Question: Why is price quoted as % of $1,000 par instead of dollar amount? Answer: % convention lets you compare bonds with different face values instantly. 95 across all of them means same thing relative to par.

### Premium, par, discount

| Price vs Par | Bond type | Yield vs Coupon |
|-------------|-----------|-----------------|
| Price = Par | Par bond | Yield = Coupon |
| Price > Par | Premium bond | Yield < Coupon |
| Price < Par | Discount bond | Yield > Coupon |

### Pull-to-par intuition

Discount bond price rises toward par as maturity nears.

Reason: not driven by rates — purely mechanical. Shorter time horizon means PV of principal dominates, and PV of $1,000 at any positive yield converges to $1,000 as maturity shrinks.

Question: If you buy discount bond at $950 and hold to maturity, is gain from rates or just mechanics? Answer: mechanical. Price must converge to par at maturity regardless of rate path.

### Current yield

`Current yield = Annual coupon / Market price`

Simple approximation. Does not account for maturity gain/loss.

### Yield to Maturity (YTM)

Total return if held to maturity. Includes:
- Coupon payments
- Gain/loss from price difference to par
- Reinvestment assumption (coupons reinvested at same YTM)

YTM = IRR of bond's cash flows. Most important yield measure.

---

## Examples

### Example 1
Bond: $1,000 face value, 5% coupon (annual), 10yr maturity

Annual coupon = $50

If market price = $1,000:
- Current yield = $50/$1,000 = 5%
- Yield = coupon rate (par bond)

If market price = $950:
- Current yield = $50/$950 = 5.26%
- YTM > 5.26% (buyer gets $50/yr + $50 gain at maturity)

### Example 2 (Private Bank context)
Client holds $1M face of 4% Treasuries. Fed raises rates → new Treasuries yield 5%.

What happens to client's bond value? Price falls. Old 4% bonds less attractive → price drops until yield matches 5%.

As broker, you explain: "Paper loss if marked to market, but if held to maturity full principal returned."

---

## Common Misconception

"Higher coupon bond is always better." No. Discount bond (low coupon) has built-in price gain at maturity (accretion). Total return from YTM perspective may be same for bond with low coupon + price gain vs high coupon + stable price.

## Key Takeaways
- Bonds = loans with fixed coupons, defined maturity
- Price and yield move inversely
- Premium bonds: price > par, yield < coupon
- Discount bonds: price < par, yield > coupon
- YTM is the complete return measure (coupons + price gain/loss)

---

## Feynman Explain
Teach price-yield relationship to a colleague who doesn't do fixed income. Use simplest words. No jargon ("duration", "convexity", "YTM"). Give concrete example from private bank context — a client's bond losing value when rates rise.

*Self-check: Did you use vague words like "basically" or "kind of"? Did you skip WHY prices fall (fixed coupon less attractive vs new bonds)?*

Run: `./scripts/learn.sh explain fixed-income 01-bond-fundamentals`

---

## Reframe
Judge the price-yield relationship: When does the inverse relationship NOT hold? (Think: distressed bonds, zero-coupon bonds, very short maturity.) Write your answer.

---

## Drill
Take the quiz. MCQs test recall, application, and private bank scenarios.

Run: `./scripts/learn.sh quiz fixed-income 01-bond-fundamentals`
