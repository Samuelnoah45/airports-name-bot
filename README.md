# Telegram Airport Lookup Bot

A simple Telegram bot that helps users look up airport names by their IATA codes. Built with TypeScript and the Telegraf framework. Fully Dockerized for easy deployment.

## Features

- **Airport Lookup**: Send an airport IATA code (e.g., "JFK", "LAX") and get the full airport name
- **Case-Insensitive**: Works with any case (JFK, jfk, Jfk all work)
- **Partial Matching**: Find airports even with partial codes
- **Multiple Results**: Shows all matching airports if multiple matches are found
- **100+ Airports**: Pre-loaded with popular airports worldwide
- **Docker Ready**: Containerized for easy deployment anywhere

## Quick Start with Docker (Recommended)

The fastest way to get started:

1. **Get a bot token** from [@BotFather](https://t.me/botfather)

2. **Create `.env` file**:
   ```bash
   cp env.example .env
   # Edit .env and add your bot token
   ```

3. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f
   ```

Done! Your bot is now running. See [DOCKER.md](DOCKER.md) for more Docker options.

## Prerequisites

### For Docker (Recommended)
- Docker and Docker Compose
- A Telegram Bot Token (get it from [@BotFather](https://t.me/botfather))

### For Local Development
- Node.js (v16 or higher)
- npm or yarn
- A Telegram Bot Token

## Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file**
   
   Copy the example file and add your bot token:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your Telegram bot token:
   ```
   BOT_TOKEN=your_actual_bot_token_here
   ```

## Getting a Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts to name your bot
4. BotFather will give you a token - copy it to your `.env` file

## Usage

### Development Mode

Run the bot in development mode with automatic TypeScript compilation:

```bash
npm run dev
```

### Production Build

Build and run the production version:

```bash
npm run build
npm start
```

### Type Checking

Check for TypeScript errors without running:

```bash
npm run type-check
```

## Using the Bot

Once the bot is running:

1. Open Telegram and find your bot by its username
2. Start a conversation with `/start`
3. Send any airport IATA code:
   - `JFK` → John F. Kennedy International Airport
   - `LAX` → Los Angeles International Airport
   - `LHR` → London Heathrow Airport
   - And many more!

### Available Commands

- `/start` - Welcome message and instructions
- `/help` - Display help information
- Send any text - Search for airport by IATA code

## Airport Data

The bot includes 100+ major airports from around the world, including:

- All major US airports (JFK, LAX, ORD, DFW, etc.)
- European hubs (LHR, CDG, AMS, FRA, etc.)
- Asian airports (NRT, ICN, SIN, HKG, etc.)
- Middle Eastern hubs (DXB, DOH, etc.)
- And more!

To add more airports, simply edit the `airports.json` file.

## Project Structure

```
.
├── src/
│   ├── index.ts       # Main bot logic and handlers
│   └── airports.ts    # Airport data utilities
├── airports.json      # Airport database (IATA codes)
├── package.json       # Project dependencies
├── tsconfig.json      # TypeScript configuration
├── .env              # Environment variables (not in git)
├── .env.example      # Environment template
└── README.md         # This file
```

## Customization

### Adding More Airports

Edit `airports.json` and add new entries:

```json
{
  "CODE": "Airport Full Name",
  "SYD": "Sydney Kingsford Smith Airport"
}
```

### Modifying Search Behavior

Edit the `searchAirport()` function in `src/airports.ts` to change how searches work.

### Changing Bot Messages

Edit the response texts in `src/index.ts` to customize the bot's personality and messages.

## Troubleshooting

**Bot doesn't respond:**
- Check that your BOT_TOKEN in `.env` is correct
- Make sure the bot is running (check terminal output)
- Verify you've sent `/start` to the bot at least once

**"BOT_TOKEN is not defined" error:**
- Make sure you created a `.env` file
- Verify the file contains `BOT_TOKEN=your_token`
- Don't use quotes around the token

**TypeScript errors:**
- Run `npm install` to ensure all dependencies are installed
- Check that Node.js version is 16 or higher

## Deployment Options

### Docker Deployment (Recommended)

See [DOCKER.md](DOCKER.md) for comprehensive Docker guide.

Quick start:
```bash
docker-compose up -d
```

### Cloud Platforms

Deploy to any Docker-supporting platform:

- **Render.com** (Free tier available) - See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Railway** - Simple `railway up`
- **Heroku** - `heroku container:push web && heroku container:release web`
- **DigitalOcean App Platform** - Connect GitHub and deploy
- **AWS ECS/Fargate** - Use provided Dockerfile
- **Google Cloud Run** - Deploy with one command
- **Fly.io** - `fly deploy`

## Documentation

- **[README.md](README.md)** - This file (getting started)
- **[DOCKER.md](DOCKER.md)** - Complete Docker guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Render.com deployment guide

## License

MIT License - feel free to use and modify as needed!

## Contributing

Feel free to submit issues or pull requests if you'd like to improve the bot or add more features.

---

Made with ❤️ and TypeScript
# airports-name-bot
