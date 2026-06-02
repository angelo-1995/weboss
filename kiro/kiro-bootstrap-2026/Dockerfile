FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy everything
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build API
RUN pnpm --filter @community-os/api build

# Start - dist structure is now dist/main.js (rootDir = ./src)
ENV PORT=4000
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
