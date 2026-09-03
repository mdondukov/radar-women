# radar-women

Frontend for "Женщины Ферганы" ("Тынчтык булагы — аялдардын климаттык жана
суу коопсуздугу үчүн бирикмеси"), a climate-vulnerability self-assessment
for women's communities in the Fergana valley (Kyrgyzstan). Deployed at
[radar-women.biom.kg](https://radar-women.biom.kg).

This is a sibling of [`calc-web`](../calc-web) ("Жашыл климат"), not a
fork-with-shared-history — it was cloned from `calc-web` wholesale and then
re-themed (own logo, partner-logo lineup, Jamilya illustrations, color
palette, typography) while keeping the same architecture and most of the
component code unchanged. Both frontends talk to the same
[`radar_api`](../radar_api) backend, distinguished only by
`REACT_APP_PROJECT_CODE` (`fergana-women` here, `zhashyl-climate` there).

## Stack

Create React App + TypeScript, MobX (`mobx`/`mobx-react-lite`) for state,
React Router v6, `react-intl` for i18n (ru/ky), Tailwind CSS for styling,
`@nivo/radar` for the radar chart, `react-markdown` + `remark-gfm` for
content fields that carry markdown (lists, links), Axios for HTTP.

## App flow

```
Home  →  Instruction  →  Poll
                           ├─ Region step        (map of Kyrgyzstan, once)
                           ├─ Assessment step ×9  (Questions → Resume, per показатель)
                           └─ Radar step          (chart + collected recommendations)
```

Показатели can be filled in any order — the header icons are all clickable
once a region is picked. The region stays first (the radar dereferences the
chosen area) and the radar stays last: it averages every indicator, so
opening it early would score unanswered ones as zero.

Each "показатель" (indicator) is one assessment step: a `Questions` screen,
then — once every question in that step is answered — a `Resume` screen
(average score, an optional `step.descr` risk-zone narrative, and a
"Рекомендации" card built from `answer.recommendation` + `indicator.risk_text`
fetched from `/summary`). The final Radar step renders the `@nivo/radar`
chart, a "География" card (the picked region's `area.impact` text), and a
second "Рекомендации" card collecting every indicator's recommendations in
step order — plus a "Скачать результат" button (`window.print()`; the
`print:`-variant Tailwind classes and the `@media print` block in
`index.css` are what make that produce a readable PDF instead of a raw
screenshot of the SPA chrome).

## Project layout

```
src/
  pages/       — Home, Instruction, Poll (route-level components)
  components/  — Assessment, Questions/Question, Resume, Region, Radar,
                 header/ (Header, Navigation, Logo), buttons/, common/
                 (Loader, Modal, Alert, Linkify)
  store/       — MobX stores: StepStore, QuestionStore, RegionStore,
                 SummaryStore, UIStore (locale), MessageStore
  http/        — axios instance + api.ts (fetchSteps/fetchRegions/
                 fetchAssessment/fetchIndicators, all under
                 /v1/{PROJECT_CODE}/poll/...)
  i18n/        — messages-ru.json / messages-ky.json (UI chrome strings —
                 the questionnaire content itself is server-side i18n,
                 resolved by radar_api per the `locale` header; the app also
                 sends `secondary-locale` and shows both languages at once,
                 see UIStore.secondaryLocale / contentLocale)
  types/       — TS mirrors of the backend's Pydantic schemas
public/md/     — static markdown shown outside the questionnaire content
                 (intro/welcome/tutorial/farewell, ru+ky)
```

Questionnaire content (question text, answers, recommendations, risk-zone
narratives, region descriptions) is **not** in this repo — it lives in
`radar_api`'s database and is fetched at runtime. This repo only owns UI
chrome text, static onboarding copy, and the visual design.

## Running locally

```bash
npm install
npm start   # http://localhost:3000
```

Create a `.env.local` (gitignored) pointing at a local `radar_api`:

```
REACT_APP_API_URL='http://localhost:8686/'
REACT_APP_PROJECT_CODE='fergana-women'
```

The committed `.env` holds the production values instead
(`https://radar.biom.kg/radar/`) — CRA prefers `.env.local` over `.env` in
every environment except `test`, so local dev always overrides prod without
touching the tracked file.

## Docker build

```bash
bash ./env/dev/docker/build.sh kg.biom/radar-women:dev
```

`env/dev/docker/Dockerfile` is `node:18-alpine`, `npm run build`, then
serves the static `build/` via `serve -s build` on port 3000. Because CRA
bakes `REACT_APP_*` vars in at **build time**, whatever `.env`/`.env.local`
exists in the build context wins — `.dockerignore` excludes `.env.local`
(and friends) specifically so a developer's local-API override never leaks
into a production image; only the committed `.env` (prod URL) gets baked
in. There's also an `env/prod/docker/Dockerfile` (nginx-based static serving)
that isn't currently used and isn't actually functional as-is (its
`RUN npm run build` line is commented out) — the deployed image is the
`env/dev/docker/Dockerfile` one described above, same as `calc-web`'s.

## Deployment

No CI yet — deployment is manual, mirroring `calc-web`'s setup:

```bash
bash ./env/dev/docker/build.sh kg.biom/radar-women:dev
docker save kg.biom/radar-women:dev | ssh aws.biom.node1 "docker load"
ssh aws.biom.node1 "cd /opt/docker/compose/biom_app && \
  docker compose up -d --force-recreate radar-women"
```

Unlike `calc-web` (which is served through the shared Docker `proxy`
container's path-based routing, since it owns the `/` route on
`radar.biom.kg`), `radar-women` is a genuinely separate domain and gets its
own dedicated container port instead — `docker-compose.yml`'s
`radar-women` service publishes `3004:3000`, and a Certbot-managed
host-level nginx site (`/etc/nginx/sites-enabled/radar-women.biom.kg`,
modeled on `next.biom.kg`/`justice.biom.kg`) proxies straight to
`node1:3004`. The shared Docker `proxy/nginx.conf` has no `Host`-based
routing at all (just one generic `server_name localhost;` block doing
path-based routing for `calc-web`/`radar-api`), so reusing its port for a
second, unrelated frontend was not an option.

Because this frontend calls `radar_api` cross-origin (its own pages are
served from `radar-women.biom.kg`, its API calls go to
`radar.biom.kg/radar/`), the backend's `RADAR_CORS_ORIGINS` must include
`https://radar-women.biom.kg` — see `radar_api`'s README.

## Branding notes

The color system overrides Tailwind's default `lime`/`blue`/`amber` scale
names in `tailwind.config.js` (green+blue from the project logo for
headings/buttons, a soft lilac tint of Jamilya's robe as the page
background, her red skirt as a small accent color) — every existing
`lime-*`/`blue-*`/`amber-*` utility class site-wide picks the brand colors
up automatically, no component changes needed. Body/reading text is black
(`text-gray-900`) everywhere; blue is reserved for headings, links, and
interactive states. Headings use PT Sans Narrow, body text PT Sans (loaded
from Google Fonts in `public/index.html`).

Per-показатель illustrations (`src/assets/img/jamilya/indicator_*.png`) are
picked by `step.code` in `Resume.tsx`'s `INDICATOR_ILLUSTRATIONS` map, with
the generic `jamilya_instr.png` as a fallback for any step without
dedicated art. These — and the Home/Instruction hero illustrations — are
sized with `max-h-[520px] w-auto max-w-full` rather than a fixed height:
a fixed `h-[…px]` with no width constraint distorts the aspect ratio
whenever the sidebar column narrows below the image's natural width at
that height (this actually happened on iPad landscape, where the layout is
wide enough to trigger the `xl:` two-column grid but not wide enough for a
520px-tall image at its natural aspect ratio to fit the sidebar column).
