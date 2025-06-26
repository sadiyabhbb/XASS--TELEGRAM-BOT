const config = require('../../config.json');
const packageJson = require('../../package.json');
const os = require('os');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "prefix",
        author: "BaYjid",
        version: "2.0.1",
        description: "Shows the bot's current prefix and system stats.",
        category: "⚙️ Utility",
        usage: "prefix",
        usePrefix: false
    },

    onStart: async function ({ bot, chatId, sender }) {
        const start = Date.now();
        const username = sender?.first_name || "User";
        const uptime = formatUptime(process.uptime());
        const memoryUsage = formatMemory(process.memoryUsage().rss);
        const platform = os.platform();
        const botName = packageJson.name || "XASS Bot";
        const botVersion = packageJson.version || "1.0.0";
        const commandCount = getCommandCount();
        const latency = Date.now() - start;

        const msg = `
👋 Hey ${username}!  
🤖 Bot: \`${botName}\`  
📎 Prefix: \`${config.prefix}\`  
⚙️ Version: \`${botVersion}\`  
📜 Total Commands: \`${commandCount}\`  

🕒 Uptime: ${uptime}  
🚀 Latency: \`${latency}ms\`  
💾 RAM Usage: ${memoryUsage}  
🌍 Platform: \`${platform}\`

💡 Try: \`${config.prefix}help\` | \`${config.prefix}menu\`

🙋 Need help? Just scream “XASS” (or use \`${config.prefix}support\`)
        `.trim();

        await bot.sendMessage(chatId, msg, { parse_mode: "Markdown" });
    }
};

// Helper: Format uptime
function formatUptime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
}

// Helper: Format memory usage
function formatMemory(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// Helper: Count commands from command folder
function getCommandCount() {
    try {
        const commandDir = path.join(__dirname, "..");
        const files = fs.readdirSync(commandDir);
        return files.filter(file => file.endsWith(".js")).length;
    } catch (e) {
        return "N/A";
    }
}