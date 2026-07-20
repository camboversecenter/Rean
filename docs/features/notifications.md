# Notifications

The in-app notification center keeps users informed about activity that concerns
them, delivered live over Supabase Realtime to the bell icon in the header.

## Who it serves

Every signed-in user. Each notification is private to its recipient.

## What triggers a notification

| Event                                        | Recipient       |
| -------------------------------------------- | --------------- |
| New reply on your question (incl. Kru REAN)  | Question author |
| Your answer was accepted (+20 XP)            | Reply author    |
| Someone reacted to your post or reply        | Content author  |
| Course enrollment approved/rejected/finished | Student         |
| Mission enrollment or payment status change  | Student         |
| New tutoring booking request                 | Tutor           |
| Booking accepted/declined/completed          | Student         |

Self-notifications are suppressed: acting on your own content never notifies you.

## Main screens

- **Header bell** (`components/NotificationBell.tsx`): unread badge, dropdown with
  two tabs — notifications and recent point activity. Clicking a notification marks
  it read and navigates to the relevant page (question, course, classroom, tutor).
- New notifications arrive without a refresh and surface a toast.

## Key rules

- The backend is created by `SUPABASE_NOTIFICATIONS.sql`: the `notifications`
  table, row-level security, and `SECURITY DEFINER` triggers on the community,
  enrollment, and booking tables.
- Clients can only **read**, **mark as read**, and **delete** their own rows.
  Inserting notifications from the browser is impossible; only database triggers
  (and the service role) create them, so the feed cannot be spoofed.
- All client access goes through `services/notificationService.ts`, which also
  degrades gracefully (empty feed, no errors) if the SQL file has not been run yet.
