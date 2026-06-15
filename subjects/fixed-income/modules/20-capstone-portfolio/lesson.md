# Module 20: Capstone — Bond Portfolio Construction

## Core Content

**Note**: This capstone module synthesizes all prior modules into a portfolio construction exercise. No new concepts — application and integration of knowledge.

### Capstone Scenario

**Client profile**: Private banking client, age 55, $15M investable assets
- **Goal**: Generate $400,000 annual pre-tax income, preserve capital for retirement at 62
- **Risk tolerance**: Moderate (willing to tolerate 5-8% annual volatility in bond portfolio)
- **Tax rate**: 43.4% federal (including NIIT) + 5% state = 48.4% marginal
- **Time horizon**: 7 years to retirement, 30+ year retirement
- **Existing assets**: $5M in equities (diversified), $3M in real estate, $2M in cash
- **Constraints**: Needs liquidity for possible real estate investment in 2-3 years ($1M)
- **Preferences**: ESG-conscious, wants tax efficiency

### Step 1: Determine Bond Allocation

**Total portfolio**: $15M
**Current cash**: $2M (excess liquidity)
**Target FI allocation**: 30-40% of total portfolio ($4.5M-$6M)
**Decision**: $5M bond portfolio (33% of total, within moderate risk profile)

### Step 2: Define Sub-Allocations

| Segment | Allocation | Amount | Rationale |
|---------|-----------|--------|-----------|
| Treasuries (1-5yr) | 15% | $750K | Liquidity buffer, safety |
| Municipal bonds (in-state, ladder 1-10yr) | 35% | $1.75M | Tax-free income, diversification |
| Corporate IG (5-10yr) | 20% | $1M | Yield enhancement |
| Agency MBS | 10% | $500K | Spread product, diversification |
| TIPS (5-10yr) | 10% | $500K | Inflation protection |
| High-yield (short duration 1-3yr) | 5% | $250K | Yield pickup, limited rate risk |
| Cash equivalents (T-bills, MMF) | 5% | $250K | Dry powder for opportunity |

### Step 3: Duration Positioning

**Rate view**: Moderately bearish (yields may rise 50-75bps over next 12 months)
**Strategy**: Short-to-intermediate duration bias

| Metric | Portfolio Target | vs Benchmark (Bloomberg Agg) |
|--------|-----------------|------------------------------|
| Effective duration | 4.5 years | 1.5 years short |
| Average maturity | 6 years | 2 years short |
| Convexity | 0.40 | Slightly positive |

**Implementation**: Weight short-dated munis/Treasuries, avoid long corporates

### Step 4: Income Projection

| Segment | Yield (est.) | Annual Income |
|---------|-------------|--------------|
| Treasuries | 4.5% | $33,750 |
| Munis (tax-equiv 5.2%, actual 2.7%) | 2.7% (tax-free) | $47,250 |
| Corporate IG | 5.2% | $52,000 |
| Agency MBS | 5.0% | $25,000 |
| TIPS | 4.3% (real yield 1.8% + inflation) | $21,500 |
| High-yield | 7.5% | $18,750 |
| Cash equivalents | 5.0% | $12,500 |
| **Total** | | **$210,750 pre-tax** |
| Plus tax savings from munis (vs taxable equivalent) | | ~$44,000 |
| **Adjusted income including tax benefit** | | **~$255,000** |

Gap to $400K target: remaining income from equity dividends, real estate cash flow

### Step 5: Risk Management

| Risk | Mitigation |
|------|-----------|
| Interest rate rise | Short duration tilt, floating rate allocation |
| Credit downgrade | Diversification across 30+ issuers, IG focus |
| Default | Maximum 3% per issuer, avoid concentrated names |
| Reinvestment risk | Ladder structure provides rolling reinvestment |
| Inflation | TIPS allocation, some floating rate |
| Liquidity | Treasury/Cash buffer for real estate needs |
| Call risk | Avoid callable agency bonds, select make-whole corporates |
| Prepayment | Agency MBS allocation limited to 10% |

### Step 6: Implementation Plan

| Phase | Action | Timing |
|-------|--------|--------|
| 1 | Deploy $250K cash into T-bills | Immediate |
| 2 | Build muni ladder: $175K/year across 1-10yr | Over 2 months |
| 3 | Select 5-8 corporate IG bonds | Over 3 months |
| 4 | Add agency MBS via specified pools | Over 1 month |
| 5 | Place TIPS auction orders | Next 3 auctions |
| 6 | High-yield via short-duration ETF | Immediate |
| 7 | Rebalance duration to target | After all positions |

### Step 7: Monitoring and Rebalancing

| Frequency | Action |
|-----------|--------|
| Monthly | Performance vs benchmark, income tracking |
| Quarterly | Credit review of each holding, rating changes |
| Semi-annual | Duration rebalancing, sector allocation check |
| Annual | IPS review, rebalance to targets |
| Event-driven | Significant yield curve moves, credit events, client life changes |

### Portfolio Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Total return vs benchmark | Within 50bps (moderate active risk) | Bloomberg Agg + custom muni index |
| Income stability | Within 10% of projection | Actual vs projected coupon income |
| Credit quality | Average A or higher | S&P/Moody's weighted average |
| Tax efficiency ratio | >90% | Taxable-equivalent return / actual return |
| Tracking error | <100bps | Annualized standard deviation of excess returns |
| Worst drawdown | <8% | Peak-to-trough in value |

### Private Bank Platform Resources

**For executing this portfolio**:
- **Bond trading desk**: Access primary and secondary markets
- **Credit research team**: Independent analysis on each issuer
- **Tax advisory**: Municipal bond selection for state tax optimization
- **Reporting**: Consolidated view across all holdings
- **Collateral lending**: Securities-based lending against portfolio
- **Estate planning**: Bond titling for trust/estate purposes
- **Alternative investments**: If higher yield needed, private credit allocation

### Key Portfolio Construction Lessons

1. **Start with client goals, not market views**: IPS before strategy
2. **Tax efficiency matters more than yield**: For taxable clients, after-tax return is what counts
3. **Duration positioning dominates returns**: Gets ~90% of bond portfolio variation
4. **Credit diversification over concentration**: Single-name default risk
5. **Liquidity is a feature, not a constraint**: Proper liquidity buffer avoids forced selling
6. **Ladder for income, barbell for convexity**: Strategy choice driven by client needs
7. **Monitor drawdown, not just yield**: Capital preservation is paramount for private clients
8. **Bonds are not risk-free**: Understand all risks (rate, credit, liquidity, inflation, reinvestment, prepayment)

## Key Takeaways

- Bond portfolio construction integrates all prior modules: pricing, duration, convexity, credit, tax, regulation
- Client-first approach: IPS guides all decisions
- Tax efficiency, income stability, capital preservation — private bank bond priorities
- Duration positioning is the dominant performance driver
- Proper risk management prevents forced selling at inopportune times
- Portfolio requires ongoing monitoring and periodic rebalancing

## Feynman Explain

Walk through the entire bond portfolio construction process for a HNW client from start to finish. Explain why each step matters and how a change in any assumption (e.g., higher inflation, lower tax rates, earlier retirement) would cascade through the construction process.

## Reframe

The case against bonds in private client portfolios: "With yields barely above inflation after tax, why bother? Clients would be better served by a diversified equity portfolio and cash buffer." Construct the counter-argument using wealth management principles: sequence-of-returns risk, spending needs, and capital preservation. Where is the critic right, and where are they wrong?

## Drill

Answer the quiz questions for this module. These questions integrate concepts across all modules and require multi-step reasoning.
