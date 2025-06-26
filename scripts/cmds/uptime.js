const os = require("os");
const fs = require("fs");
const { execSync } = require("child_process");
const packageJson = JSON.parse(fs.readFileSync("package.json"));
const { dependencies = {}, devDependencies = {}, version } = packageJson;

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "upt_"],
    version: "1.0",
    author: "Saxx | Xass)",
    description: "Shows bot uptime and system info",
    category: "📊 System",
    usage: "uptime",
    usePrefix: false
  },

  onStart: async function ({ bot, chatId }) {
    try {
      const totalMemory = os.totalmem() / (1024 ** 3);
      const freeMemory = os.freemem() / (1024 ** 3);
      const memoryUsage = totalMemory - freeMemory;

      const pingStart = Date.now();
      const processing = await bot.sendMessage(chatId, "⏳ Calculating...");

      // Simulate ping delay (Telegram edit delay)
      const ping = Date.now() - pingStart;

      const cpuInfo = os.cpus()[0];
      const ramUsageMB = os.totalmem() / 1024 / 1024 - os.freemem() / 1024 / 1024;
      const uptime = formatTime(process.uptime() * 1000);

      const msg = `
╭───────⟡
× 🤖 BOT INFORMATION
├ Bot Name: ${packageJson.name || "XASS Bot"}
├ Bot Version: ${version}
├ Node.js: ${process.version}
├ NPM: ${execSync("npm --version").toString().trim()}
├ Packages: ${Object.keys({ ...dependencies, ...devDependencies }).length}
├ 𝐗𝐀𝐒𝐒 𝐁𝐎𝐓__/:;)🤍 
╰───────⟡

╭───────⟡
× 📈 UPTIME
├ Process Time: ${uptime}
├ Ping: ${ping} ms
╰───────⟡

╭───────⟡
× 💻 HOST INFO
├ Platform: ${os.type()} ${os.release()}
├ Architecture: ${os.arch()}
├ CPU: ${cpuInfo.model}
├ Cores: ${os.cpus().length}
├ Load Avg: ${os.loadavg()[0].toFixed(2)}
╰───────⟡

╭───────⟡
× 🧠 MEMORY
├ Total: ${totalMemory.toFixed(2)} GB
├ Used: ${memoryUsage.toFixed(2)} GB
├ Free: ${freeMemory.toFixed(2)} GB
├ Used in MB: ${ramUsageMB.toFixed(2)} MB
╰───────⟡

📍 *Executed at:* ${new Date().toLocaleString()}
      `.trim();

      await bot.editMessageText(msg, {
        chat_id: chatId,
        message_id: processing.message_id,
        parse_mode: "Markdown"
      });
    } catch (err) {
      console.error("❌ Error:", err);
      await bot.sendMessage(chatId, `❌ Error: ${err.message}`);
    }
  }
};

// Helper to format uptime (ms to h m s)
function formatTime(ms) {
  const sec = Math.floor(ms / 1000);
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}