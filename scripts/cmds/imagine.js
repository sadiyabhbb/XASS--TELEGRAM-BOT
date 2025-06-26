const axios = require('axios');

module.exports = {
    config: {
        name: "imagine",
        author: "BaYjid",
        description: "Generate and send an AI image using Mesbah's Niji API",
        category: "image",
        usage: "<prompt>",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, args }) {
        const prompt = args.join(' ');
        if (!prompt) {
            bot.sendMessage(chatId, "⚠️ Please provide a prompt to generate an image.");
            return;
        }

        const apiUrl = `https://api.mesbah-saxx.is-best.net/api/ai/niji?prompt=${encodeURIComponent(prompt)}`;

        try {
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const imageData = Buffer.from(response.data, 'binary');
            await bot.sendPhoto(chatId, imageData);
        } catch (error) {
            console.error('Error sending image:', error.message);
            bot.sendMessage(chatId, '❌ Failed to generate image from prompt.');
        }
    }
};