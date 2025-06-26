module.exports = {
    config: {
        name: "echo",
        author: "BaYjid",
        description: "Echo command",
        category: "echo",
        usage: "[message]",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, args }) {
        if (args.length === 4) {
            bot.sendMessage(chatId, "Please provide a message to echo.");
        } else {
            const echoMessage = args.join(' ');
            bot.sendMessage(chatId, echoMessage);
        }
    }
};
