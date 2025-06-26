const axios = require('axios');

module.exports = {
  config: {
    name: "lyrics",
    author: "BaYjid",
    description: "Get lyrics of any song",
    usage: "<song name>",
    category: "music",
    usePrefix: true
  },

  onStart: async function ({ bot, chatId, args }) {
    const query = args.join(" ");
    if (!query) return bot.sendMessage(chatId, "❌ Please provide a song name.\n\nExample: `lyrics Shape of You`");

    try {
      const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(query.split(" - ")[0])}/${encodeURIComponent(query.split(" - ")[1] || query)}`);
      const lyrics = res.data.lyrics;

      if (!lyrics) return bot.sendMessage(chatId, "❌ Lyrics not found. Try another song.");

      const caption = `🎵 Lyrics for *${query}*\n\n${lyrics.length > 4000 ? lyrics.slice(0, 4000) + "\n\n... (truncated)" : lyrics}`;
      return bot.sendMessage(chatId, caption, { parse_mode: "Markdown" });

    } catch (e) {
      return bot.sendMessage(chatId, "❌ Failed to fetch lyrics. Song may not exist or API error.");
    }
  }
};