# PRD: Weekly Newsletter Generator Redesign (Revised)

**Project:** 16bitweather.co
**Owner:** Justin
**Status:** Approved v2 (post-recon, decisions locked 2026-04-26)
**Target executor:** Claude Code
**Supersedes:** PRD v1 (in chat history). Open questions §8 from v1 are resolved here.

---

## 1. Problem Statement

The current weekly blog generator (`scripts/generate-blog-post.ts`, GitHub Actions on Sun + Wed) produces output that is (a) repetitive in tone, phrasing, and framing across runs, and (b) thinner than it should be on subject-matter depth. Root cause: the job is **stateless**. Each run generates content with no awareness of prior issues, so the model defaults to similar phrasings, similar narrative structures, and the same handful of thematic frames week after week.

The two existing scheduled cadences (Wed deep-dive, Sun "This Week in Weather") are correct in shape but weak in execution: Wednesday rotates through only 5 deterministic topics by ISO week, and Sunday's "rearview" depends on data sources that only expose *current* state (NWS active alerts) rather than the past 7 days.

This PRD specifies a rebuild that introduces persistent state via post frontmatter, expands the topic surface area to 15, integrates Iowa State Mesonet for genuine past-week recap, and tightens the editorial voice.

## 2. Goals

1. **Every issue is meaningfully unique.** No repeated openers, no recycled metaphors, no near-duplicate framings of the same phenomenon within a rolling **12-week window**.
2. **Wednesday issues are topic-driven deep-dives** drawn from the 15-topic catalog (§4.2), each tethered to a current news angle.
3. **Sunday issues are "Rearview + Roadmap"** — recap of the prior week's notable weather (citing real events from real data) plus a narrative outlook for the week ahead.
4. **State is persisted in post frontmatter** so the model can see what has already been covered and how — no new infra.
5. **Quality is verifiable.** Each run logs metrics (topic, theme, similarity score vs. prior issues, word count, model used) for review.

## 2.1 Non-Goals

- Redesigning the public-facing blog UI or RSS feed.
- Changing the underlying weather data sources for the live app.
- Image, video, or audio *generation*. (Image *selection* from a curated catalog is in scope.)
- New Supabase tables, pgvector, or any embedding provider.
- Email distribution, A/B testing, multilingual output, subscriber personalization, or a UI for editing prompts/topics.

---

## 3. Current State (verified 2026-04-26)

| Aspect | Reality |
|---|---|
| Generator script | `scripts/generate-blog-post.ts` (404 lines) |
| Workflow | `.github/workflows/weekly-blog.yml` — single file, branches on day-of-week |
| Schedule | Sun 12:00 UTC ("This Week in Weather"); Wed 12:00 UTC (5-topic ISO rotation) |
| Manual trigger | `workflow_dispatch` enabled |
| Publish path | Auto-PR by `16bitbot` → markdown file in `content/blog/` → human merge |
| Storage | Markdown files in `content/blog/*.md`. No Supabase blog tables. |
| LLM call | Direct REST to Anthropic, model `claude-sonnet-4-20250514` (older than current Sonnet 4.6) |
| Image system | Curated 20-image public-domain catalog with HEAD-check validation; 2 images required per post |
| Spotlight | `scripts/blog-spotlight.ts` (untracked) — date-windowed editorial overlays |
| Voice (existing) | Folksy / "y'all" / colloquial. **To be replaced.** |
| Past-week data | NWS active alerts only — no historical/past-7-day source wired up |
| pgvector | Not enabled. Not used. |

---

## 4. Functional Requirements

### 4.1 State Persistence — Frontmatter, not Supabase

Run metadata is appended to the existing post markdown frontmatter. **No Supabase changes.** History is the union of all `content/blog/*.md` files filtered to the last 12 weeks.

**Extended frontmatter schema:**

