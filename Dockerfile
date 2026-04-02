# ============================================
# Dockerfile for Automated CI/CD Web Application
# Multi-stage build for optimized production image
# ============================================

# ------------------------------------------
# Stage 1: Dependencies & Testing
# ------------------------------------------
# We use a full Node image here so we can install
# all dependencies (including devDependencies) and
# run tests to catch issues before the image ships.
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files first (leverages Docker layer caching)
# If these files haven't changed, Docker reuses the cached
# npm install layer — saving minutes on every rebuild.
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for testing)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Run linter and tests inside the build stage
# If either fails, the Docker build fails — preventing
# a broken image from ever being pushed.
RUN npm run lint && npm test

# ------------------------------------------
# Stage 2: Production Image
# ------------------------------------------
# Start from a clean, minimal Alpine image.
# This stage contains ONLY what's needed to run
# the app — no test frameworks, no devDependencies.
FROM node:20-alpine AS production

# Add metadata labels (used by CI/CD pipeline for tracking)
LABEL maintainer="Gentleman08"
LABEL description="Automated CI/CD Web Application"
LABEL org.opencontainers.image.source="https://github.com/Gentleman08/automated-web-deployment"

# Create a non-root user for security
# Running as root inside containers is a security anti-pattern.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies ONLY
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code (no tests, no config files)
COPY src/ ./src/
COPY public/ ./public/

# Switch to non-root user

USER appuser

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app listens on
EXPOSE 3000

# Health check — Docker and orchestrators (ECS, Kubernetes)
# use this to determine if the container is healthy.
# It hits /health every 30s; 3 consecutive failures = unhealthy.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "src/app.js"]
