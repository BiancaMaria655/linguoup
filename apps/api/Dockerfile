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

# Install ALL dependencies (dev included) for the build step
RUN pnpm install --frozen-lockfile

# Copy shared packages source
COPY packages/ ./packages/

# Copy api source
COPY apps/api/ ./apps/api/

# Build the database client
RUN pnpm --filter=@linguoup/database build

# Build the api
RUN pnpm --filter=api build

# ---- Prod-deps stage ----
# Fresh install with only production dependencies, avoiding pnpm prune
# which can corrupt the virtual store / hoisted modules in monorepos.
FROM node:22-alpine AS prod-deps

RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/config/package.json ./packages/config/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY apps/api/package.json ./apps/api/package.json

# Install only production dependencies
# Note: prisma generate is NOT run here — prisma CLI is a devDep.
# The generated client is copied from the builder stage instead.
RUN pnpm install --frozen-lockfile --prod

# ---- Runner stage ----
FROM node:22-alpine AS runner

# Install dependencies required by Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy production node_modules (clean, no broken symlinks from prune)
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=prod-deps /app/packages/database/package.json ./packages/database/package.json

# Copy the generated Prisma client from builder (already ran prisma generate)
# .prisma/client contains the query engine binary + generated JS
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built artifacts from builder
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/package.json ./package.json

WORKDIR /app/apps/api

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
