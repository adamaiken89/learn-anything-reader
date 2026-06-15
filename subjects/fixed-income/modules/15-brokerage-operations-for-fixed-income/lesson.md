# Module 15: Brokerage Operations for Fixed Income

Est. study time: 2.5h

## Learning Objectives
- Describe trade life cycle end-to-end
- Understand prime brokerage services
- Explain margin requirements for bonds
- Analyze trade reporting obligations
- Understand operational risk in FI trading

---

## Core Content

### Trade life cycle

**Front office** → **Middle office** → **Back office**

| Phase | Description | Owner |
|-------|-------------|-------|
| **Trade execution** | Dealer quotes, client agrees | Trader / Sales |
| **Trade capture** | Enter trade into system | Trader |
| **Confirmation** | Match trade details with counterparty | Middle office |
| **Affirmation** | Both parties confirm terms | Middle office |
| **Settlement** | Exchange securities for cash | Back office |
| **Clearing** | CCP guarantees | Clearing house |

### Prime brokerage

Services for hedge funds and professional clients:

| Service | Description |
|---------|-------------|
| **Execution** | Access to dealer network |
| **Financing** | Borrow cash (repo) to lever positions |
| **Securities lending** | Borrow bonds for short selling |
| **Custody** | Hold assets, settle trades |
| **Margin** | Finance with leverage |
| **Reporting** | P&L, risk, position reports |
| **Capital introduction** | Connect with investors |

### Margin requirements

**Regulation T (Reg T)**: 50% initial margin for equities.

**Bonds**: lower margin (less volatile). Typically 2-10% for Treasuries, 10-30% for corporates.

**Portfolio margin**: risk-based margin using SPAN-like methodology.

Margin call calculation:
```
Margin call = [Required margin % × Position value] - Existing equity
```

### Trade confirmation

**Voice trades** → confirmed electronically (Bloomberg, MarkitWire).

**Affirmation platforms**: DTCC CTM (Central Trade Manager), Bloomberg.

**SSI (Standard Settlement Instructions)**: pre-agreed settlement details per counterparty.

### Reporting obligations

| Regulation | Requirement |
|------------|-------------|
| **TRACE** | Corporate bond trade reporting (within 15 min) |
| **MSRB** | Muni bond trade reporting |
| **EMIR** (EU) | OTC derivative reporting |
| **Dodd-Frank** | Swap reporting to SDR |
| **MiFID II** | Transaction reporting, best execution |

### Operational risk

| Risk type | Example |
|-----------|---------|
| **Trade error** | Wrong bond, wrong quantity, wrong price |
| **Settlement fail** | Failed to deliver/receive |
| **Confirmation mismatch** | Disagreed trade details |
| **Fraud** | Unauthorized trading, false reporting |
| **Systems failure** | Trading platform outage |

Operational risk controls: dual authorization, reconciliation, STP (straight-through processing).

### Leverage and margin in practice

Hedge fund $100M equity, buys $500M bonds.

Leverage = $500M / $100M = 5x.

If bond price falls 3%:
- Loss = $15M (15% of equity)
- Equity drops to $85M
- Leverage rises to $485M / $85M = 5.7x
- Margin call: post more equity or reduce position

### Settlement Instruction management

Standing Settlement Instructions (SSI) stored for each counterparty.

Changes confirmed via SWIFT or secure messaging.

SSI fraud: criminals change settlement instructions → payment sent to wrong account.

---

## Examples

### Example 1: Trade life cycle walk-through

Monday 10am: PM buys $10M of 5yr Treasury at yield 4.05%.
- Front office: trade executed via MarketAxess
- Middle office: trade matched on FICC
- Back office: settlement Tuesday (T+1) via Fedwire

### Example 2: Margin call scenario

Client buys $20M HY bonds on margin. 20% maintenance margin.

Equity required = $20M × 20% = $4M.

Client posts $5M equity. Leverage = 4x.

Bonds fall 5% → position = $19M. Equity falls to $5M - $1M = $4M.

Margin ratio = $4M / $19M = 21% (above 20%, OK but close).

Further 2% drop → position = $18.62M. Equity = $4M - $0.38M = $3.62M. Margin = 19.4%. Margin call.

### Example 3: Private bank reporting

Client receives monthly statement:
- Position listing (ISIN, description, quantity, price, market value)
- Income received (coupons, maturities)
- Transactions (buys, sells, maturities)
- Cash balance
- Margin utilization (if leveraged)
- Performance (total return, duration, yield)

---

## Key Takeaways
- Trade life cycle: execution → confirmation → settlement
- Prime brokerage: financing, leverage, securities lending
- Bond margin lower than equities (2-10% Treasuries, 10-30% HY)
- TRACE/MSRB: mandatory trade reporting
- Operational risk: trade errors, settlement fails, SSI fraud
- Leverage amplifies returns and risk — margin calls when prices fall
- STP (straight-through processing) reduces operational risk

---

## Feynman Explain
Explain prime brokerage to a client: "How does a hedge fund get leverage to buy $500M of bonds with only $100M?" Use mortgage analogy — cash down payment = margin, loan = repo financing.

*Self-check: Can you explain why operational risk is higher in OTC bond trading vs exchange-traded equities?*

Run: `./scripts/learn.sh explain fixed-income 15-brokerage-operations-for-fixed-income`

---

## Reframe
Critique prime brokerage leverage: "Do prime brokers contribute to systemic risk?" Consider: LTCM 1998, Archegos 2021, collateral fire sales. What regulations address this? Write your answer.

---

## Drill
Take the quiz.

Run: `./scripts/learn.sh quiz fixed-income 15-brokerage-operations-for-fixed-income`
