FROM node:22-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application files
COPY server.js db.js ./
COPY public/ ./public/

# Data directory
VOLUME ["/app/data"]

ENV PORT=3000
ENV DATA_DIR=/app/data
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
