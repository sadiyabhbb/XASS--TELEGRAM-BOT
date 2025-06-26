const axios = require('axios');

module.exports = {
    config: {
        name: "pinterest",
        author: "BaYjid",
        description: "Search Pinterest for beautiful images",
        category: "image",
        usage: "<search term>",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, args }) {
        const query = args.join(' ');
        if (!query) {
            return bot.sendMessage(chatId, "❌ Please provide a search keyword.\n\n*Example:* `.pin aesthetic girl`", { parse_mode: "Markdown" });
        }

        const apiUrl = `https://api.mesbah-saxx.is-best.net/api/utility/pinterest?search=${encodeURIComponent(query)}`;

        try {
            const res = await axios.get(apiUrl);
            const results = res.data?.result;

            if (!results || results.length === 0) {
                return bot.sendMessage(chatId, `❌ No images found for *${query}*`, { parse_mode: "Markdown" });
            }

            // Pick one random image from results
            const image = results[Math.floor(Math.random() * results.length)];

            await bot.sendPhoto(chatId, image, {
                caption: `🔍 Pinterest Result for: *${query}*`,
                parse_mode: "Markdown"
            });

        } catch (err) {
            console.error('❌ API Error:', err.message);
            return bot.sendMessage(chatId, "🚫 Failed to fetch Pinterest image. Try again later.");
        }
    }
};