```yaml
---
slug: 2026-04-29-volcanoes-and-the-stratosphere
title: ...
date: 2026-04-29T12:00:00Z
author: 16bitbot
summary: ...
tags: [...]
heroImage: ...
readTime: 8

# New fields (added by this redesign)
cadence: wednesday_topic        # 'wednesday_topic' | 'sunday_rearview'
topic_slug: volcanoes           # null for Sunday
topic_title: Volcanoes & Atmospheric Impact
theme: how recent SO2 emissions tie into stratospheric chemistry
opener_hash: a8c3f1d2            # normalized hash of first 30 words
key_phrases:
  - sulfate aerosol blanket
  - VAAC bulletin radius
  - tropospheric cooling lag
  - ...
similarity_max: 0.62             # max judge similarity vs. last 12 weeks
similarity_judge: claude-sonnet-4-6
model_used: claude-opus-4-7
images_used:                     # for cross-post image-reuse window
  - noaa-eruption-plume-2024.jpg
  - usgs-kilauea-vent.jpg
spotlight_active: null            # spotlight string if one fired this run
generation_retries: 0
word_count: 742
---
```

**`opener_hash`** is a stable hash of the first 30 words after lowercasing, stripping punctuation, and removing English stopwords. Cheap dedupe signal; collisions force a first-paragraph rewrite.

**`key_phrases`** is populated by a separate Sonnet 4.6 call (low temperature) that asks the model to extract its own 5–10 most distinctive phrases. Future runs receive the union of last-12-weeks key_phrases as a "do not repeat" list.

**History lookback:** A small reader in `scripts/newsletter/state.ts` parses `content/blog/*.md`, filters to `date` within last 12 weeks, and exposes:
- `getRecentByCadence(cadence): Post[]`
- `getKeyPhraseDenyList(cadence): string[]`
- `getOpenerHashes(cadence): string[]`
- `getRecentImages(weeks: number): string[]`
- `getTopicWeeksSinceLastUsed(): Map<TopicSlug, number>`

### 4.2 Wednesday Cadence — Topic Deep-Dive

**Editorial purpose:** Pick one topic from the 15-topic catalog, tether it to a current news angle, write a substantive ~600–900 word piece. The reader leaves knowing something they did not know that morning.

**Topic catalog (15 — full replacement of the current 5):**

| Slug | Title | Scope |
|---|---|---|
| `volcanoes` | Volcanoes & Atmospheric Impact | Eruptions, sulfate aerosols, climate cooling, VAACs |
| `ocean_currents` | Ocean Currents & Heat Transport | Gulf Stream, AMOC, ENSO, marine heatwaves |
| `cryosphere` | The Cryosphere | Sea ice, glaciers, permafrost, albedo feedback |
| `severe_storms` | Severe Convective Storms | Tornadoes, supercells, derechos, hail formation |
| `tropical` | Tropical Systems | Hurricanes, typhoons, monsoons, MJO |
| `atmosphere_layers` | Atmospheric Structure | Stratosphere, mesosphere, jet streams, SSWs |
| `space_weather` | Space Weather | Solar flares, CMEs, auroras, geomagnetic storms |
| `historical_events` | Historical Weather Events | Year Without a Summer, Galveston 1900, Dust Bowl |
| `biometeorology` | Biometeorology | How weather affects biology — migration, allergies, mood |
| `urban_climate` | Urban Climate | Heat islands, urban canyon effect, microclimate |
| `aviation` | Aviation Weather | Turbulence, icing, contrails, wind shear |
| `marine` | Marine Weather | Rogue waves, fog, sea state, weather routing |
| `agricultural` | Agricultural Weather | Growing degree days, frost risk, drought indices |
| `paleoclimate` | Paleoclimate | Ice cores, tree rings, proxies, climate of deep time |
| `tech_and_models` | Forecasting Tech | Numerical models, ensemble forecasting, ML in weather |

