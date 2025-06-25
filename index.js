import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

// 🌐 Keep-alive server for Replit + UptimeRobot
const app = express();
app.get('/', (req, res) => res.send('Bot is online!'));
app.listen(3000, () => console.log('Express server running.'));

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// ✅ Start bot and loop stat updates
bot.once('ready', () => {
  console.log(`✅ Logged in as ${bot.user.tag}`);
  setInterval(updateStats, 60000); // Post stats every 30 seconds
});

// 📊 Function to fetch stats and post a NEW message each time
async function updateStats() {
  try {
    const res = await fetch(`https://games.roblox.com/v1/games?universeIds=${process.env.GAME_ID}`);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      console.warn("⚠️ No game data returned. Check GAME_ID or if the game is public.");
      return;
    }

    const game = data.data[0];
    const content = `
-------------------------------------------------------
👨‍🦲🎮 Active players: ${game.playing}
-------------------------------------------------------
👥 Visits: ${game.visits.toLocaleString()}
-------------------------------------------------------
🎯 Next milestone: ${game.visits.toLocaleString()}/1000
-------------------------------------------------------
`;

    const channel = await bot.channels.fetch(process.env.CHANNEL_ID);
    await channel.send(content); // ➕ Sends a new message every 30 seconds

  } catch (err) {
    console.error("❌ Error during stats update:", err);
  }
}

// 🔐 Login using bot token from .env
bot.login(process.env.TOKEN);
