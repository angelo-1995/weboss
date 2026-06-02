FROM node:20-alpine

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy everything
COPY . .

# Install dependencies (including devDeps needed for build)
RUN pnpm install --force

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build the API
RUN pnpm --filter @community-os/api build

# Create symlinks for workspace packages
RUN mkdir -p /app/apps/api/node_modules/@community-os && \
    ln -sf /app/packages/database /app/apps/api/node_modules/@community-os/database && \
    mkdir -p /app/node_modules/@community-os && \
    ln -sf /app/packages/database /app/node_modules/@community-os/database && \
    ln -sf /app/packages/types /app/node_modules/@community-os/types

# Expose port
EXPOSE 4000

# Start the API
CMD ["node", "apps/api/dist/main.js"]
