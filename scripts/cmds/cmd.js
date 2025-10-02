const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "cmd",
    description: "Manage bot commands dynamically",
    usage: "/cmd <loadall|install|load|unload> [file]",
    category: "admin",
    role: 2, // only bot admin
    aliases: ["command"],
    cooldown: 5
  },

  onStart: async function({ msg, bot, match }) {
    try {
      const args = match ? match[1]?.trim().split(" ") : [];
      if (!args || args.length === 0) {
        return bot.sendMessage(msg.chat.id, `Usage:\n/cmd loadall\n/cmd install <file.js>\n/cmd load <file.js>\n/cmd unload <file.js>`);
      }

      const cmdDir = path.join(__dirname, '.');
      const action = args[0].toLowerCase();
      const fileName = args[1];

      switch(action) {
        case 'loadall': {
          const files = fs.readdirSync(cmdDir).filter(f => f.endsWith('.js') && f !== 'cmd.js');
          let success = [];
          let errors = [];

          for (const file of files) {
            try {
              delete require.cache[require.resolve(path.join(cmdDir, file))];
              require(path.join(cmdDir, file));
              success.push(file);
            } catch(e) {
              errors.push(`${file}: ${e.message}`);
            }
          }

          let msgText = `✅ Loaded commands: ${success.join(', ')}`;
          if(errors.length) msgText += `\n⚠ Errors:\n${errors.join('\n')}`;
          return bot.sendMessage(msg.chat.id, msgText);
        }

        case 'install': {
          if(!fileName) return bot.sendMessage(msg.chat.id, "❌ Please provide file name to install.");
          const filePath = path.join(cmdDir, fileName);
          if(!fs.existsSync(filePath)) return bot.sendMessage(msg.chat.id, `❌ File ${fileName} does not exist.`);

          try {
            delete require.cache[require.resolve(filePath)];
            require(filePath);
            return bot.sendMessage(msg.chat.id, `✅ Installed ${fileName} successfully.`);
          } catch(e) {
            return bot.sendMessage(msg.chat.id, `⚠ Error installing ${fileName}: ${e.message}`);
          }
        }

        case 'load': {
          if(!fileName) return bot.sendMessage(msg.chat.id, "❌ Please provide file name to load.");
          const filePath = path.join(cmdDir, fileName);
          if(!fs.existsSync(filePath)) return bot.sendMessage(msg.chat.id, `❌ File ${fileName} does not exist.`);

          try {
            delete require.cache[require.resolve(filePath)];
            const cmd = require(filePath);
            return bot.sendMessage(msg.chat.id, `✅ Loaded ${fileName} successfully.`);
          } catch(e) {
            return bot.sendMessage(msg.chat.id, `⚠ Error loading ${fileName}: ${e.message}`);
          }
        }

        case 'unload': {
          if(!fileName) return bot.sendMessage(msg.chat.id, "❌ Please provide file name to unload.");
          const filePath = path.join(cmdDir, fileName);
          try {
            delete require.cache[require.resolve(filePath)];
            return bot.sendMessage(msg.chat.id, `✅ Unloaded ${fileName} successfully.`);
          } catch(e) {
            return bot.sendMessage(msg.chat.id, `⚠ Error unloading ${fileName}: ${e.message}`);
          }
        }

        default:
          return bot.sendMessage(msg.chat.id, `❌ Unknown action: ${action}\nUsage:\n/cmd loadall\n/cmd install <file.js>\n/cmd load <file.js>\n/cmd unload <file.js>`);
      }

    } catch (err) {
      console.error(err);
      return bot.sendMessage(msg.chat.id, `⚠ Error executing command: ${err.message}`);
    }
  }
};
