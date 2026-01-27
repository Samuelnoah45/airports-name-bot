# Docker Guide for Telegram Airport Bot

This guide covers building and running the bot using Docker.

## Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

1. **Create `.env` file**:
   ```bash
   cp env.example .env
   ```
   Edit `.env` and add your bot token:
   ```
   BOT_TOKEN=your_actual_telegram_bot_token
   ```

2. **Start the bot**:
   ```bash
   docker-compose up -d
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f
   ```

4. **Stop the bot**:
   ```bash
   docker-compose down
   ```

### Option 2: Using Docker Commands

1. **Build the Docker image**:
   ```bash
   docker build -t telegram-airport-bot .
   ```

2. **Run the container**:
   ```bash
   docker run -d \
     --name telegram-airport-bot \
     --restart unless-stopped \
     -e BOT_TOKEN=your_bot_token_here \
     telegram-airport-bot
   ```

3. **View logs**:
   ```bash
   docker logs -f telegram-airport-bot
   ```

4. **Stop the container**:
   ```bash
   docker stop telegram-airport-bot
   docker rm telegram-airport-bot
   ```

## Docker Image Details

- **Base Image**: `node:20-alpine` (lightweight)
- **Final Image Size**: ~200MB
- **Multi-stage**: No (could be optimized further)
- **Production Ready**: Yes

## What's Inside the Dockerfile?

```dockerfile
# Uses Node.js 20 Alpine (small, secure)
FROM node:20-alpine

# Sets working directory
WORKDIR /app

# Copies and installs dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copies source code and builds TypeScript
COPY tsconfig.json ./
COPY src ./src
COPY airports.json ./
RUN npm install -D typescript @types/node ts-node
RUN npm run build

# Cleans up dev dependencies
RUN npm prune --production

# Runs the compiled bot
CMD ["node", "dist/index.js"]
```

## Development with Docker

### Hot Reload Development

For development with hot reload:

1. **Create `docker-compose.dev.yml`**:
   ```yaml
   version: '3.8'
   
   services:
     telegram-bot:
       build:
         context: .
         dockerfile: Dockerfile
       container_name: telegram-airport-bot-dev
       environment:
         - BOT_TOKEN=${BOT_TOKEN}
       env_file:
         - .env
       volumes:
         - ./src:/app/src:ro
         - ./airports.json:/app/airports.json:ro
       command: npm run dev
   ```

2. **Run in dev mode**:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

### Interactive Shell

Access the container shell for debugging:

```bash
docker exec -it telegram-airport-bot sh
```

## Production Deployment

### Deploy to Any Docker Host

1. **Push to Docker Hub** (optional):
   ```bash
   docker tag telegram-airport-bot your-username/telegram-airport-bot
   docker push your-username/telegram-airport-bot
   ```

2. **Pull and run on server**:
   ```bash
   docker pull your-username/telegram-airport-bot
   docker run -d \
     --name telegram-airport-bot \
     --restart always \
     -e BOT_TOKEN=your_token \
     your-username/telegram-airport-bot
   ```

### Deploy to Render.com

See [DEPLOYMENT.md](DEPLOYMENT.md) for Render deployment instructions.

### Deploy to AWS ECS, Google Cloud Run, etc.

The Docker container works on any platform that supports Docker:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Railway
- Fly.io

## Updating the Bot

### Update Airport Data

1. Edit `airports.json`
2. Rebuild and restart:
   ```bash
   docker-compose up -d --build
   ```

### Update Code

1. Make code changes in `src/`
2. Rebuild:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

## Troubleshooting

### Container keeps restarting

Check logs:
```bash
docker logs telegram-airport-bot
```

Common issues:
- Invalid `BOT_TOKEN`
- Missing environment variables
- Network issues

### Bot not responding

1. **Verify container is running**:
   ```bash
   docker ps
   ```

2. **Check logs for errors**:
   ```bash
   docker logs -f telegram-airport-bot
   ```

3. **Verify bot token**:
   - Make sure token is correct
   - Test token with @BotFather on Telegram

### Build fails

1. **Clear Docker cache**:
   ```bash
   docker builder prune -a
   ```

2. **Rebuild from scratch**:
   ```bash
   docker-compose build --no-cache
   ```

### Out of disk space

Clean up Docker resources:
```bash
docker system prune -a
```

## Resource Usage

### Typical Resource Consumption

- **CPU**: < 1%
- **RAM**: 50-100MB
- **Disk**: ~200MB (image) + logs
- **Network**: Minimal (only Telegram API calls)

### Resource Limits

Add resource limits in `docker-compose.yml`:

```yaml
services:
  telegram-bot:
    # ... other config ...
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.1'
          memory: 50M
```

## Security Best Practices

1. **Never commit `.env` file** - it contains your bot token
2. **Use Docker secrets** for production:
   ```bash
   echo "your_token" | docker secret create bot_token -
   ```

3. **Run as non-root user** (future improvement):
   Add to Dockerfile:
   ```dockerfile
   RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
   USER nodejs
   ```

4. **Keep base image updated**:
   ```bash
   docker pull node:20-alpine
   docker-compose build --no-cache
   ```

## Monitoring

### View Real-time Logs

```bash
docker-compose logs -f
```

### Export Logs

```bash
docker logs telegram-airport-bot > bot-logs.txt
```

### Monitor Resource Usage

```bash
docker stats telegram-airport-bot
```

## Backup

### Backup Airport Data

```bash
docker cp telegram-airport-bot:/app/airports.json ./airports-backup.json
```

### Restore Airport Data

```bash
docker cp ./airports-backup.json telegram-airport-bot:/app/airports.json
docker restart telegram-airport-bot
```

---

For deployment to cloud platforms, see [DEPLOYMENT.md](DEPLOYMENT.md)
