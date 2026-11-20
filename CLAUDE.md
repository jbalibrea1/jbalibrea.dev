# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (Node 22).

- `pnpm dev` — Astro dev server (port 4321)
- `pnpm build` — runs `astro check` (type check) then `astro build`; a type error fails the build
- `pnpm preview` — preview the build
- `pnpm lint` — ESLint (astro + jsx-a11y plugins)
- `docker compose -f docker-compose.dev.yml up` — dev via Docker

There is no test suite.

## Architecture

Personal portfolio + Spanish-language blog built with Astro 7, React islands, Tailwind v4 (via `@tailwindcss/vite`, no tailwind config file), and MDX.

- **Fully static**: no adapter and no server routes; `astro build` outputs plain HTML/CSS/JS to `dist/`. The Docker image serves `dist/` with nginx on port 4321 (config inlined in the `Dockerfile`; the VPS reverse proxy is Traefik).
- **Contact flow**: `src/components/Contact.tsx` (React island) renders a Cloudflare Turnstile widget and POSTs JSON (`name`, `email`, `message`, `botcheck`, `token`) from the browser to the Cloudflare Worker in `worker/contact/` (separate project, deployed with `pnpm --dir worker/contact run deploy`). The Worker validates, verifies Turnstile and sends two emails through Resend from `contact@alerts.jbalibrea.dev` (notification + autoreply; the autoreply's reply-to is `contact@jbalibrea.dev`). Site env vars: `PUBLIC_CONTACT_ENDPOINT` and `PUBLIC_TURNSTILE_SITE_KEY` (public, inlined at build time; Docker build ARGs and GitHub secrets). Worker secrets: `RESEND_API_KEY`, `TURNSTILE_SECRET`, `CONTACT_TO`.
- **Blog content**: `src/content/posts/*.mdx` (or `<slug>/index.mdx` with colocated assets), schema in `src/content.config.ts` (Content Layer, `glob` loader; entry `id` is the slug) (tags are lowercased and de-duplicated by the schema). Routes under `src/pages/blog/` cover the post list, pagination, archive and tags. Page sizes are in `src/config.ts` (`SITE`).
- **Markdown pipeline** (configured in `astro.config.mjs` via `markdown.processor: unified({...})` from `@astrojs/markdown-remark`, custom plugins in `plugins/`): `remark-toc` (heading "Tabla de contenidos"), `remark-reading-time`, `remark-directive`, `remark-admonitions` (GitHub-style `> [!NOTE]` callouts), Shiki dual themes (github-light/dark) with `shiki-trans.ts` adding a copy button and style tweaks, external links open in new tabs.
- **Layouts**: `BaseLayout` (site shell) → `BlogLayout` / `MarkdownPostLayout` (posts).
- **Static data**: the repositories page is driven by `src/data/githubProjects.ts`, not the GitHub API.
- **Path aliases**: tsconfig maps `@*` → `./src/*` (e.g. `@components/Contact.tsx`, `@utils/escapeHtml`, `@layouts/BaseLayout.astro`, `@/interfaces/Github`).

## CI/CD

`.github/workflows/deploy.yml` builds and pushes a Docker image to GHCR and deploys on pushes to `main`, `feat/*`, `chore/*`, `refactor/*`. Include `[skip ci]` in the commit message to cancel the workflow. Main branch is `main`; day-to-day work happens on `develop`.
