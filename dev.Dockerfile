FROM node:22

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .

# npm run dev is the command to start the application in development mode
CMD ["pnpm", "run", "dev", "--host"]
