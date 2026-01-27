import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import * as dotenv from 'dotenv';
import { searchAirport, getAirportByCode } from './airports';

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
    'Send me an airport code (IATA code) and I\'ll tell you the full airport name.\n\n' +
    'Examples:\n' +
    '• JFK → John F. Kennedy International Airport\n' +
    '• LAX → Los Angeles International Airport\n' +
    '• LHR → London Heathrow Airport\n\n' +
    'Just type the airport code to get started!'
  );
});

// Help command
bot.command('help', (ctx) => {
  ctx.reply(
    '🆘 How to use Airport Lookup Bot:\n\n' +
    '1. Simply send me an airport IATA code (3-letter code)\n' +
    '2. I\'ll respond with the full airport name\n' +
    '3. Searches are case-insensitive\n' +
    '4. Partial matches are supported\n\n' +
    'Examples:\n' +
    '• Type "JFK" → John F. Kennedy International Airport\n' +
    '• Type "jfk" → Same result (case-insensitive)\n' +
    '• Type "SFO" → San Francisco International Airport\n\n' +
    'Have fun exploring airports around the world! ✈️'
  );
});

// Handle text messages
bot.on(message('text'), (ctx) => {
  const userQuery = ctx.message.text.trim();

  // Ignore if it's a command
  if (userQuery.startsWith('/')) {
    return;
  }

  // Search for airports
  const results = searchAirport(userQuery);

  if (results.length === 0) {
    ctx.reply(
      `❌ No airport found for "${userQuery}"\n\n` +
      'Please try another airport code.\n' +
      'Use /help for more information.'
    );
    return;
  }

  // If exactly one match, show it
  if (results.length === 1) {
    const airport = results[0];
    ctx.reply(`✈️ ${airport.code}: ${airport.name}`);
    return;
  }

  // If multiple matches, show all
  const responseLines = ['✈️ Found multiple airports:\n'];
  results.forEach((airport) => {
    responseLines.push(`• ${airport.code}: ${airport.name}`);
  });

  ctx.reply(responseLines.join('\n'));
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply('Sorry, an error occurred. Please try again.');
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
