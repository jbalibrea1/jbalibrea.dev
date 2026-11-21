# Base stage
FROM node:22-alpine AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-lock.yaml ./

# Build stage, install all dependencies and build the static site
FROM base AS build-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM build-deps AS build

ARG PUBLIC_CONTACT_ENDPOINT
ARG PUBLIC_TURNSTILE_SITE_KEY
ENV PUBLIC_CONTACT_ENDPOINT=$PUBLIC_CONTACT_ENDPOINT
ENV PUBLIC_TURNSTILE_SITE_KEY=$PUBLIC_TURNSTILE_SITE_KEY

COPY . .
RUN pnpm run build

# Runner stage, serve the static files with nginx
FROM nginx:alpine AS runner

# Config embebida (sin fichero aparte): sirve dist/ en el puerto 4321, detrás de Traefik
# `add_header` de un location anula los del nivel superior, por eso las cabeceras
# de seguridad van en un snippet que se incluye en cada location.
COPY <<'SECHEADERS' /etc/nginx/snippets/security-headers.conf
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
SECHEADERS

COPY <<'NGINXCONF' /etc/nginx/conf.d/default.conf
server {
  listen 4321;
  server_name _;
  server_tokens off;

  # Detrás de Traefik: nunca generar redirecciones con host/puerto internos (:4321)
  absolute_redirect off;

  root /usr/share/nginx/html;
  index index.html;

  gzip on;
  gzip_types text/css application/javascript application/json application/xml application/rss+xml application/manifest+json image/svg+xml text/xml;

  # Assets con hash en el nombre: cacheables para siempre
  location /_astro/ {
    include /etc/nginx/snippets/security-headers.conf;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  # Fuentes e iconos (nombre sin hash): un mes
  location ~* ^/(fonts|icons)/ {
    include /etc/nginx/snippets/security-headers.conf;
    add_header Cache-Control "public, max-age=2592000";
    try_files $uri =404;
  }

  # HTML y resto: siempre revalidar para que un despliegue se vea al momento
  location / {
    include /etc/nginx/snippets/security-headers.conf;
    add_header Cache-Control "no-cache";
    try_files $uri $uri/index.html $uri.html =404;
  }

  error_page 404 /404.html;
}
NGINXCONF
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:4321/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