The catalog lives in `scripts/newsletter/topics.ts` with 3+ sentence extended descriptions per topic used as system-prompt context when selected.

**Selection algorithm — topic-first, news-tethered:**

1. Score each of the 15 topics: `score = weeks_since_last_used` (topics never used in last 12 weeks score 99).
2. Weighted-random pick from the **top 5** scoring topics. Avoids strict round-robin (predictable) while preventing recent reuse.
3. After the topic is chosen, fetch current news (existing `app/api/news/aggregate` plus topic-relevant feeds) and have the model identify the strongest news angle for that topic. If no fresh angle exists, the post leans evergreen-educational with a brief acknowledgment of "no major movement on this front this week" rather than fabricating relevance.
4. Log the selection rationale to GitHub Actions output.

**Wednesday generation pipeline:**

1. Load topic rotation state from `content/blog/*.md` history.
2. Select topic (above).
3. Pull last 12 weeks of Wednesday posts' `key_phrases`, `theme`, `opener_hash` from frontmatter.
4. Pull current news + atmospheric data (existing API surface + any topic-specific source).
5. Pull spotlight overlay if active (`scripts/blog-spotlight.ts`).
6. Construct prompt:
   - **System:** Voice spec (§4.4), topic context from catalog, spotlight if any.
   - **Context:** News angle, atmospheric data.
   - **Constraints:** "Do not open with any of these phrasings: [past openers]. Do not lean on these phrases: [aggregated key_phrases from last 12 weeks]. Pick a fresh angle."
7. Generate (Opus 4.7). Run anti-repetition checks (§4.4). Regenerate up to 2 times if fail.
8. Extract key phrases (Sonnet 4.6, temperature 0).
9. Compute opener hash.
10. Compute similarity_max (Anthropic-as-judge — Sonnet 4.6).
11. Select 2–3 images from expanded catalog excluding any used in last 8 weeks.
12. Write markdown with full frontmatter to `content/blog/`.
13. Auto-PR via existing 16bitbot flow.

### 4.3 Sunday Cadence — Rearview + Roadmap

**Editorial purpose:** Two-part structure.

- **Part 1: Rearview (~250–350 words).** Recap the most notable weather of the past 7 days. Specific — named storms, records broken, anomalies. Pulls from real data, not hallucinated.
- **Part 2: Roadmap (~350–500 words).** What to expect in the week ahead. Temperature trends, precipitation patterns, anything notable on the horizon (tropical activity, severe risk windows, cold snaps, heat domes). Includes a few regional cuts (CONUS quadrants + a notable international callout).

**Data sources (all free, no API key required):**

| Source | Use | Status |
|---|---|---|
| **Iowa State Mesonet** | Authoritative archive of NWS products — past-7-day alerts/warnings, station observations, daily climate summaries | **NEW — to be wired** |
| **NOAA SPC daily reports** | Storm reports (tornado, hail, wind) per day for past week | **NEW** |
| **Open-Meteo Historical Forecast API** | ERA5-backed climate variables for international callouts and global Roadmap regional cuts | **NEW** |
| NWS API forecast | 7-day US forecast outlook for Roadmap | Available |
| NOAA SWPC | Space weather past + outlook | Already wired |
| USGS earthquakes | Significant week feed | Already wired |

**Sunday generation pipeline:**

1. Pull past 7 days from Iowa Mesonet + SPC + existing space/seismic feeds.
2. Score events (record-setting, casualty-causing, geographically broad, or simply unusual). Top 3–5 selected.
3. Pull 7-day forecast outlook with regional cuts.
4. Pull last 12 weeks of Sunday posts' `key_phrases` and `opener_hash` for anti-repetition.
5. Pull spotlight overlay if active.
6. Generate with strict structure: `## Rearview` then `## Roadmap`.
7. Run anti-repetition check (§4.4).
8. Extract key phrases, compute similarity, pick images, persist via PR.

