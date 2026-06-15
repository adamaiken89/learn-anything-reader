# Module 7: Repo & Reverse Repo

Est. study time: 2h

## Learning Objectives
- Explain repo mechanics and purpose
- Distinguish repo from reverse repo
- Understand haircut and margin
- Describe GC vs special repo
- Analyze repo market role in funding and leverage

---

## Core Content

### What is repo?

**Repurchase agreement**: sell security today with agreement to buy back at future date at higher price.

Economically: collateralized short-term loan.

```
Day 1: Borrower sells bond → receives cash
Day T: Borrower repurchases bond → pays cash + interest
```

Interest = repo rate.

### Repo vs Reverse repo

| Party | Action |
|-------|--------|
| **Borrower** (in repo) | Sells bond today, repurchases later. Receives cash. Pays repo rate |
| **Lender** (in reverse repo) | Buys bond today, sells later. Lends cash. Earns repo rate |

They are the same trade viewed from opposite sides.

### Mechanics

```
Accrued interest adjusted:
Start: Cash = Bond price + accrued interest
End: Cash_back = Start_cash × (1 + repo_rate × days/360)
```

Collateral: Treasuries (most common), agencies, MBS, corporates.

### Haircut (initial margin)

```
Haircut = (Collateral value - Cash lent) / Collateral value
```

Protects lender from collateral price decline.

| Collateral | Typical Haircut |
|------------|-----------------|
| Treasury | 0.5-2% |
| Agency MBS | 2-5% |
| IG corporate | 5-10% |
| HY corporate | 10-20% |
| Equities | 10-50% |

Higher volatility → higher haircut.

### GC vs Special repo

| Type | Collateral | Rate | Notes |
|------|------------|------|-------|
| **General Collateral (GC)** | Any Treasury | Lowest | Interbank funding |
| **Special** | Specific security | Below GC | Short-seller needs specific bond |
| **Fails** | None | Highest | Failed delivery penalty |

Special rate can go negative (short squeeze).

### Market participants

| Participant | Role |
|-------------|------|
| Money market funds | Lend cash (reverse repo) |
| Hedge funds | Borrow cash to lever, borrow bonds to short |
| Primary dealers | Intermediaries |
| Central bank (Fed RRP) | Set floor on overnight rates |
| Pension/insurance | Lend bonds for extra yield |

### Uses of repo

1. **Leverage**: hedge fund posts $10M cash, borrows $90M in repo → controls $100M bond position
2. **Short selling**: borrow specific bond to sell short (reverse repo)
3. **Inventory funding**: dealers fund bond inventory via repo
4. **Cash management**: money funds earn return on excess cash

### Tri-party repo

Intermediary (BNY Mellon / JPMorgan) handles collateral valuation, margin calls, settlement.

Reduces operational burden. Dominant form of US repo.

### Repo market stress

2008: haircuts spiked → repo lenders withdrew → forced selling → crisis amplified.

2019: repo rates spiked to 10% (reserves shortage, quarter-end constraints).

Secured Overnight Financing Rate (SOFR): benchmark replacing LIBOR.

---

## Examples

### Example 1: Basic repo calculation

Dealer repo $100M Treasuries for 7 days at 4.5%.

Start cash = $100M (ignoring accrued for simplicity)

End cash = $100M × (1 + 0.045 × 7/360) = $100M × 1.000875 = $100,087,500

Repo interest = $87,500

### Example 2: Haircut

Hedge fund buys $100M corporate bonds. Posts $10M equity, borrows $90M in repo.

Haircut = (100M - 90M) / 100M = 10%

If bond price falls to $95M → margin call (equity < haircut × new collateral value).

### Example 3: Private bank context

Client's fund uses repo to lever MBS portfolio.

Treasury repo rate = 4.25%. Fund earns 5.50% on MBS.

Net carry = 5.50% - 4.25% = 1.25% on borrowed amount.

Leverage magnifies return: $10M equity + $40M repo = $50M MBS → net return = [50×5.5% - 40×4.25%] / 10 = [2.75 - 1.70] / 10 = 10.5% equity return (vs 5.5% unlevered).

But leverage magnifies losses too.

---

## Key Takeaways
- Repo = collateralized short-term loan. Reverse repo = lending cash
- Haircut protects lender. Higher volatility → higher haircut
- GC: general funding. Special: specific security demand
- Repo enables leverage, short selling, dealer inventory funding
- Tri-party repo dominates (third-party agent)
- SOFR replaced LIBOR as overnight reference rate
- Repo stress = systemic risk (2008, 2019)

---

## Feynman Explain
Explain repo to a colleague: "How does a hedge fund buy $100M of bonds with only $10M?" Use mortgage analogy (house down payment = haircut).

*Self-check: Can you explain why special repo rates can go below GC?*

Run: `./scripts/learn.sh explain fixed-income 07-repo-and-reverse-repo`

---

## Reframe
Critique repo market: "Is repo market stable or fragile?" Consider 2008 freeze and 2019 spike. What reforms helped? (CCP clearing, higher haircuts, Fed RRP facility.) Write your answer.

---

## Drill
Take the quiz.

Run: `./scripts/learn.sh quiz fixed-income 07-repo-and-reverse-repo`
