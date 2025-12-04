FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application source code with correct ownership
# IMPORTANT: Must set ownership before USER directive
COPY --chown=node:node . .

# Expose port
EXPOSE 3000

# Run as non-root user for security
# Must be set AFTER copying files with correct ownership
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application with dumb-init for proper signal handling
CMD ["dumb-init", "node", "src/server.js"]
