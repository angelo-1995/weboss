FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy everything
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma - run from database package directory where prisma is installed
RUN cd packages/database && npx prisma generate

# Build API only
RUN pnpm --filter @community-os/api build

# Start
ENV PORT=4000
EXPOSE 4000
CMD ["node", "apps/api/dist/apps/api/src/main.js"]
