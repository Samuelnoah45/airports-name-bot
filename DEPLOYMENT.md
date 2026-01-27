# Deployment Guide - Render with Docker

This guide will help you deploy your Telegram Airport Bot to Render.com using Docker.

## Prerequisites

1. A [Render.com](https://render.com) account (free)
2. A GitHub/GitLab account
3. Your Telegram Bot Token from @BotFather

## Deployment Steps

### Step 1: Push Code to GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Telegram Airport Bot"
   ```

2. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new)
   - Name it: `telegram-airport-bot`
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/telegram-airport-bot.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Click "New +"** → **"Web Service"**

3. **Connect your GitHub repository**:
   - Click "Connect account" if first time
   - Find and select your `telegram-airport-bot` repository

4. **Configure the service**:
   - **Name**: `telegram-airport-bot` (or any name you prefer)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Runtime**: Docker
   - **Plan**: Free

5. **Add Environment Variable**:
   - Click "Advanced"
   - Add environment variable:
     - **Key**: `BOT_TOKEN`
     - **Value**: Your bot token from @BotFather
   
6. **Click "Create Web Service"**

### Step 3: Wait for Deployment

- Render will automatically:
  1. Clone your repository
  2. Build the Docker image
  3. Start the container
  4. Your bot will be live!

- Check the logs to confirm bot is running:
  ```
  🤖 Bot is running...
  Press Ctrl+C to stop
  ```

### Step 4: Test Your Bot

1. Open Telegram
2. Find your bot
3. Send `/start`
4. Try airport codes: `JFK`, `LAX`, `LHR`

## Automatic Updates

Every time you push to GitHub, Render will automatically:
- Rebuild the Docker image
- Deploy the new version
- Zero downtime deployment

To update your bot:
```bash
git add .
git commit -m "Update airports or features"
git push
```

## Troubleshooting

### Bot not responding
1. Check Render logs for errors
2. Verify `BOT_TOKEN` environment variable is set correctly
3. Make sure bot token is valid (test with @BotFather)

### Build fails
1. Check Dockerfile syntax
2. Ensure all files are committed to Git
3. Check Render build logs for specific errors

### Bot keeps restarting
1. Check logs for runtime errors
2. Verify Node.js version compatibility
3. Ensure all dependencies are in `package.json`

## Local Docker Testing (Optional)

Test the Docker container locally before deploying:

1. **Build the image**:
   ```bash
   docker build -t telegram-airport-bot .
   ```

2. **Run the container**:
   ```bash
   docker run -e BOT_TOKEN=your_token_here telegram-airport-bot
   ```

3. **Test the bot** in Telegram

4. **Stop the container**:
   ```bash
   docker ps  # Find container ID
   docker stop <container_id>
   ```

## Render Free Tier Notes

- **750 hours/month** free (enough for 24/7 operation)
- **512MB RAM** (sufficient for this bot)
- **No credit card required**
- Service may spin down after 15 minutes of inactivity, but Telegram bots don't have "inactivity" - they're always listening for messages

## Cost to Scale (Optional)

If you need more resources later:
- **Starter Plan**: $7/month
  - Always on
  - More RAM
  - Better performance

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Docker Documentation](https://docs.docker.com/)

---

Happy deploying! ✈️
