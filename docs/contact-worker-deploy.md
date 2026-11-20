# Despliegue del formulario de contacto (Worker + Resend + Turnstile)

## 1. Idea clave: wrangler NO se ejecuta en el VPS

El Worker **no corre en el VPS**: vive en la red de Cloudflare. El VPS solo sirve la web estática (contenedor con nginx detrás de Traefik) y no sabe nada del Worker.

| Pieza | Dónde vive | Cómo se despliega |
|---|---|---|
| Web estática (`dist/`) | VPS, contenedor + Traefik | GitHub Actions (`deploy.yml`): build → GHCR → SSH → `docker compose pull/up` |
| Worker `worker/contact/` | Cloudflare | `wrangler deploy`, desde tu máquina o desde GitHub Actions |

`wrangler` se ejecuta o en tu portátil o en un runner de GitHub Actions. Nunca hace falta instalarlo en el VPS.

La web solo conoce el Worker por dos variables que se **incrustan en el build** (`PUBLIC_CONTACT_ENDPOINT` y `PUBLIC_TURNSTILE_SITE_KEY`). Las pone GitHub Actions como `--build-arg` (ya está en `deploy.yml`), así que **el VPS no necesita ninguna variable nueva** ni cambios en los `docker-compose` del servidor.

## 2. Qué va dónde

| Dato | Dónde se guarda | Quién lo usa |
|---|---|---|
| `RESEND_API_KEY` | Secreto del Worker (Cloudflare) | Worker |
| `TURNSTILE_SECRET` | Secreto del Worker (Cloudflare) | Worker |
| `CONTACT_TO` (tu Gmail) | Secreto del Worker (Cloudflare) | Worker |
| `PUBLIC_CONTACT_ENDPOINT` | Secret de GitHub (nivel **repositorio**) | build de la web |
| `PUBLIC_TURNSTILE_SITE_KEY` | Secret de GitHub (nivel **repositorio**) | build de la web |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | Secrets de GitHub | solo el workflow que despliega el Worker |

Notas:
- El job `build-and-push` no declara `environment`, así que `PUBLIC_CONTACT_ENDPOINT` y `PUBLIC_TURNSTILE_SITE_KEY` deben estar como **repository secrets**, no como environment secrets.
- Los secretos del Worker se fijan **una vez** y persisten entre despliegues: `wrangler deploy` no los borra.

## 3. Puesta en marcha (una sola vez, desde tu máquina)

```bash
cd worker/contact
pnpm install
pnpm exec wrangler login

# Secretos reales (te los pregunta de forma interactiva)
pnpm exec wrangler secret put RESEND_API_KEY
pnpm exec wrangler secret put TURNSTILE_SECRET     # la secret REAL de Turnstile, no la de prueba
pnpm exec wrangler secret put CONTACT_TO           # tu Gmail directamente

pnpm run deploy                                      # imprime la URL del Worker
```

Después, en GitHub → Settings → Secrets and variables → Actions → **Repository secrets**:
- `PUBLIC_CONTACT_ENDPOINT` = URL que imprimió el deploy (`https://jbalibrea-contact.<cuenta>.workers.dev`, o `https://api.jbalibrea.dev` si activas `routes` en `wrangler.toml`).
- `PUBLIC_TURNSTILE_SITE_KEY` = site key real de Turnstile.
- Borra `PUBLIC_WEB3FORMS_KEY`.

`ALLOWED_ORIGINS` en `worker/contact/wrangler.toml` ya incluye `https://jbalibrea.dev`, `https://pre.jbalibrea.dev` y `http://localhost:4321`. Si añades otro origen, ponlo ahí o el Worker responderá 403. Pre y producción comparten el mismo Worker y el mismo endpoint; además, el widget de Turnstile debe tener también el hostname `pre.jbalibrea.dev`.

## 4. Despliegue automático del Worker con GitHub Actions

### 4.1 Token de Cloudflare
1. Cloudflare → My Profile → API Tokens → **Create Token** → plantilla **Edit Cloudflare Workers**.
2. Limítalo a tu cuenta. Copia el token (se muestra una sola vez).
3. El Account ID está en Workers & Pages → panel derecho.
4. En GitHub, crea los secrets `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.

### 4.2 Workflow `.github/workflows/deploy-worker.yml` (ya creado en el repo)

Workflow aparte: solo se dispara en `main` o `develop` si cambia el Worker (o a mano con "Run workflow"), y no toca el flujo actual de la web. Contenido:

```yaml
name: Deploy contact Worker ☁️
on:
  push:
    branches: [main, develop]
    paths:
      - 'worker/contact/**'
      - '.github/workflows/deploy-worker.yml'
  workflow_dispatch:

jobs:
  deploy-worker:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: worker/contact
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: worker/contact/pnpm-lock.yaml
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: worker/contact
          command: deploy
```

Requisitos:
- Debe existir `worker/contact/pnpm-lock.yaml` en el repo (se genera con `pnpm install` dentro de `worker/contact`; commitéalo).
- Ajusta `version` de pnpm a la que uses (en `package.json` puede haber `packageManager`).

Con esto el flujo queda:
- Cambias la web → `deploy.yml` → VPS (como hasta ahora).
- Cambias `worker/contact/**` → `deploy-worker.yml` → Cloudflare.
- Cambias un secreto del Worker (por ejemplo rotas la API key) → `wrangler secret put` a mano; es raro y no hace falta CI.

## 5. Traefik y nginx

- En el VPS no hay nginx instalado, y no hace falta: el contenedor de la web ya lleva su propio nginx **dentro de la imagen** (config en el `Dockerfile`, escucha en el puerto 4321). Traefik solo enruta hacia ese puerto, igual que antes.
- `nginx.conf` ya no existe como fichero en el repo; su contenido está inlined en el `Dockerfile`.
- Traefik no interviene en el formulario: el navegador llama directamente al Worker en Cloudflare (CORS limitado por `ALLOWED_ORIGINS`).

## 6. Comprobar que funciona

1. Push a `main` → pestaña Actions: `CI/CD` en verde y, si cambió el Worker, `Deploy contact Worker` en verde.
2. Abrir `https://jbalibrea.dev/contact`, completar el widget y enviar.
3. Debe llegar el aviso a tu Gmail y el autoreply al visitante.
4. Si falla: `pnpm --dir worker/contact exec wrangler tail` mientras envías, y la consola del navegador (CORS/403 = `ALLOWED_ORIGINS`; "Captcha inválido" = site key y secret no son del mismo widget).
5. En Resend → Emails, ambos correos deben aparecer como Delivered.

## 7. Limpieza pendiente

- Borrar la access key de Web3Forms.
- Revocar la contraseña de aplicación de Gmail que usaba nodemailer (`CONTACT_PASSWORD`).
- Quitar variables antiguas del servidor si siguen ahí (`RECAPTCHA_SECRET_KEY`, `CONTACT_EMAIL`, `CONTACT_PASSWORD`, `CONTACT_TO_SEND`).
