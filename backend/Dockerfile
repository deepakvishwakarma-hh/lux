# Backend Dockerfile for Medusa.js
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies
RUN npm ci || yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build || yarn build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa

# Copy built application
COPY --from=builder --chown=medusa:nodejs /app/dist ./dist
COPY --from=builder --chown=medusa:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=medusa:nodejs /app/package*.json ./
COPY --from=builder --chown=medusa:nodejs /app/medusa-config.ts ./
COPY --from=builder --chown=medusa:nodejs /app/src ./src
COPY --from=builder --chown=medusa:nodejs /app/static ./static
COPY --from=builder --chown=medusa:nodejs /app/public ./public

USER medusa

EXPOSE 9000

CMD ["npm", "start"]

