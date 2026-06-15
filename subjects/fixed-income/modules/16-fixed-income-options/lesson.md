# Module 16: Fixed Income Options

## Core Content

### Bond Options vs Equity Options

| Feature | FI Options | Equity Options |
|---------|-----------|----------------|
| Underlying | Bond price, yield, or interest rate | Stock price |
| Exercise style | Mostly American (callable bonds) | American or European |
| Volatility | Changes with time to maturity | Relatively constant |
| Delivery | Physical bond or cash settlement | Shares or cash |
| Liquidity | OTC, less liquid | Exchange-traded, more liquid |

### Types of Embedded FI Options

**Callable Bond**: Issuer right to redeem before maturity at call price
- Issuer exercises when rates fall (refinance cheaper)
- Investor receives call premium + principal
- Negative convexity near call date

Question: Why would any investor buy a callable bond if upside is capped? Answer: Higher coupon vs non-callable. Callable bond yield = non-callable yield + option premium. Investor gets paid for taking call risk.

**Putable Bond**: Investor right to sell back before maturity at par
- Investor exercises when rates rise (reinvest higher)
- Puts a floor on bond price

**Convertible Bond**: Investor right to convert bond into equity shares
- Conversion ratio: shares per bond
- Conversion price: par / conversion ratio
- Conversion value: stock price × conversion ratio
- Parity: bond price relative to conversion value

**Sinkable Bond**: Mandatory partial redemption via sinking fund
- Can have embedded option to accelerate payments
- Reduces credit risk over time

### Interest Rate Options

| Option | Description | Payoff |
|--------|-------------|--------|
| Cap | Call on interest rate (ceiling on floating rate) | max(rate - strike, 0) × notional × period |
| Floor | Put on interest rate (floor on floating rate) | max(strike - rate, 0) × notional × period |
| Collar | Cap + Floor combined | Caps cost + sets minimum |
| Swaption | Option to enter an interest rate swap | Payer swaption (pay fixed) / Receiver swaption (receive fixed) |

### Bond Option Pricing

**Key variables**:
- Current bond price / yield
- Strike price / yield
- Time to expiration
- Risk-free rate
- Yield volatility
- Coupon payments during option life

**Black Model for bond options**:
```
Call = B × N(d1) - K × e^(-rT) × N(d2)
Put = K × e^(-rT) × N(-d2) - B × N(-d1)
```

Where B = forward bond price, K = strike, r = risk-free rate, T = time

**Limitations**:
- Bond price converges to par at maturity (pull-to-par)
- Yield volatility not constant over time
- Negative convexity distorts pricing near call dates

### Yield-Based vs Price-Based Options

| Metric | Yield-Based | Price-Based |
|--------|-------------|-------------|
| Underlying | Yield to maturity | Dollar price |
| Strike | Yield level | Price level |
| Sensitivity | DV01-based | Duration-based |
| Convention | Used for caps/floors/swaptions | Used for bond options |

### Private Bank Context

High-net-worth clients use FI options for:
- **Portfolio protection**: Buying put options or swaptions to hedge rising rates
- **Yield enhancement**: Writing covered calls on bond positions (risk: bond called away)
- **Structured products**: Capital-guaranteed notes using zero-coupon bonds + options
- **Mortgage hedge**: Using caps to limit floating-rate mortgage costs for private banking real estate lending

Private banks structure bespoke OTC options for clients, including:
- Range accrual notes: Coupon paid only when reference rate stays within range
- Callable / putable structured notes: Customized strike and tenor
- Yield enhancement via option writing against bond portfolios

## Common Misconception

"Callable bond = higher yield = always better." Higher yield compensates for capped upside. In rate rally, callable bond underperforms. Investor must decide: get paid for call risk or avoid it with non-callable at lower yield.

## Key Takeaways

- Embedded options fundamentally change bond price-yield relationship
- Callable bonds = long bond + short call option → negative convexity
- Putable bonds = long bond + long put option → price floor
- Interest rate caps/floors/floors are OTC options on floating rates
- Black model used for pricing despite limitations
- Private banks use FI options for protection, yield enhancement, structured products

## Feynman Explain

Explain how callable bonds differ from straight bonds in terms of price behavior when interest rates fall. Why does the call option become valuable to the issuer when rates decline? What happens to the bond's price sensitivity near the call date?

## Reframe

Some investors avoid callable bonds because of reinvestment risk during falling rate environments. Yet callable bonds typically offer higher coupons than comparable non-callable bonds. Under what market conditions does the additional coupon adequately compensate for the call risk? When does it not?

## Drill

Answer the quiz questions for this module to test your understanding of FI options.
