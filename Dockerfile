# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY tsconfig.json ./
COPY src ./src
COPY airports.json ./

# Install TypeScript and build dependencies
RUN npm install -D typescript @types/node ts-node

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port (not required for Telegram bot, but good practice)
EXPOSE 3000

# Start the bot
CMD ["node", "dist/index.js"]
