## Summary
This PR delivers a substantial UI pass across Games, Game Details, and Auth/Profile:

- Games list
  - Replaced big Share button with compact share icon; long-press to copy link.
  - Added quick "Add to calendar" icon (uses user default duration).
  - Filter bar with Today/Week chips, Clear filters chip, persisted filters, scroll-to-top on filter change.
  - Sticky offline/error banners with auto-retry and pill styling.
  - Optimistic join/leave with per-item pending state and error toasts.
  - Capacity signals: "Full" chip and "slots left" indicator.
  - Per-item ErrorBoundary to avoid the entire list breaking.

- Game details
  - Invite/share/QR/copy-link actions in header; invite acceptance confirmation with summary.
  - Add-to-calendar with selectable duration; preference persisted.
  - Open in Maps + Copy location.
  - Capacity warning banner when full.
  - Participants list with skeleton rows and non-blocking error banner.

- Auth/Profile
  - Edit Profile: avatar picker (gallery/camera), upload progress with cancel, remove photo (confirm), unsaved changes warning, reset changes, validation summary, keyboard avoidance.
  - Change Password screen polishing; new Change Email screen (client API).
  - Profile: shows avatar, quick links, and calendar duration preference.
  - Global Toast provider; optional NetInfo fallback; optional Clipboard fallback.

- Create Game
  - Validation (future date, positive max), form-level summary.
  - Description and client-only Duration minutes field (templated).
  - "Use last values" + "Reset template" saved via persisted store.

- Infra
  - ErrorBoundary component (cards).
  - Tests: validation utilities and template store.

## Screenshots / Videos
- Games list (share/calendar icons, chips) — see attached
- Game details (header actions, capacity, participants)
- Edit Profile (upload progress + cancel) and Create Game (validation summary)

## Test Plan
- Run app on iOS/Android:
  - Login → Create game → Verify validation errors (past date), then success toast, list invalidation.
  - From list: share icon opens native share; long-press copies link (toast).
  - Calendar icon opens Google Calendar with correct end time per preference.
  - Toggle filters (Today/Week/Joined); list scrolls to top and filters persist across restarts.
  - Go offline: sticky offline banner appears; join/leave disabled; back online re-enables.
  - Details: header actions (Share, Copy link, QR, Invite). Invite confirm shows summary and joins on confirm.
  - Participants: loading skeleton, error banner with Retry.
  - Capacity: when full, "Full" chip and disabled Join; slots-left text updates.
  - Profile: Edit (pick/cancel upload, remove photo confirm, reset), Change Password, Change Email (API stub).
- Web:
  - Clipboard fallbacks (navigator.clipboard) and banners render correctly.

## Checklist
- [ ] UI verified on iOS and Android
- [ ] No TypeScript errors (tsc) and no ESLint critical issues
- [ ] Jest tests passing: `npm test`
- [ ] No regressions in navigation (expo-router) and deep links
- [ ] env: `EXPO_PUBLIC_API_BASE_URL` optional; defaults to http://localhost:8080

## Follow-ups (tracked in docs/TODO.md)
- Owner: adjust max players (if backend supports)
- Offline cache (persist React Query)
- Accessibility audit and dark mode chip tones
- E2E flow tests and more unit tests (capacity, deep links, calendar/map helpers)
