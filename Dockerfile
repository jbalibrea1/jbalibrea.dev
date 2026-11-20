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
COPY <<'NGINXCONF' /etc/nginx/conf.d/default.conf
server {
  listen 4321;
  server_name _;

  # Detrás de Traefik: nunca generar redirecciones con host/puerto internos (:4321)
  absolute_redirect off;

  root /usr/share/nginx/html;
  index index.html;

  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml text/xml;

  location /_astro/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  location / {
    try_files $uri $uri/index.html $uri.html =404;
  }

  error_page 404 /404.html;
}
NGINXCONF
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 4321

CMD ["nginx", "-g", "daemon off;"]