**Hard rule — no fabrication.** If Iowa Mesonet returns nothing for the past week (network failure, schema change, etc.), the workflow **fails loudly** rather than producing a Rearview from imagination. Fall back to "Rearview unavailable; data feed error" only with explicit operator approval via workflow input — not by default.

### 4.4 Voice & Anti-Repetition

**Voice (replaces existing folksy voice):**

- Professional, intelligent, interesting. Audience is technically literate but not specialist.
- California-tech sensibility — direct, informed, occasionally dry. Not Kentucky-folksy.
- Specific over general. Names, places, numbers, dates.
- One concrete image or analogy per piece, not a parade.
- **Forbidden:** "y'all," "Mother Nature," "calm before the storm," "bone dry," "crash the party," "as the saying goes," "in today's edition…," "as we head into…," any other filler opener or weather cliché.
- **Forbidden:** emojis. Anywhere. PRs, README, commit messages, generated content.
- **Required structure:** ends with `## Bottom Line` (2–3 actionable takeaways). Inherited from existing system, kept because readers expect it.
- **Required structure:** 2–3 inline images, separated, neither at very top nor very bottom.

**Anti-repetition mechanism (Anthropic-as-judge — no embeddings):**

After generation, before publish:

1. Compute `opener_hash` of the new draft. If it collides with any post in last 12 weeks, force regeneration of just the first paragraph.
2. Pass last 12 weeks of same-cadence posts (titles + first 200 words + key_phrases) plus the new draft to Sonnet 4.6 with the question: "Score 0–1 how much this new draft overlaps in framing, voice, and angle with each prior post. Return JSON with per-post score and a summary of the highest overlap." Take `similarity_max = max(scores)`.
3. If `similarity_max > 0.85`: regenerate with the strongest overlap quoted in the constraints. Up to 2 retries.
4. If still failing after retries: persist anyway with `similarity_max` recorded for monitoring. Goal is observability, not gating.

The judge is also asked: "If similarity is high, name the specific phrases or framings that triggered it." Those phrases get added to the next run's deny-list, creating a self-correcting feedback loop.

### 4.5 Image Catalog Expansion

The existing 20-image curated catalog (`scripts/generate-blog-post.ts` lines 165-226 area) expands to **60+ public-domain entries** covering all 15 topics roughly evenly. Sources: NOAA, NASA, USGS, Wikimedia Commons (CC0 / PD only).

- 2–3 images per post.
- **No image reused within last 8 weeks** (queried from `images_used` frontmatter field across history).
- HEAD-check validation preserved from existing system; broken URLs stripped automatically.
- Catalog entry shape: `{ id, url, caption, credit, topic_tags[], license }`.

### 4.6 Spotlight (Preserved)

`scripts/blog-spotlight.ts` is preserved as-is and integrated into both Wed and Sun pipelines as an editorial-override layer. When `getSpotlight()` returns a non-null string, that string is appended to the system prompt as a soft instruction. The fact that a spotlight fired is recorded in `spotlight_active` frontmatter for traceability.

The existing Jest test (`__tests__/generate-blog-post-spotlight.test.ts`) is preserved.

---

## 5. Technical Design

### 5.1 File Layout

