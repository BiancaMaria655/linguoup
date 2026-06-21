# ---- Builder stage ----
FROM node:22-alpine AS builder

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

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy shared packages source
COPY packages/ ./packages/

# Copy api source
COPY apps/api/ ./apps/api/

# Build the database client
RUN pnpm --filter=@linguoup/database build

# Build the api
RUN pnpm --filter=api build

# ---- Runner stage ----
FROM node:22-alpine AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Copy package.json files for production install
COPY packages/config/package.json ./packages/config/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY apps/api/package.json ./apps/api/package.json

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
