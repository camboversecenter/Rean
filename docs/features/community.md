# Community (Lazy Learning)

"Lazy Learning" is REAN's Q&A-style community feed. Students post questions, others
reply, everyone reacts, and the best answer gets accepted. It is tightly integrated with
the gamification economy: participation earns XP and points, and questions can carry
point **bounties**.

**Relevant code:** `services/communityService.ts`, `services/bookmarkService.ts`,
`components/CommunityFeed.tsx`, `components/ReactionBar.tsx`,
`pages/QuestionDetailPage.tsx`, `documents/LazyLearningDoc.tsx`.

## Who uses it

- **All authenticated users**, primarily Students. The feed is protected (login
  required to post and interact).

## Posts and Replies

- A user creates a question/post with `createStudentPost` (`types.ts` → `StudentPost`).
- Others reply with `createCommunityReply` (`CommunityReply`) and can edit with
  `updateCommunityReply`.
- The feed is loaded with `fetchCommunityFeed`; a single thread with `fetchPostById`
  and `fetchReplies`.

## Reactions

Users react to posts and replies with `toggleReaction`. Reaction counts are tracked per
type (`ReactionCounts`) and shown in the `ReactionBar`. Receiving a like awards XP to
the author.

## Accepted Answers

The post author can mark one reply as the accepted solution (`acceptAnswer`). This is
the highest-value community action: the answerer earns a large XP reward (Solution
Accepted = 20 XP), and any attached bounty is transferred to them.

## Bounties

A question can offer a **point bounty** to whoever answers it best. When an answer is
accepted, the bounty points are transferred from the asker to the answerer
(`transferBountyReward` in the gamification service). Bounty payout is a system action
and carries no AI cost.

## AI in the Community

Users can tag the AI (`@tonsay`) in a post to get an AI-generated answer
(`chatWithAiTag`). This costs 10 points and routes through the `ai-assistant` edge
function like other AI features.

## Bookmarks

Users can save posts to read later:

- `toggleBookmark` saves/unsaves a post.
- `fetchBookmarkedPostIds` and `fetchSavedPosts` power the saved list.

## Earning rules (summary)

| Action            | XP  | Points | Daily limit |
| ----------------- | --- | ------ | ----------- |
| Post a question   | 5   | 0      | 5           |
| Helpful reply     | 2   | 1      | 5           |
| Receive a like    | 1   | 0      | 20          |
| Solution accepted | 20  | 0      | unlimited   |

See [Gamification & Economy](./gamification.md) for the full ruleset.
