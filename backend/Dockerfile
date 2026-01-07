# Backend Dockerfile for Medusa.js
FROM node:20-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa

# Copy application files
COPY --chown=medusa:nodejs . .

USER medusa

EXPOSE 9000

CMD ["npm", "run", "start"]

