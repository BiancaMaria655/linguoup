# ---- Builder stage ----
FROM node:22-alpine AS builder

# Install dependencies required by Prisma and native modules (argon2)
RUN apk add --no-cache libc6-compat openssl python3 make g++

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifest files first (layer cache)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Copy package.json files for all workspaces (needed for pnpm install hoisting)
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

# Build the database client (prisma generate + tsc)
RUN pnpm --filter=@linguoup/database build

# Build the api
RUN pnpm --filter=api build

# ---- Runner stage ----
FROM node:22-alpine AS runner

# Install system dependencies required by Prisma query engine and argon2
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy the FULL root node_modules from builder.
# pnpm uses a virtual store (.pnpm/) at root level — all hoisted packages,
# including @nestjs/core and the Prisma query engine, live here.
COPY --from=builder /app/node_modules ./node_modules

# Copy the database package node_modules (contains .prisma/client)
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules

# Copy built artifacts
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/package.json ./package.json

# Also copy apps/api/node_modules if it exists (pnpm may place some deps there)
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

WORKDIR /app/apps/api

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
