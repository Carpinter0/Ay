# ────────────────────────────────────────────────────────────────────
# Stage 1: Build
# ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (layer cache: only re-runs if package*.json changes)
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copy source and compile TypeScript
COPY . .
RUN npm run build

# ────────────────────────────────────────────────────────────────────
# Stage 2: Production image
# Only copies compiled output + production node_modules.
# No TypeScript compiler, no dev tools, no source files.
# ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Run as non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./

USER expressjs

EXPOSE 3000

# Health check for Cloud Run / container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
