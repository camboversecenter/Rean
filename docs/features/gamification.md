# Gamification & Economy

REAN runs on a two-currency economy that rewards learning and participation while
metering the cost of AI features. This system ties together the community, missions, and
AI tutor.

**Relevant code:** `services/gamificationService.ts`, `services/leaderboardService.ts`,
`services/achievementService.ts`, `pages/LeaderboardPage.tsx`, `pages/RewardsPage.tsx`,
`components/LuckyDropManager.tsx`, `components/MysteryBoxManager.tsx`.

## The two balances

Every user profile (`types.ts` → `UserProfile`) holds:

- **XP (`lifetime_xp`)**: reputation. It only ever goes up and is never spent. XP
  determines the user's **level**.
- **Points (`spendable_points`)**: the spendable currency used to pay for AI features
  and rewards.

## Earning (GAME_RULES)

Defined in `gamificationService.ts` → `GAME_RULES`. Daily limits prevent farming/spam:

| Action            | XP  | Points  | Daily limit | Label                |
| ----------------- | --- | ------- | ----------- | -------------------- |
| Post a question   | 5   | 0       | 5           | Daily Question Bonus |
| Helpful reply     | 2   | 1       | 5           | Helpful Reply        |
| Receive a like    | 1   | 0       | 20          | Received Like        |
| Solution accepted | 20  | 0       | unlimited   | Solution Accepted    |
| Lucky Drop        | 0   | dynamic | 3           | Lucky Drop           |

Earning is applied through `awardAction`, gated by `checkCanEarn` (which enforces the
daily limits). With `SUPABASE_HARDENING.sql` applied, `awardAction` and `spendPoints`
run through atomic server-side RPCs (`award_action`, `spend_points`) that enforce the
rules and limits on the server clock, and direct wallet writes from the browser are
blocked at the database level.

## Spending

Points are spent on AI features (see [AI Tutor](./ai-tutor.md) for the cost table) and
on rewards. `canAfford` checks the balance and `spendPoints` deducts it. All AI spending
is finalized **server-side** in the `ai-assistant` edge function.

Every change is recorded as a `PointTransaction` with a type of `earn`, `spend`, or
`penalty`, viewable via `fetchPointHistory`.

## Levels

Levels are derived purely from XP (`leaderboardService.ts`):

- `calculateLevel(xp) = floor(xp / 100) + 1`: every 100 XP is a new level.
- `calculateNextLevelProgress(xp)` returns progress toward the next level (0–99%).

## Leaderboard

`fetchLeaderboard` ranks users (by XP/level), and `fetchRecentActivity` shows a live
feed of recent point/XP events. Rendered on `pages/LeaderboardPage.tsx`.

## Achievements

Users unlock **Achievements** (`types.ts` → `Achievement`) as they hit milestones,
loaded with `fetchStudentAchievements`. Displayed on the account/profile.

## Rewards

`pages/RewardsPage.tsx` lets users spend points on real rewards.

- A user records a claim with `recordRewardClaim` (creates a `RewardClaim`).
- Creators see incoming claims (`fetchCreatorClaims`) and mark them fulfilled
  (`markClaimFulfilled`).
- A user reviews their own claims with `getMyRewardClaims`.

## Mystery Boxes

Creators build **Mystery Boxes** (`MysteryBox` + `MysteryBoxItem`) that users open with
points for a randomized reward.

- Create: `createMysteryBox`, `addMysteryBoxItems`.
- Manage: `getMyMysteryBoxes`, `deleteMysteryBox`.
- Browse: `fetchMysteryBoxes`.
- Managed in the UI via `components/MysteryBoxManager.tsx`.

## Lucky Drops

`components/LuckyDropManager.tsx` surfaces random point rewards ("Lucky Drops"),
limited to 3 per day. The point amount is calculated dynamically at drop time.

## Bounties

Community questions can attach a point bounty that transfers to the accepted answerer
(`transferBountyReward`). See [Community](./community.md).
