# Dockerfile
# Multi-stage build for production-optimized image

# ============================================
# Stage 1: Build / Install Dependencies
# ============================================
FROM node:20-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests FIRST (layer caching optimization)
COPY package.json package-lock.json ./

# Install production dependencies only
# npm ci = clean install (uses lockfile exactly, faster, reproducible)
RUN npm ci --only=production

# ============================================
# Stage 2: Production Image
# ============================================
FROM node:20-alpine AS production

# Add labels for metadata
LABEL maintainer="Your Name <your.email@example.com>"
LABEL description="Automated CI/CD Web Application"
LABEL version="1.0.0"

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY package.json ./
COPY src/ ./src/
COPY public/ ./public/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER appuser

# Expose the application port (documentation only)
EXPOSE 3000

# Health check - Docker will ping this every 30s
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "src/app.js"]