```
scripts/
  generate-blog-post.ts             # KEPT as legacy entrypoint for one rollback week, then deleted
  blog-spotlight.ts                 # KEPT
  newsletter/
    index.ts                        # entrypoint — dispatches to wednesday or sunday
    wednesday.ts                    # topic deep-dive pipeline
    sunday.ts                       # rearview + roadmap pipeline
    topics.ts                       # 15-topic catalog with extended descriptions
    images.ts                       # 60+ image catalog with topic tags + license
    state.ts                        # frontmatter reader/writer, history queries
    repetition.ts                   # opener-hash, key-phrase extraction, judge call
    voice.ts                        # shared system-prompt fragments
    news.ts                         # news angle finder (uses /api/news/aggregate)
    data/
      mesonet.ts                    # Iowa State Mesonet client
      spc-reports.ts                # NOAA SPC daily reports parser
      space-weather.ts              # wraps existing SWPC fetchers
      earthquakes.ts                # wraps existing USGS feed
      forecast.ts                   # 7-day outlook with regional cuts
    publish.ts                      # writes markdown file (existing flow, refactored out)
    README.md                       # local-run, manual-dispatch, table-inspection notes
.github/
  workflows/
    newsletter-wednesday.yml        # NEW — replaces day-of-week branch in weekly-blog.yml
    newsletter-sunday.yml           # NEW
    weekly-blog.yml                 # KEPT for one rollback week disabled by removing schedule, then deleted
__tests__/
  newsletter/
    topics.test.ts                  # rotation algorithm
    repetition.test.ts              # opener hash, key-phrase extraction
    state.test.ts                   # frontmatter parsing, 12-week filter
    images.test.ts                  # 8-week reuse window
    voice.test.ts                   # forbidden-phrase regex
  generate-blog-post-spotlight.test.ts  # KEPT
content/blog/                       # unchanged; new posts get extended frontmatter
```

Splitting Wed and Sun into separate workflow files (rather than one workflow with branching logic) makes cron schedules and failure modes easier to reason about.

### 5.2 GitHub Actions Configuration

Both workflows need:
- `ANTHROPIC_API_KEY` (existing)
- `contents: write` and `pull-requests: write` (existing)
- No new secrets — all data sources are free and key-free for the endpoints used.

Cron (UTC) — preserved from current schedule:
- Wednesday: `0 12 * * 3`
- Sunday: `0 12 * * 0`

`workflow_dispatch` enabled on both with optional `dry_run: boolean` input that runs the full pipeline, prints output to logs, but skips the file write + PR step. Useful for prompt-tuning iterations without polluting `content/blog/`.

### 5.3 Model Choices

- **All calls use `claude-sonnet-4-6`.** Single-model design chosen for cost predictability on a 2-post/week cadence with up-to-3 retries per run plus auxiliary calls. Quality is sufficient at Sonnet 4.6; can be upgraded later via env var if needed.
  - Generation: `claude-sonnet-4-6`, temperature 0.7.
  - Key-phrase extraction: `claude-sonnet-4-6`, temperature 0.
  - Anthropic-as-judge similarity: `claude-sonnet-4-6`, temperature 0.
  - News-angle identification: `claude-sonnet-4-6`, temperature 0.2.
- **Prompt caching** enabled on the system prompt + topic catalog context (reused across the up-to-3 generation attempts per run). Cache TTL sufficient to cover one run end-to-end.
- Model ID configurable via env var `NEWSLETTER_MODEL` for upgrade or A/B without redeploy.

### 5.4 Observability

Each run logs to GitHub Actions output:
- Topic selected + selection rationale
- News angle identified
- `similarity_max` and which prior post triggered the closest match
- Retry count
- Word count
- Models used
- Spotlight active (if any)
- Image IDs selected

The full frontmatter on each generated post is the durable record — no separate metrics store.

GitHub-issue-on-failure is **deferred to v2**. Failed runs surface via standard GitHub Actions notifications.

---

## 6. Acceptance Criteria

The work is done when:

