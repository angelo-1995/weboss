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

# Start with custom resolver that handles .ts -> .js resolution
ENV PORT=4000
EXPOSE 4000
CMD ["node", "-r", "./apps/api/register-ts-paths.js", "apps/api/dist/apps/api/src/main.js"]
