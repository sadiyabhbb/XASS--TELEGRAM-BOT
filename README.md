<h1 align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=30&pause=1000&center=true&vCenter=true&width=435&lines=%F0%9F%8C%88+Xass-V2+Telegram+Bot;Modular+%7C+Powerful+%7C+Fast" alt="Xass-V2 Banner" />
</h1>

<p align="center">
  <b>A powerful, modular, API-integrated Telegram bot framework for automation, creativity & control.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Xass-V2-2.0-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Platform-Telegram-blueviolet?style=for-the-badge">
  <img src="https://img.shields.io/github/license/BAYJID-00/Xass-V2?style=for-the-badge">
</p>

---

## 🧠 Why Xass?

Most Telegram bots are either:
- ❌ Too basic  
- ❌ Too bloated  
- ❌ Too restrictive  

**Xass-V2** solves this with:
- ✅ Modular command system (drop files in `/cmd`)  
- 🔌 External API support (Lyrics, AI Images, Weather, VirusTotal)  
- 🔐 Role-based admin protection  
- 🧱 Clean, scalable developer structure  

> It’s not just a bot — it’s your **command center** inside Telegram.

---

## 🏗️ Architecture Overview

- 📦 Command modules in `/cmd`  
- 💬 Powered by `node-telegram-bot-api`  
- 🔒 Per-command permission control  
- ⚙️ Auto-load system  
- 🚀 Easily extendable

---

## 🚀 Quickstart Guide

### 🔑 1. Get a Bot Token

1. Open [@BotFather](https://t.me/BotFather) on Telegram  
2. Type `/newbot` and follow prompts  
3. Save your **Bot Token**

---

### 🛠️ 2. Set Up Locally

```bash
git clone https://github.com/BAYJID-00/XASS--TELEGRAM-BOT.git
cd XASS--TELEGRAM-BOT
npm install
node index.js

---


### /*Example command*


module.exports = {
  config: {
    name: "hello", // 👈 /hello
    description: "Replies with a welcome message",
    usage: "/hello",
    category: "fun",
    usePrefix: true // So it works with /hello
  },

  onStart: async function ({ bot, message }) {
    const name = message.from.first_name || "friend";
    await bot.sendMessage(message.chat.id, `👋 Hello, ${name}! Welcome to Xass-V2.`);
  }
};