1. `scripts/newsletter/topics.ts` exists with all 15 topics and ≥3-sentence extended descriptions per topic.
2. `scripts/newsletter/images.ts` exists with ≥60 public-domain entries, license + credit + topic tags per entry, all URLs HEAD-validated at build time.
3. Two GitHub workflow files exist (`newsletter-wednesday.yml`, `newsletter-sunday.yml`), runnable via manual dispatch with `dry_run` input.
4. Wednesday workflow, when run, selects a topic via the weighted-rotation algorithm, identifies a current news angle, generates a 600–900-word post in the new voice, runs the similarity check, persists the post with extended frontmatter, opens a PR.
5. Sunday workflow, when run, generates a Rearview citing specific past-week events from Iowa Mesonet + SPC + existing feeds, generates a Roadmap, persists with extended frontmatter, opens a PR.
6. Iowa Mesonet integration handles network/data failure by failing the workflow rather than producing fabricated content.
7. `scripts/blog-spotlight.ts` continues to function and is integrated into both pipelines.
8. Voice spec is enforced via a forbidden-phrase regex sweep on output (rejects "y'all", clichés, emojis); violations regenerate.
9. After 3 manual dispatches per cadence on a feature branch, no two issues share an `opener_hash`, no pair has judge-similarity > 0.85, no image is reused within 8 weeks, and no forbidden phrases appear.
10. `scripts/newsletter/README.md` documents local execution, manual dispatch, frontmatter inspection, and how to add to the topic + image catalogs.
11. Knip (`npm run knip`) reports no orphaned exports introduced by this change.

---

## 7. Edge Cases

| Case | Behavior |
|---|---|
| First run, empty history | Similarity checks pass trivially. Topic picked from full pool. No errors. |
| All 15 topics used in last 12 weeks | Fall back to least-recently-used. Log a note suggesting catalog expansion. |
| LLM API rate-limited or down | Exponential backoff up to 3 retries, then fail the workflow. |
| Iowa Mesonet returns empty for the past week | Fail the workflow. Do not produce a Rearview from imagination. |
| Generated post under 400 words | Treat as generation failure, regenerate once with explicit length instruction. |
| Forbidden-phrase regex hit | Regenerate up to 2 times. If still hits on attempt 3, persist with `voice_violations` field set and surface in logs (don't block — surface for tuning). |
| Image catalog HEAD-check fails for a candidate | Fall back to next candidate in topic's tagged list. If <2 valid images remain after fallback, fail with a "catalog needs maintenance" error. |
| Spotlight active but conflicts with selected topic | Spotlight wins for that run — its instruction is appended to the system prompt regardless. |
| News-angle call returns nothing for the topic | Generate evergreen-educational with a one-sentence acknowledgment that there's no major news on this front. Do not fabricate a news hook. |

---

## 8. Resolved Decisions (was Open Questions in v1)

| v1 Question | Resolution |
|---|---|
| Where do posts live? | Markdown in `content/blog/` (verified). Frontmatter is the persistence layer. |
| What weather data is wired up? | NWS active alerts, NOAA SWPC, USGS earthquakes. **Iowa Mesonet to be added.** SPC daily reports added as complement. |
| pgvector enabled? | No. Not used. Anthropic-as-judge replaces vector similarity. |
| Existing voice guide? | Existing voice (folksy/"y'all") replaced by California-tech professional voice in §4.4. |
| Rate limits? | None hit currently; prompt caching on Opus + retry-with-backoff is the safety net. |

## 9. Rollout Plan

1. Implement on feature branch `feature/newsletter-redesign`.
2. Run both workflows via `workflow_dispatch` with `dry_run: true` at least 3 times each. Inspect outputs in Actions logs.
3. Run with `dry_run: false` once per cadence; review the resulting PR + frontmatter manually.
4. Tune similarity threshold, topic weights, voice deny-list, and prompts based on observation.
5. Cut over: PR replaces `weekly-blog.yml` schedule with the two new workflow files. Old script (`scripts/generate-blog-post.ts`) renamed to `*.legacy.ts` for one week as rollback option, then deleted.

## 10. Out of Scope (Explicit, v1)

- Email distribution / mailing list integration
- A/B testing of voices
- Multilingual output
- Image or chart generation (only catalog selection)
- Subscriber personalization
- Web UI for editing prompts or topics — catalog edited in code
- Supabase tables, pgvector, or any embedding provider
- GitHub-issue-on-failure (deferred to v2)
- Analytics, view counts, or performance tracking
