# ---- Builder stage ----
FROM node:22-alpine AS builder

# Install dependencies required by Prisma
RUN apk add --no-cache libc6-compat openssl

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Copy package.json files for all workspaces (needed for pnpm install)
COPY packages/config/package.json ./packages/config/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY apps/api/package.json ./apps/api/package.json

# Install ALL dependencies (dev included — needed for build & prisma generate)
RUN pnpm install --frozen-lockfile

# Copy shared packages source
COPY packages/ ./packages/

# Copy api source
COPY apps/api/ ./apps/api/

# Build the database client (runs: prisma generate && tsc)
RUN pnpm --filter=@linguoup/database build

# Build the api
RUN pnpm --filter=api build

# ---- Runner stage ----
# NOTE: We intentionally copy the full node_modules from builder (including devDeps).
# Attempts to use pnpm prune or a separate --prod install stage both fail because
# pnpm's virtual store (.pnpm/) puts the prisma-generated query engine binary in
# an unpredictable nested path inside the store, making targeted COPY impossible.
# The trade-off is a larger image; correctness is the priority here.
FROM node:22-alpine AS runner

# Install system dependencies required by Prisma query engine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy the FULL node_modules from builder.
# This guarantees that .prisma/client (query engine + generated JS) is present
# exactly where pnpm's virtual store placed it during prisma generate.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules

# Copy built artifacts
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/package.json ./package.json

WORKDIR /app/apps/api

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
