# Frontend Dockerfile for Next.js
FROM node:20-alpine

WORKDIR /app

# Enable Corepack for Yarn version management
RUN corepack enable

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy application files
COPY --chown=nextjs:nodejs . .

USER nextjs

EXPOSE 8000

ENV PORT=8000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["npm", "run", "dev"]

