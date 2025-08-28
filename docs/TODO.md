# Remaining UI TODOs (Prioritized)

High priority
- Games list
  - Staleness indicator: show "Updated X min ago" and refresh on pull or auto-interval.
  - End-to-end tests for filters + optimistic join/leave (happy/rollback paths).
- Game details
  - Owner action: adjust max players (if backend endpoint exists).
  - Unit tests for capacity logic (full/slots left).
- Auth/Profile
  - Change Email: display verification state (pending/verified) once exposed by backend.
  - Optional: username change flow if backend supports availability checks.

Medium priority
- Create/Edit game
  - Persist duration preference to details selector if changed in details.
  - Add richer date/time pickers (native) when @react-native-community/datetimepicker is available.
- Invites / Deep links
  - Add test: open invite deep link → confirmation → auto-join success.
  - Always-available QR: dynamic import is in place; consider bundling a tiny pure JS fallback for QR drawing.
- Offline and caching
  - Persist React Query cache (offline-first) and show "Showing cached data" banner when offline or network fails.
  - Sticky offline banner animation and improved contrast in dark mode.

Low priority / polish
- Accessibility
  - Audit labels/roles on all icon buttons, Dynamic Type text scaling, and sufficient color contrast.
- Visual polish
  - Card header icons alignment across platforms, chip tone for "Full"/"Joined" in dark mode.
- Testing
  - Add unit tests for:
    - parseLocalDateTime edge cases around DST and local timezone
    - createTemplate store: durationMinutes and reset template flows

Notes
- Backend base URL defaults to http://localhost:8080 and can be overridden via EXPO_PUBLIC_API_BASE_URL.
- Optional native modules (NetInfo, Clipboard, DateTimePicker, QR) are loaded safely via dynamic import; app works without them.
