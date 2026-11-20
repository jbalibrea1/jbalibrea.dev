# 🌒 Welcome to jbalibrea.dev

I'm a web developer, and this is my personal website. I'm using this project to learn about Astro and Tailwind, while also showcasing my skills and projects.

## 🚀 Purpose

This site serves as a portfolio and a blog where I share articles about web development, programming, and my journey as a developer.

## ⚙️ Technologies

- **Astro**: A modern static site generator.
- **TypeScript**: For type safety and improved developer experience.
- **Tailwind**: Utility-first CSS framework for rapid UI development.
- **React**: For building interactive user interfaces.
- **Docker**: For containerization and easy deployment.

## 📦 Installation

To run this project locally, clone the repository and install the dependencies:

```bash
git clone https://github.com/jbalibrea1/jbalibrea.dev.git
cd jbalibrea.dev
pnpm i
pnpm dev
```

Or run it via docker:

```bash
git clone https://github.com/jbalibrea1/jbalibrea.dev.git
cd jbalibrea.dev
docker compose -f docker-compose.dev.yml up
```

## ✉️ Contact form setup

The contact form talks to a Cloudflare Worker (`worker/contact/`) that verifies Cloudflare Turnstile and sends the emails through Resend.

```bash
cp .env.example .env                                              # site variables
cp worker/contact/.dev.vars.example worker/contact/.dev.vars      # worker secrets (fill in RESEND_API_KEY and CONTACT_TO)
pnpm --dir worker/contact install
pnpm --dir worker/contact dev                                     # worker on :8787
pnpm dev                                                          # site on :4321
```

In production the worker secrets are set with `wrangler secret put` (`RESEND_API_KEY`, `TURNSTILE_SECRET`, `CONTACT_TO`) and deployed with `pnpm --dir worker/contact run deploy`. The site needs `PUBLIC_CONTACT_ENDPOINT` and `PUBLIC_TURNSTILE_SITE_KEY` at build time.

Feel free to explore and contribute!
