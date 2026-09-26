# Multi-Stage Production Dockerfile for LegalAssist
# Stage 1: Build the Vite frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Server & Unified Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server code
COPY server/ ./server/

# Copy built frontend assets from stage 1 into client/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Security: Run as unprivileged node user
USER node

EXPOSE 3001

# Healthcheck to verify server availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["node", "server/index.js"]
