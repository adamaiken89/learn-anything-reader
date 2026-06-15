# Module 13: Bond Trading & OTC Markets

Est. study time: 2h

## Learning Objectives
- Explain OTC bond market structure
- Understand bid-ask spread and liquidity
- Interpret TRACE data
- Describe electronic trading evolution
- Analyze factors affecting liquidity

---

## Core Content

### OTC market structure

Bonds trade over-the-counter (OTC), not on exchanges.

Why OTC, not exchange? Bonds are heterogeneous — thousands of unique issues per issuer (different coupons, maturities, seniority, covenants). Exchange needs standardized product. Stocks: one ticker per company. Bonds: dozens per company.

Dealer vs customer trades. No centralized order book.

Market participants:
- **Primary dealers**: trade directly with Fed, make markets in Treasuries
- **Regional dealers**: focus on specific sectors
- **Institutional investors**: asset managers, insurance, pension funds
- **Hedge funds**: active traders, relative value
- **Retail**: through brokers, limited access

### Bid-ask spread

| Bond type | Typical bid-ask |
|-----------|-----------------|
| On-the-run Treasury | 0.5-1bp |
| Off-the-run Treasury | 1-5bp |
| Agency MBS | 2-5bp |
| IG corporate | 5-25bp |
| HY corporate | 25-100bp |
| Municipal | 10-100bp |

Determinants of spread:
- Liquidity (most important)
- Trade size
- Market conditions
- Time of day
- Dealer inventory

### TRACE reporting

Trade Reporting and Compliance Engine (FINRA).

Since 2002: corporate bond trades reported publicly.

Increased transparency significantly. Tightened spreads post-TRACE.

Data: price, volume, yield, trade date/time.

### Electronic trading evolution

| Era | Platform type | Examples |
|-----|--------------|----------|
| Pre-2000 | Phone/voice | Dealer calls |
| 2000-2010 | Dealer-to-client | MarketAxess, TradeWeb |
| 2010-2020 | All-to-all | Direct exchange protocols |
| 2020+ | Electronification + automation | Algos, portfolio trading |

Electronic share of IG corporate trading: ~40% (growing).

### Liquidity

Bond market liquidity: episodic, not constant.

**Good times**: tight spreads, easy execution.
**Stress times**: spreads blow out, dealers step back.

How likely are liquidity crises? Major episodes: 2008 (MBS/corporate freeze), 2020 (COVID dash-for-cash). Minor events every 2-3 years. IG corporate spreads widened ~200bp in 3 weeks during March 2020, then recovered after Fed intervention.

Liquidity providers: dealers (risk capital), electronic platforms (limit orders).

Liquidity measurement:
- **Bid-ask spread**: narrow = liquid
- **Trade volume**: high = liquid
- **Price impact**: small = liquid
- **Dealer quote depth**: deep = liquid

### Portfolio trading

Increasing trend: trade entire portfolio of bonds in single block.

Advantage: execution speed, lower overall cost.

Disadvantage: dealer charges premium for risk.

### Trading strategies

| Strategy | Description |
|----------|-------------|
| **Outright** | Buy or sell single bond |
| **Switch** | Sell one bond, buy another |
| **Butterfly** | Long one maturity, short two others |
| **Curve trade** | Position for steepening/flattening |
| **RV trade** | Relative value between similar bonds |

---

## Examples

### Example 1: Bid-ask cost

Client wants to buy $5M of a BBB-rated corporate bond.

Bid = 99.75, Ask = 100.25. Spread = 50bp.

Cost to buy then immediately sell: 50bp × $5M = $25,000.

Important consideration for private bank: hold period needed to overcome transaction cost.

### Example 2: TRACE check

Client sees bond priced at 98.50. Check TRACE for recent trades.

Last 10 trades: 98.25-98.75 range. Volume $1M-$5M.

Confirms 98.50 is fair price. Dealer not overcharging.

### Example 3: Liquidity in stress

March 2020: IG corporate bonds. Bid-ask spreads went from 10bp to 100bp+.

Dealers withdrew. Fed intervened (SMCCF) to restore liquidity.

Client trying to sell: could not get price without large concession.

---

## Common Misconception

"Bonds trade like stocks — visible price, easy execution." No. OTC market means negotiated prices, wide spreads for small issues, and liquidity that disappears in stress. TRACE helps but covers only executed trades, not quotes.

## Key Takeaways
- Bonds trade OTC. Dealer-intermediated.
- Bid-ask varies by bond type and market conditions
- TRACE increased transparency significantly
- Electronic trading growing (especially IG)
- Liquidity is episodic — fine in normal times, scarce in stress
- Portfolio trading gaining share
- Transaction costs matter for total return

---

## Feynman Explain
Explain OTC bond trading to a client: "Why can't I see the bond price on a screen like I can with stocks?" Compare to real estate market (dealer-to-dealer, phone-based, negotiated prices).

*Self-check: Can you explain why TRACE reporting improved market quality?*

Run: `./scripts/learn.sh explain fixed-income 13-bond-trading-and-otc-markets`

---

## Reframe
Critique bond market structure: "Is OTC market structure better than exchange trading?" Consider: liquidity during stress, dealer balance sheet capacity, transparency, and client protection. Write your answer.

---

## Drill
Take the quiz.

Run: `./scripts/learn.sh quiz fixed-income 13-bond-trading-and-otc-markets`
