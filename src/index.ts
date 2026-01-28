import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import * as dotenv from 'dotenv';
import { searchAirport, getAirportByCode } from './airports';
import express from 'express';

// Load environment variables
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('Error: BOT_TOKEN is not defined in environment variables');
  console.error('Please create a .env file with your bot token:');
  console.error('BOT_TOKEN=your_token_here');
  process.exit(1);
}

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Start command
bot.command('start', (ctx) => {
  ctx.reply(
    '✈️ Welcome to Airport Lookup Bot!\n\n' +
    'Send me an airport IATA code and I\'ll show you the full airport information.\n\n' +
    'Examples:\n' +
    '• JFK → Full airport details\n' +
    '• LAX → Full airport details\n' +
    '• LHR → Full airport details\n\n' +
    'Just type the airport code to get started!'
  );
});

// Help command
bot.command('help', (ctx) => {
  ctx.reply(
    '🆘 How to use Airport Lookup Bot:\n\n' +
    '1. Simply send me an airport IATA code (3-letter code)\n' +
    '2. I\'ll respond with full airport information:\n' +
    '   • Airport Name\n' +
    '   • City\n' +
    '   • Country\n' +
    '   • IATA Code\n' +
    '   • ICAO Code\n' +
    '3. Searches are case-insensitive\n' +
    '4. Partial matches are supported\n\n' +
    'Examples:\n' +
    '• Type "JFK" → Full airport details\n' +
    '• Type "jfk" → Same result (case-insensitive)\n' +
    '• Type "SFO" → Full airport details\n\n' +
    'Have fun exploring airports around the world! ✈️'
  );
});

// Handle text messages
bot.on(message('text'), async (ctx) => {
  const userQuery = ctx.message.text.trim();

  // Ignore if it's a command
  if (userQuery.startsWith('/')) {
    return;
  }

  try {
    // Search for airports in Supabase
    const results = await searchAirport(userQuery);

    if (results.length === 0) {
      ctx.reply(
        `❌ No airport found for "${userQuery}"\n\n` +
        'Please try another airport code.\n' +
        'Use /help for more information.\n\n' +
        'dev: sami sky'
      );
      return;
    }

    // If exactly one match, show full details
    if (results.length === 1) {
      const airport = results[0];
      const response = 
        `✈️ Airport Information\n\n` +
        `📍 Name: ${airport.Name}\n` +
        `🏙️ City: ${airport.City || 'N/A'}\n` +
        `🌍 Country: ${airport.Country || 'N/A'}\n` +
        `✈️ IATA: ${airport.IATA}\n` +
        `🛫 ICAO: ${airport.ICAO || 'N/A'}\n\n` +
        `dev: sami sky`;
      ctx.reply(response);
      return;
    }

    // If multiple matches, show all (max 20 due to Telegram message limits)
    const displayResults = results.slice(0, 20);
    const responseLines = [
      `✈️ Found ${results.length} airport${results.length > 1 ? 's' : ''}${results.length > 20 ? ' (showing first 20)' : ''}:\n`
    ];
    displayResults.forEach((airport) => {
      const cityCountry = airport.City && airport.Country 
        ? `, ${airport.City}, ${airport.Country}` 
        : airport.Country 
        ? `, ${airport.Country}` 
        : '';
      responseLines.push(`• ${airport.IATA}: ${airport.Name}${cityCountry}`);
    });
    responseLines.push(`\ndev: sami sky`);

    ctx.reply(responseLines.join('\n'));
  } catch (error) {
    console.error('Error processing query:', error);
    ctx.reply(
      '❌ Sorry, there was an error searching for airports.\n' +
      'Please try again later.\n\n' +
      'dev: sami sky'
    );
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply('Sorry, an error occurred. Please try again.\n\ndev: sami sky');
});

// Create HTTP server for Render health checks
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Telegram Airport Bot is running',
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start HTTP server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 HTTP server listening on port ${PORT}`);
});

// Start the bot
bot.launch()
  .then(() => {
    console.log('🤖 Bot is running...');
    console.log('Press Ctrl+C to stop');
  })
  .catch((err) => {
    console.error('Failed to start bot:', err);
    process.exit(1);
  });

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('\nStopping bot...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('\nStopping bot...');
  bot.stop('SIGTERM');
});
