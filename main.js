const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');
const gradient = require('gradient-string');

const chatGroupsFile = path.join(__dirname, 'chatGroups.json');
const messageCountFile = path.join(__dirname, 'messageCount.json');
const VERSION_FILE = path.join(__dirname, 'version.txt');

if (!fs.existsSync(messageCountFile)) fs.writeFileSync(messageCountFile, JSON.stringify({}), 'utf8');
if (!fs.existsSync(chatGroupsFile)) fs.writeFileSync(chatGroupsFile, JSON.stringify([]), 'utf8');

let chatGroups = JSON.parse(fs.readFileSync(chatGroupsFile, 'utf8'));
let gbanList = [];
let lastCommitSha = null;
const cooldowns = new Map();
const commands = [];
let adminOnlyMode = false;

function createGradientLogger() {
    const colors = ['blue', 'cyan'];
    return (message) => {
        const colorIndex = Math.floor(Math.random() * colors.length);
        const color1 = colors[colorIndex];
        const color2 = colors[(colorIndex + 1) % colors.length];
        console.log(gradient(color1, color2)(message));
    };
}
const logger = createGradientLogger();

const bot = new TelegramBot(config.token, { polling: true });
logger(`\n🤖 XASS Bot by BaYjid 🔥\n`);
bot.on('polling_started', () => logger('✅ Bot polling started'));
bot.on('polling_error', (error) => logger('[Polling Error]', error));

async function fetchGbanList() {
    try {
        const res = await axios.get('https://raw.githubusercontent.com/BAYJID-403/Gban/refs/heads/main/gban.json');
        gbanList = res.data.map(user => user.ID);
    } catch (err) {
        logger('[GBAN Fetch Error]', err.message);
    }
}
fetchGbanList();
cron.schedule('*/1 * * * *', fetchGbanList);

fs.readdirSync('./scripts/cmds').forEach((file) => {
    if (file.endsWith('.js')) {
        try {
            const command = require(`./scripts/cmds/${file}`);
            command.config.role ??= 0;
            command.config.cooldown ??= 0;
            commands.push({ ...command, config: { ...command.config, name: command.config.name.toLowerCase() } });
            registerCommand(bot, command);
        } catch (err) {
            console.error(`❌ Error loading ${file}:`, err.message);
        }
    }
});

function registerCommand(bot, command) {
    const pattern = command.config.usePrefix
        ? `^${config.prefix}${command.config.name}\\b(.*)$`
        : `^${command.config.name}\\b(.*)$`;

    bot.onText(new RegExp(pattern, 'i'), (msg, match) => {
        executeCommand(bot, command, msg, match);
    });
}

async function isUserAdmin(bot, chatId, userId) {
    try {
        const admins = await bot.getChatAdministrators(chatId);
        return admins.some(admin => admin.user.id === userId);
    } catch {
        return false; // bot is not admin or can't fetch admin list
    }
}

async function executeCommand(bot, command, msg, match) {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const username = msg.from.username;
        const firstName = msg.from.first_name;
        const lastName = msg.from.last_name || '';
        const args = match[1].trim().split(/\s+/);
        const messageReply = msg.reply_to_message;
        const messageReply_username = messageReply?.from?.username || null;
        const messageReply_id = messageReply?.from?.id || null;

        const isAdmin = await isUserAdmin(bot, chatId, userId);
        const isBotOwner = userId === config.owner_id;

        if (gbanList.includes(userId.toString()))
            return bot.sendMessage(chatId, '⛔ You are globally banned.');

        if (adminOnlyMode && !isBotOwner)
            return bot.sendMessage(chatId, '🔒 Bot is in admin-only mode.');

        if (command.config.role === 2 && !isBotOwner)
            return bot.sendMessage(chatId, '🔐 Only bot owner can use this.');

        if (command.config.role === 1 && !isAdmin && !isBotOwner)
            return bot.sendMessage(chatId, '👮‍♂️ Only group admins can use this.');

        const cooldownKey = `${command.config.name}-${userId}`;
        const now = Date.now();
        if (cooldowns.has(cooldownKey)) {
            const lastUsed = cooldowns.get(cooldownKey);
            const cooldownMs = command.config.cooldown * 1000;
            if (now < lastUsed + cooldownMs) {
                const timeLeft = Math.ceil((lastUsed + cooldownMs - now) / 1000);
                return bot.sendMessage(chatId, `⏳ Wait ${timeLeft}s to use /${command.config.name} again.`);
            }
        }

        cooldowns.set(cooldownKey, now);

        command.onStart({
            bot, chatId, args, userId, username,
            firstName, lastName, msg, match,
            messageReply, messageReply_username, messageReply_id
        });

    } catch (err) {
        console.error(`[Command Error: ${command.config.name}]`, err.message);
        bot.sendMessage(msg.chat.id, '⚠️ Command error occurred.');
    }
}

