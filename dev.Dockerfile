FROM node:22

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

USER node
WORKDIR /app

#TODO: better node_modules?

COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install
COPY --chown=node:node . .

# npm run dev is the command to start the application in development mode
CMD ["pnpm", "run", "dev", "--host"]
