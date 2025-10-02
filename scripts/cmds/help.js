const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'help',
    description: 'Show available commands',
    usage: '/help [command_name | page]',
    author: 'MODIFIED LIKHON AHMED',
    category: 'info',
    role: 0,
    cooldown: 0,
    usePrefix: true,
    version: "2.4",
    shortDescription: "Show all bot commands in styled format",
    longDescription: "Display help menu in category style like a guide book",
    guide: {
      en: "{pn} [page | command name]"
    }
  },
  onStart: async function ({ msg, bot, match }) {
    try {
      const commandsDir = path.join(__dirname, '.');
      const files = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

      const commands = {};
      const categorizedCommands = {};

      for (const file of files) {
        const command = require(path.join(commandsDir, file));
        const category = command.config.category || 'Uncategorized';

        if (!categorizedCommands[category]) categorizedCommands[category] = [];

        commands[command.config.name] = command.config;
        categorizedCommands[category].push(command.config.name);
      }

      const args = match ? match[1]?.trim().split(" ") || [] : [];
      const prefix = "/";

      if (args.length > 0 && isNaN(args[0])) {
        const name = args[0].toLowerCase();
        const cmdConfig = commands[name];

        if (!cmdConfig) return bot.sendMessage(msg.chat.id, `❌ Command not found: ${name}`);

        const info = `
╔═══════ 『 COMMAND: ${cmdConfig.name.toUpperCase()} 』 ═══════╗
║ 📜 Name      : ${cmdConfig.name}
║ 🪶 Aliases   : ${cmdConfig.aliases?.join(", ") || "None"}
║ 👤 Credits   : ${cmdConfig.author || "Unknown"}
║ 🔑 Permission: ${cmdConfig.role == 0 ? "Everyone" : (cmdConfig.role == 1 ? "Group Admin" : "Bot Admin Only")}
╠════════════════════════════╣
║ ℹ INFORMATION
║ ────────────────────────
║ Cost        : Free
║ Description :
║   ${cmdConfig.longDescription || cmdConfig.shortDescription || "No description"}
║ Guide       : ${cmdConfig.guide?.en || `${prefix}${cmdConfig.name}`}
╠══════════════════════════════════╣
║ ⚙ SETTINGS
║ ─────────────────────────────────
║ 🚩 Prefix Required : ✓ Required
║ ⚜ Premium         : ✗ Free to Use
╚═══════════════════════════════════╝
`;
        return bot.sendMessage(msg.chat.id, info, { parse_mode: 'markdown' });
      }

      const allCommands = Object.values(commands).sort((a, b) => a.name.localeCompare(b.name));
      const perPage = 20;
      const page = parseInt(args[0]) || 1;
      const totalPages = Math.ceil(allCommands.length / perPage);

      if (page < 1 || page > totalPages) return bot.sendMessage(msg.chat.id, `❌ Page ${page} does not exist. Total pages: ${totalPages}`);

      const start = (page - 1) * perPage;
      const end = start + perPage;
      const cmdsToShow = allCommands.slice(start, end);

      let helpMessage = '';
      for (const category in categorizedCommands) {
        helpMessage += `╭──『 ${category} 』\n`;
        helpMessage += `✧${categorizedCommands[category].join(' ✧')}\n`;
        helpMessage += "╰───────────◊\n";
      }

      helpMessage += `\n╭─✦『 LIKHON BOT 』✦────────╮\n`;
      helpMessage += `│ ✦ Total commands: ${allCommands.length.toString().padEnd(15, " ")}│\n`;
      helpMessage += `│ ✦ Page: ${page.toString().padEnd(22, " ")}│\n`;
      helpMessage += `│ ✦ A Personal Facebook Bot            │\n`;
      helpMessage += `│ ✦ ADMIN: 𝐋𝐈𝐊𝐇𝐎𝐍 𝐀𝐇𝐌𝐄𝐃               │\n`;
      helpMessage += `│ ✦ Type ${prefix}help [commandName] for details. │\n`;
      helpMessage += `╰──────────────────────╯`;

      await bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'markdown' });
    } catch (error) {
      console.error('Error generating help message:', error);
      await bot.sendMessage(msg.chat.id, 'An error occurred while generating the help message.');
    }
  }
};
