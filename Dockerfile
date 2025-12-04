# ============================================
# DigiSchool API - Production Dockerfile
# ============================================
# Node.js 20 LTS + Express.js + MongoDB
# Optimized for production deployment
# ============================================

FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run as non-root user (security)
USER node

# Start application
CMD ["dumb-init", "node", "src/server.js"]
