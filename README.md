<h1 align="center">⚡ Xass-V2 Telegram Bot</h1>

<p align="center">
A powerful, modular, API-integrated Telegram bot framework for automation, creativity, and control.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Xass-V2-blue?style=for-the-badge" alt="Xass V2">
  <img src="https://img.shields.io/badge/Platform-Telegram-blueviolet?style=for-the-badge" alt="Telegram Bot">
  <img src="https://img.shields.io/github/license/BAYJID-00/Xass-V2?style=for-the-badge" alt="License">
</p>

---

## 🧠 Why Xass?

Most Telegram bots are either basic, bloated, or too limited.

**Xass-V2** solves that by offering:

- Full modularity with plug-and-play commands
- Powerful external API integrations (Lyrics, Weather, AI Images, VirusTotal)
- Admin command protection
- Clean structure for developers to extend quickly

It’s not just a bot. It’s your *command center* inside Telegram.

---

## 🏗 Architecture Overview





- 🔧 Add features by dropping files in `/cmd`
- 💬 All commands use Telegram’s `node-telegram-bot-api`
- 🔒 Permissions handled inside each command config

---

## 🚀 Quickstart

### 1. Get Your Bot Token

- Talk to [@BotFather](https://t.me/BotFather)
- Type `/newbot`, follow steps
- Copy your **Bot Token**

---

### 2. Set Up Locally

```bash
git clone https://github.com/BAYJID-00/XASS--TELEGRAM-BOT.git
cd XASS--TELEGRAM-BOT
npm install



/*example command 

module.exports = {
  config: {
    name: "userinfo", // Command: /userinfo
    description: "Shows your Telegram info",
    usage: "/userinfo",
    category: "utility",
    usePrefix: true // Enables usage with "/userinfo"
  },

  onStart: async function ({ bot, message }) {
    const from = message.from;

    const info = `
👤 Name: ${from.first_name || "N/A"} ${from.last_name || ""}
🆔 User ID: ${from.id}
📛 Username: @${from.username || "N/A"}
🌐 Language: ${from.language_code || "unknown"}
    `;

    bot.sendMessage(message.chat.id, info.trim());
  }
};
