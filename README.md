# 🌒 jbalibrea.dev

Personal portfolio and (Spanish-language) blog of Jorge Balibrea, a full stack developer based in Murcia. It is also the project where I try out new tooling, so expect it to evolve.

Live at **https://jbalibrea.dev**.

## ⚙️ Stack

- **[Astro 7](https://astro.build)**: fully static output, content collections, view transitions.
- **MDX** for the blog, with a custom Markdown pipeline (`plugins/`): table of contents, reading time, GitHub-style admonitions, Shiki dual themes with a copy button.
- **React** only where it is needed (contact form and Giscus comments); everything else is plain Astro.
- **Tailwind CSS v4**, configured in CSS (`src/styles/global.css`: `@theme`, `@plugin`, `@custom-variant`).
- **Cloudflare Worker** (`worker/contact/`) behind the contact form: Turnstile + Resend + rate limiting.
- **Docker + nginx**, deployed to a VPS behind Traefik through GitHub Actions and GHCR.

## 📦 Getting started

Requires Node 22 (see `.nvmrc`) and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/jbalibrea1/jbalibrea.dev.git
cd jbalibrea.dev
pnpm install
pnpm dev          # http://localhost:4321
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on port 4321 |
| `pnpm build` | `astro check` (type check) + `astro build` → `dist/` |
| `pnpm preview` | Serve the production build |
| `pnpm lint` | ESLint (Astro, a11y, TypeScript, React hooks) |
| `pnpm format` | Prettier |

Or with Docker: `docker compose -f docker-compose.dev.yml up`.

## 🗂️ Project structure

```text
src/
  components/    Astro components and the few React islands
  content/posts/ Blog posts (.mdx, or <slug>/index.mdx with colocated assets)
  data/          Static data (repositories page)
  layouts/       BaseLayout → BlogLayout / MarkdownPostLayout
  pages/         Routes (home, blog, archive, tags, repositories, contact, RSS)
  styles/        Tailwind entry point, fonts and Markdown styles
  utils/         Small helpers (sorting, canonical URL, cn…)
plugins/         Remark/Shiki plugins used by the Markdown pipeline
worker/contact/  Cloudflare Worker for the contact form (separate project)
```

## ✉️ Contact form

The form posts JSON from the browser to the Cloudflare Worker in `worker/contact/`, which validates the request, applies a per-IP rate limit, verifies Cloudflare Turnstile and sends two emails through Resend (a notification to me and a short autoreply).

```bash
cp .env.example .env                                              # site variables
cp worker/contact/.dev.vars.example worker/contact/.dev.vars      # worker secrets (fill in RESEND_API_KEY and CONTACT_TO)
pnpm --dir worker/contact install
pnpm --dir worker/contact dev                                     # worker on :8787
pnpm dev                                                          # site on :4321
```

- Site variables (public, inlined at build time): `PUBLIC_CONTACT_ENDPOINT`, `PUBLIC_TURNSTILE_SITE_KEY`.
- Worker secrets (`wrangler secret put`): `RESEND_API_KEY`, `TURNSTILE_SECRET`, `CONTACT_TO`.

## 🚀 Deployment

- **Branches**: day-to-day work happens on `develop`; `main` is production. Changes go in through pull requests.
- **CI** (`ci.yml`, on every PR): lint, `astro check` + build, and the Worker's type check.
- **Deploy** (`deploy.yml`, on push): builds the Docker image with buildx, pushes it to GHCR (`latest` for `main`, `pre` for the rest, plus the commit SHA) and redeploys on the VPS over SSH. `main` goes to production, everything else to staging. Add `[skip ci]` to a commit message to skip it.
- **Worker** (`deploy-worker.yml`): deployed to Cloudflare only from `main`, or manually.
- **Runtime**: nginx serves `dist/` on port 4321 (config inlined in the `Dockerfile`, with security headers and cache policy) behind Traefik.
