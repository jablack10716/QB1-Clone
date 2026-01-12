# QB1 Clone Scoring System - Vibe Edition

This document defines the scoring rules for the QB1-style football prediction game clone.  
Use this as the single source of truth for implementing scoring logic.

Last updated: January 2025 (vibe coding session)

## Core Scoring Philosophy

- **All-or-nothing tier-based scoring**:
  - If **ALL predicted tiers match exactly** → award **full sum of all tier points**.
  - Else, if **type matches** → award **ONLY type points** (partial credit).
  - Else → 0 points.
- Tiers: Type (RUN/PASS, always) → Depth (for passes only, if chosen) → Direction (if chosen)
- **Exact match** = all **predicted** tiers correct → increments streak
- **Partial match** = type correct but not all predicted tiers → streak **holds** (no reset), type points only
- **Complete miss** = type wrong → 0 points + streak resets to 0

## 1. Tier Points Matrix

| Tier Category          | Specific Option       | Points |
|------------------------|-----------------------|--------|
| **Type**               | RUN                   | 140    |
| **Type**               | PASS                  | 220    |
| **Direction**          | LEFT / CENTER / RIGHT | 70     |
| **Pass Depth**         | BACK                  | 380    |
| **Pass Depth**         | SHORT                 | 200    |
| **Pass Depth**         | LONG                  | 290    |

**Important**:
- Full points = sum of **all predicted tiers** ONLY if exact match on all of them.
- Direction/Depth points awarded **only** if predicted AND exact match.
- Partial = type points only.

## 2. Maximum Points per Prediction (Full Exact Match)

| Prediction              | Tiers Predicted       | Max Points |
|-------------------------|-----------------------|------------|
| RUN                     | Type                  | 140        |
| RUN-LEFT                | Type + Dir            | 210        |
| RUN-CENTER              | Type + Dir            | 210        |
| RUN-RIGHT               | Type + Dir            | 210        |
| PASS                    | Type                  | 220        |
| PASS-LEFT               | Type + Dir            | 290        |
| PASS-CENTER             | Type + Dir            | 290        |
| PASS-RIGHT              | Type + Dir            | 290        |
| PASS-SHORT              | Type + Depth          | 420        |
| PASS-BACK               | Type + Depth          | 600        |
| PASS-LONG               | Type + Depth          | 510        |
| PASS-BACK-LEFT          | Type + Depth + Dir    | 670        |
| PASS-BACK-CENTER        | Type + Depth + Dir    | 670        |
| PASS-BACK-RIGHT         | Type + Depth + Dir    | 670        |
| PASS-SHORT-LEFT         | Type + Depth + Dir    | 490        |
| PASS-SHORT-CENTER       | Type + Depth + Dir    | 490        |
| PASS-SHORT-RIGHT        | Type + Depth + Dir    | 490        |
| PASS-LONG-LEFT          | Type + Depth + Dir    | 580        |
| PASS-LONG-CENTER        | Type + Depth + Dir    | 580        |
| PASS-LONG-RIGHT         | Type + Depth + Dir    | 580        |

**Note**: PASS-BACK combinations are the highest reward because they are the riskiest/rarest to predict correctly.

## 3. Streak Multipliers (Consecutive Exact Matches Only)

| Consecutive Exact Matches | Multiplier |
|---------------------------|------------|
| 0                         | 1.0×       |
| 1–2                       | 1.2×       |
| 3–4                       | 1.5×       |
| 5–9                       | 2.0×       |
| 10+                       | 3.0×       |

- Streak **only increases** on full exact match (all predicted tiers)
- Streak **holds** on partial correct (type match only)
- Streak **resets** on complete miss (wrong type)

Example:  
670-point full match on 5-streak → 670 × 2.0 = 1340

## 4. Game Breaker

- **Usage rule**: Once every 4 downs (resets at start of new drive)
- **Effect**: ×2 multiplier applied to **base score** (tiers only for now)
- Applied **before** streak multiplier

Example:  
670 full exact + Game Breaker on 3-streak  
→ (670 × 2) × 1.5 = 2010

## 5. Quick Reference: Match Examples

| Prediction          | Actual Outcome       | Match Type             | Points |
|---------------------|----------------------|------------------------|--------|
| PASS-BACK-RIGHT     | PASS BACK RIGHT      | Exact (all tiers)      | 670    |
| PASS-BACK-RIGHT     | PASS BACK CENTER     | Partial (type only)    | 220    |
| PASS-BACK-RIGHT     | PASS LONG RIGHT      | Partial (type only)    | 220    |
| PASS-BACK-RIGHT     | PASS SHORT RIGHT     | Partial (type only)    | 220    |
| PASS-BACK-RIGHT     | PASS (no depth/dir)  | Partial (type only)    | 220    |
| PASS-BACK-RIGHT     | RUN-LEFT             | Miss                   | 0      |
| RUN-LEFT            | RUN-CENTER           | Partial (type only)    | 140    |
| PASS-SHORT          | PASS SHORT RIGHT     | Exact (type + depth)   | 420    |
| PASS-SHORT          | PASS LONG RIGHT      | Partial (type only)    | 220    |
| PASS-LEFT           | PASS BACK LEFT       | Exact (type + dir)     | 290    |
| PASS-LEFT           | PASS BACK CENTER     | Partial (type only)    | 220    |

## Implementation Notes

- Parse prediction strings like "PASS-BACK-RIGHT" → `{type: "pass", depth: "back", dir: "right"}`
- Logic:
  1. Parse pred & actual.
  2. If `is_exact(pred, actual)`: `score = sum(TIER_POINTS for all predicted & matched tiers)`
  3. Elif `pred.type == actual.type`: `score = TIER_POINTS[pred.type]`
  4. Else: `score = 0`
- `is_exact`: ALL **predicted** tiers match actual (ignores unpredicted tiers)
- Only award subtier points if exact match