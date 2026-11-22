# 🌒 jbalibrea.dev

Portfolio personal y blog (en español) de Jorge Balibrea, desarrollador full stack de Murcia. También es el proyecto donde pruebo herramientas nuevas, así que espera que evolucione.

En producción en **https://jbalibrea.dev**.

## ⚙️ Stack

- **[Astro 7](https://astro.build)**: salida totalmente estática, colecciones de contenido, transiciones de vista.
- **MDX** para el blog, con un pipeline de Markdown propio (`plugins/`): tabla de contenidos, tiempo de lectura, avisos al estilo de GitHub, temas dobles de Shiki con botón de copiar.
- **React** solo donde hace falta (formulario de contacto y comentarios de Giscus); todo lo demás es Astro puro.
- **Tailwind CSS v4**, configurado en CSS (`src/styles/global.css`: `@theme`, `@plugin`, `@custom-variant`).
- **Buscador** del blog con [Pagefind](https://pagefind.app) (índice generado en el build) e interfaz propia en `/blog/search`.
- **SEO y redes**: datos estructurados (JSON-LD), sitemap, RSS con el contenido completo (saneado) y tarjetas Open Graph por post generadas con satori (`src/pages/og/`).
- **Cloudflare Worker** (`worker/contact/`) tras el formulario de contacto: Turnstile + Resend + límite de peticiones.
- **Docker + nginx**, desplegado en un VPS tras Traefik mediante GitHub Actions y GHCR.

## 📦 Primeros pasos

Requiere Node 22 (ver `.nvmrc`) y [pnpm](https://pnpm.io).

```bash
git clone https://github.com/jbalibrea1/jbalibrea.dev.git
cd jbalibrea.dev
pnpm install
pnpm dev          # http://localhost:4321
```

| Comando             | Qué hace                                                                         |
| ------------------- | -------------------------------------------------------------------------------- |
| `pnpm dev`          | Servidor de desarrollo en el puerto 4321                                         |
| `pnpm build`        | `astro check` (tipos) + `astro build` + índice de búsqueda de Pagefind → `dist/` |
| `pnpm preview`      | Sirve el build de producción                                                     |
| `pnpm lint`         | ESLint (Astro, accesibilidad, TypeScript, hooks de React)                        |
| `pnpm format`       | Prettier (formatea)                                                              |
| `pnpm format:check` | Prettier (solo comprueba; es lo que se ejecuta en CI)                            |

O con Docker: `docker compose -f docker-compose.dev.yml up`.

> **Nota:** el buscador solo funciona sobre un build (`pnpm build && pnpm preview`), porque el índice de Pagefind se genera al final del build.

## 🗂️ Estructura del proyecto

```text
src/
  components/    Componentes Astro y las pocas islas de React
  content/posts/ Posts del blog (.mdx, o <slug>/index.mdx con sus recursos al lado)
  data/          Datos estáticos (página de repositorios)
  layouts/       BaseLayout → BlogLayout / MarkdownPostLayout
  pages/         Rutas (inicio, blog, archivo, etiquetas, repositorios, contacto, RSS, OG)
  styles/        Punto de entrada de Tailwind, fuentes y estilos de Markdown
  utils/         Utilidades pequeñas (orden, URL canónica, cn…)
plugins/         Plugins de Remark/Shiki usados por el pipeline de Markdown
worker/contact/  Cloudflare Worker del formulario de contacto (proyecto aparte)
```

## ✍️ Escribir un post

Crea `src/content/posts/<slug>/index.mdx` con el frontmatter:

```yaml
---
title: 'Título'
pubDateTime: 2026-01-31T10:00:00Z
modDateTime: 2026-02-10T10:00:00Z # opcional: se muestra como «Actualizado»
description: 'Resumen para listados y metadatos.'
author: 'Jorge Balibrea'
image:
  url: './portada.png' # junto al post; se optimiza y valida con el schema
  alt: 'Descripción de la portada'
tags: ['astro', 'blog']
---
```

El `<slug>` de la carpeta es la URL del post. Los posts se ordenan siempre por `pubDateTime`; `modDateTime` solo añade la fecha de actualización.

## ✉️ Formulario de contacto

El formulario envía JSON desde el navegador al Cloudflare Worker de `worker/contact/`, que valida la petición, aplica un límite por IP, verifica Cloudflare Turnstile y envía dos correos con Resend (una notificación para mí y una respuesta automática breve).

```bash
cp .env.example .env                                              # variables del sitio
cp worker/contact/.dev.vars.example worker/contact/.dev.vars      # secretos del worker (rellena RESEND_API_KEY y CONTACT_TO)
pnpm --dir worker/contact install
pnpm --dir worker/contact dev                                     # worker en :8787
pnpm dev                                                          # sitio en :4321
```

- Variables del sitio (públicas, se incrustan en el build): `PUBLIC_CONTACT_ENDPOINT`, `PUBLIC_TURNSTILE_SITE_KEY`.
- Secretos del worker (`wrangler secret put`): `RESEND_API_KEY`, `TURNSTILE_SECRET`, `CONTACT_TO`.

## 🚀 Despliegue

- **Ramas**: el trabajo diario va en `develop`; `main` es producción. Los cambios entran mediante pull requests.
- **CI** (`ci.yml`, en cada PR): lint, `format:check`, `astro check` + build y comprobación de tipos del Worker.
- **Deploy** (`deploy.yml`, en cada push): construye la imagen Docker con buildx, la sube a GHCR (`latest` para `main`, `pre` para el resto, más el SHA del commit) y redespliega en el VPS por SSH. `main` va a producción y todo lo demás a pre. Añade `[skip ci]` al mensaje del commit para saltarlo.
- **Worker** (`deploy-worker.yml`): se despliega en Cloudflare solo desde `main`, o a mano.
- **Ejecución**: nginx sirve `dist/` en el puerto 4321 (configuración dentro del `Dockerfile`, con cabeceras de seguridad y política de caché) tras Traefik.