bot.onText(new RegExp(`^${config.prefix}(\\S*)`, 'i'), (msg, match) => {
    const cmd = match[1].toLowerCase();
    if (!commands.some(c => c.config.name === cmd)) {
        bot.sendMessage(msg.chat.id, `❌ Command not found. Try ${config.prefix}help`);
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text?.toLowerCase();
    if (!text) return;
    const isCommand = text.startsWith(config.prefix.toLowerCase());
    const isTest = text === 'xass test';
    if (!isCommand && !isTest) return;

    console.log(`[CMD] ${msg.chat.type} | ${userId}: ${text}`);

    try {
        const data = fs.readFileSync(messageCountFile);
        const messageCount = JSON.parse(data);
        messageCount[chatId] ??= {};
        messageCount[chatId][userId] = (messageCount[chatId][userId] || 0) + 1;
        fs.writeFileSync(messageCountFile, JSON.stringify(messageCount));
    } catch (e) {
        logger('[Count Error]', e.message);
    }

    if (!chatGroups.includes(chatId)) {
        chatGroups.push(chatId);
        fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups, null, 2));
    }

    if ((msg.chat.type === 'group' || msg.chat.type === 'supergroup') && isTest) {
        bot.sendMessage(chatId, '✅ Xass Bot is active in this group!');
    }
});

bot.on('new_chat_members', (msg) => {
    if (!config.greetNewMembers?.enabled) return;
    const chatId = msg.chat.id;
    const gifUrl = config.greetNewMembers.gifUrl;

    msg.new_chat_members.forEach(member => {
        const fullName = `${member.first_name} ${member.last_name || ''}`.trim();
        const welcomeText = `👋 Hello, <b>${fullName}</b>!\n\n✨ Welcome to <b>${msg.chat.title}</b>!\n🤖 I am <b>XASS</b>, your bot assistant.\n\n🎯 Use <code>${config.prefix}help</code> to get started.`;

        bot.sendAnimation(chatId, gifUrl, {
            caption: '🎉 New Member Joined!',
            parse_mode: 'HTML'
        }).catch(() => {
            bot.sendMessage(chatId, '🎉 A new member joined!');
        }).finally(() => {
            bot.sendMessage(chatId, welcomeText, { parse_mode: 'HTML' }).catch(() => {
                bot.sendMessage(chatId, `👋 Welcome, ${fullName}!`);
            });
        });
    });
});

bot.on('left_chat_member', (msg) => {
    const chatId = msg.chat.id;
    if (chatGroups.includes(chatId)) {
        chatGroups = chatGroups.filter(id => id !== chatId);
        fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups, null, 2));
    }
});

function loadLastCommitSha() {
    if (fs.existsSync(VERSION_FILE)) {
        lastCommitSha = fs.readFileSync(VERSION_FILE, 'utf8').trim();
    } else {
        lastCommitSha = 'init';
        fs.writeFileSync(VERSION_FILE, lastCommitSha);
    }
}
loadLastCommitSha();

async function checkLatestCommit() {
    try {
        const res = await axios.get(`https://api.github.com/repos/BAYJID-00/XASS-V2/commits`);
        const latest = res.data[0];
        if (latest.sha !== lastCommitSha) {
            logger(`🚨 Update Detected:\n- From: ${lastCommitSha}\n- To: ${latest.sha}\n- Message: ${latest.commit.message}`);
        }
    } catch (err) {
        logger('[Update Check Error]', err.message);
    }
}
cron.schedule('* * * * *', checkLatestCommit);

module.exports = bot;