# AI assistant UX — plan and rollout

Branch: `feat/ai-assistant-ux`

## Goals

- Chat-style UX: readable prose, smoother streaming, multiline input.
- **Personal context** from profile + saved city so vague questions have a default place.
- Trust: server-backed clear, fresh rate limit, sidebar matches tools.

## Implemented in this branch

| Item | Notes |
|------|--------|
| Personal context | `userContext` from `useAuth()` profile + `bitweather_city` fallback; validated on API and injected into system prompt. |
| Clear chat | `DELETE /api/chat` clears Supabase; trash button awaits it then clears UI. |
| Rate limit | Refetch after each completed assistant turn (`onFinish`). |
| Markdown | `react-markdown` for assistant messages. |
| Input | Textarea; Enter sends, Shift+Enter newline. |
| Quick actions / Try asking | One-shot send via `pendingSend` from `/ai`. |
| `?prompt=` | Auto-sends once (ref-guarded). |
| Sidebar | Volcanic row shows **Soon** until a tool exists. |
| Prompts | Personalities aligned with concise default, deeper on request; system prompt allows light Markdown. |
| Throttle | `experimental_throttle: 50` on `useChat` for smoother stream updates. |

## Follow-ups

- `@tailwindcss/typography` for richer markdown defaults.
- Geolocation “near me” with explicit permission UX.
- Personality-only hook on dashboard (avoid full `useChat` there).
- Volcano tool + restore live label.

## Verify locally

- `npm run lint`
- `npm run build` (Node >= 20.9)
- `npm run test:e2e` when touching `/ai`
