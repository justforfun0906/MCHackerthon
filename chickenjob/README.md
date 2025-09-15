# chickenjob

Mobile-first web app to help people find and post part-time work. Built with Vue 3 + Vite. Optimized for cloud-phone environments (limited bandwidth, touch-first, intermittent sessions).

## MVP Scope

- Job discovery: browse list, basic search, filter by location/type.
- Job details: title, company, pay, type, location, description, tags, contact.
- Simple apply/contact: open `tel:`, `mailto:`, or external link.
- Lightweight job posting form (no auth for MVP; future: basic auth/profile).
- Mobile-first UX: fast load, lazy routes, small assets, offline-friendly later.

## Primary Flows

- Seeker: Open Home → Search/Filter → Open Job → Contact.
- Poster: Open Post Job → Fill form → Publish → Redirect to listing.

## Cloud-Phone Considerations

- Keep bundles small: code-split routes, avoid heavy deps, cache aggressively.
- Input UX: large tap targets, minimal typing, sensible defaults.
- Resilience: optimistic UI, graceful error states, timeouts for slow networks.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

Then open the printed local URL in your browser or cloud-phone client.

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Roadmap

- v0: In-memory mock data service for jobs (no backend).
- v1: Minimal backend (REST) with auth and persistence.
- v2: PWA: offline cache, add-to-home-screen, background sync.

