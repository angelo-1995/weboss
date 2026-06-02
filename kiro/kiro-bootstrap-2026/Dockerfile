FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy package files first (for caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/database/package.json packages/database/
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
COPY packages/ui/package.json packages/ui/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Install ALL dependencies
RUN pnpm install --frozen-lockfile

# Copy only what's needed for API build (not web source)
COPY packages/ packages/
COPY apps/api/ apps/api/

# Generate Prisma client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build ONLY the API (not web)
RUN pnpm --filter @community-os/api build

# Start
ENV PORT=4000
EXPOSE 4000
CMD ["node", "apps/api/dist/apps/api/src/main.js"]
