# Module 17: Fixed Income Portfolio Strategies

## Core Content

### Active vs Passive Strategies

| Strategy | Approach | Goal | Example |
|----------|----------|------|---------|
| Passive | Buy and hold / index replication | Match benchmark, minimize tracking error | Replicate Bloomberg Aggregate Bond Index |
| Active | Tactical duration / credit / sector tilts | Beat benchmark | Overweight 10yr if rates expected to fall |
| Enhanced indexing | Minor active tilts around passive core | +25-50bps over index | Slight overweight to corporate bonds |
| Liability-driven (LDI) | Match asset cash flows to liabilities | Fund known future obligations | Pension fund matching duration to liabilities |

### Passive Strategies

**Buy and Hold**: Purchase bonds, hold to maturity
- No transaction costs after initial purchase
- Reinvestment risk on coupons
- Credit migration risk
- Best for: insurance companies, pension funds with known liabilities

**Indexing**: Replicate bond index returns
- Full replication: buy all securities (impractical for broad indices)
- Stratified sampling: bucket by sector/duration/credit, buy representative bonds
- Optimization-based: minimize tracking error given constraints

**Challenges with bond indexing**:
- Thousands of securities in broad indices
- Many bonds illiquid or hard to source
- Bonds mature and fall out of index (turnover)
- Index composition changes monthly
- Tracking error inevitable

### Active Strategies

| Strategy | Description | Rate View |
|----------|-------------|-----------|
| Duration tilting | Over/underweight portfolio duration vs benchmark | Bullish = long duration; bearish = short duration |
| Yield curve positioning | Bullet / barbell / ladder relative to benchmark | Steepener / flattener / butterfly |
| Sector rotation | Overweight sectors expected to outperform | Cyclical vs defensive |
| Credit allocation | Over/underweight credit quality buckets | Risk-on vs risk-off |
| Security selection | Pick individual bonds with mispriced risk | Bottom-up credit analysis |

Question: Which strategy wins in steepening, flattening, and stable environments? Answer: Bullet wins steepening (concentrated at long end benefits from rising long rates). Barbell wins flattening (short end stable, long end rallies). Ladder wins stable (constant reinvestment, no timing risk).

**Bullet Strategy**: Concentrate maturities in single range
- Used when curve expected to steepen
- Reduces reinvestment risk horizon

**Barbell Strategy**: Concentrate in short + long maturities, skip intermediate
- Used when curve expected to flatten
- Higher convexity than bullet with same duration
- More liquidity from short end

**Ladder Strategy**: Equal weights across evenly spaced maturities
- Natural diversification
- Constant reinvestment at current rates
- Low maintenance, predictable cash flows

### Liability-Driven Investing (LDI)

**Core concept**: Manage assets relative to liability value, not index

**Key metrics**:
- **Funding ratio**: Assets / Present value of liabilities
- **Surplus**: Assets - PV(liabilities)
- **Duration gap**: Asset duration - Liability duration

**Strategies**:
- Cash flow matching: Buy bonds matching liability payment schedule exactly
- Duration matching: Match asset/liability duration (immunization)
- Convexity matching: Also match second derivative for larger rate moves
- Swaps/derivatives: Use interest rate swaps to adjust duration without buying/selling bonds

**Immunization**: Set portfolio duration = liability horizon, ensure PV of assets = PV of liabilities
- Requires rebalancing as time passes and duration drifts
- Works best for parallel yield curve shifts

### Bond Portfolio Risk Management

| Risk | Source | Management |
|------|--------|------------|
| Interest rate | Yield curve movements | Duration/convexity hedging with futures/swaps |
| Credit spread | Widening/narrowing of spreads | CDS hedging, diversification |
| Default | Issuer bankruptcy | Diversification, credit analysis |
| Reinvestment | Coupon reinvested at lower rates | Cash flow matching, ladder |
| Liquidity | Unable to sell at fair price | Hold liquid securities, line of credit |
| Prepayment | MBS called early | Prepayment models, PO/IO tranches |
| Currency (if global) | FX rate changes | FX forwards, currency hedged ETFs |

### Yield Enhancement Strategies

- **Carry trade**: Borrow short-term, lend long-term (positive carry if curve upward sloping)
- **Credit barbell**: Short IG + long HY to increase yield while managing duration
- **Emerging market debt**: Higher yields with currency risk
- **Leverage**: Repo borrowing to finance additional bond purchases
- **Option writing**: Sell covered calls on bond positions or write swaptions

### Private Bank Context

Wealth management clients invest in bond portfolios for:
- **Income generation**: Regular coupon payments for spending needs
- **Capital preservation**: High-quality bonds as safe haven
- **Diversification**: Low correlation with equities
- **Legacy planning**: Long-dated bonds for estate planning

Portfolio construction considerations for HNW clients:
- Tax-efficient bond placement (munis in taxable accounts, corporates in tax-deferred)
- Customized bond ladders for predictable cash flows
- Direct bond ownership vs bond funds/ETFs (fee efficiency)
- ESG/sustainable bond integration per client preferences
- Duration management aligned with spending horizon

## Common Misconception

"Immunization eliminates interest rate risk." Only true for parallel shifts. Non-parallel shifts (steepening/flattening) break immunization. Requires convexity matching or key-rate hedging for true rate risk elimination.

## Key Takeaways

- Passive strategies (buy & hold, indexing) minimize cost and tracking error
- Active strategies (duration tilting, curve positioning, sector rotation) seek alpha
- Barbell has higher convexity than bullet at same duration
- LDI aligns assets with liabilities for pension funds/insurance
- Private bank clients prioritize income, preservation, and tax efficiency

## Feynman Explain

Explain the difference between a bullet, barbell, and ladder bond portfolio strategy. When would each be preferred in terms of yield curve expectations?

## Reframe

Critics argue that active bond management rarely beats passive indexing after fees, given bond markets are more efficient than equity markets. Yet sophisticated investors still allocate to active bond managers. What specific market inefficiencies in fixed income (vs equities) could skilled managers exploit? Consider liquidity, institutional constraints, and segmentation.

## Drill

Answer the quiz questions for this module to test your understanding of FI portfolio strategies.
