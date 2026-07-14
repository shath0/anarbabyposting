# pathetic anarchist bot

A Bluesky bot that posts procedurally-generated tweets from the desk of an armchair revolutionary.

## setup

1. On Bluesky: Settings → App Passwords → create one for this bot. Use the app password, not your account password.
2. `npm install` (the included `.npmrc` disables install scripts and pins exact versions).
3. Set credentials — locally via a `.env` file (copy `.env.example`), or in your host's secrets store.

## run

```bash
npm run dry      # generate + print one post, no login, no posting
npm start        # post once, then exit  — use this with a scheduler
npm run loop     # stay running, post every POST_INTERVAL_MINUTES (default 240)
```

## scheduling

The one-shot `npm start` is more robust than an in-process loop — if the process dies, the scheduler just runs it again next time. Two easy options:

### GitHub Actions (free, no server)

`.github/workflows/post.yml`:

```yaml
name: post
on:
  schedule:
    - cron: "0 */4 * * *"   # every 4 hours
  workflow_dispatch:
jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci --ignore-scripts
      - run: node bot.js
        env:
          BLUESKY_HANDLE: ${{ secrets.BLUESKY_HANDLE }}
          BLUESKY_APP_PASSWORD: ${{ secrets.BLUESKY_APP_PASSWORD }}
```

Add the two secrets under repo Settings → Secrets and variables → Actions.

### Railway

Deploy the repo, add `BLUESKY_HANDLE` and `BLUESKY_APP_PASSWORD` as variables, then either
use a Railway cron schedule with start command `node bot.js`, or set the start command to
`node bot.js --loop` for a single always-on service.

## customising the voice

All the phrasing lives in the `openers` / `acts` / `excuses` / `closers` arrays at the top of
`bot.js`. Add or swap lines there — the generator mixes them at random each post.

## security notes

- `.npmrc` sets `ignore-scripts=true`, `save-exact=true`, and a 7-day minimum release age —
  defences against the 2026 npm supply-chain attacks.
- `@atproto/api` is pinned to `0.20.9`. Before bumping, check the new version is >7 days old and
  search "@atproto/api@<version> compromise OR CVE".
- The app password is a credential: keep it in secrets, never in the repo. `.env` is gitignored.
