const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "✘ 𝑬𝒔𝒕𝒆 𝑪𝒐𝒎𝒂𝒏𝒅𝒐 𝑺𝒐𝒍𝒂𝒎𝒆𝒏𝒕𝒆 𝑷𝒖𝒆𝒅𝒆 𝑺𝒆𝒓 𝒖𝒔𝒂𝒅𝒐 𝑬𝒏 𝑮𝒓𝒖𝒑𝒐𝒔​᭄"
    }, { quoted: msg });
  }

  const metadata = await conn.groupMetadata(chatId);
  const isAdmin = metadata.participants.find(p => p.id === senderId)?.admin;
  if (!isAdmin && !isOwner) {
    return conn.sendMessage(chatId, {
      text: "✘ 𝑺𝒐𝒍𝒂𝒎𝒆𝒏𝒕𝒆 𝑨𝒅𝒎𝒊𝒏𝒔, 𝑪𝒓𝒆𝒂𝒅𝒐𝒓, 𝑷𝒓𝒐𝒑𝒊𝒆𝒕𝒂𝒓𝒊𝒐𝒔 𝑷𝒖𝒆𝒅𝒆𝒏 𝑼𝒔𝒂𝒓 𝑬𝒔𝒕𝒆 𝑪𝒐𝒎𝒂𝒏𝒅𝒐᭄"
    }, { quoted: msg });
  }

  const context = msg.message?.extendedTextMessage?.contextInfo;
  const target = context?.participant;

  if (!target) {
    return conn.sendMessage(chatId, {
      text: "✘ 𝑹𝒆𝒔𝒑𝒐𝒏𝒅𝒆 𝑨𝒍 𝑴𝒆𝒏𝒔𝒂𝒋𝒆 𝑫𝒆𝒍 𝑼𝒔𝒖𝒂𝒓𝒊𝒐 𝑸𝒖𝒆 𝑫𝒆𝒔𝒆𝒆 𝑩𝒂𝒏𝒆𝒂𝒓᭄"
    }, { quoted: msg });
  }

  const targetNum = target.replace(/[^0-9]/g, "");
  if (global.owner.some(([id]) => id === targetNum)) {
    return conn.sendMessage(chatId, {
      text: "𝑬𝒚 𝑬𝒚 𝑷𝒆𝒒𝒖𝒆𝒏̃𝒂, 𝑵𝒐 𝒑𝒖𝒆𝒅𝒆𝒔 𝑩𝒂𝒏𝒆𝒂𝒓 𝑨 𝑴𝒊 𝑸𝒖𝒆𝒓𝒊𝒅𝒐 𝑪𝒓𝒆𝒂𝒅𝒐𝒓/𝑷𝒓𝒐𝒑𝒊𝒆𝒕𝒂𝒓𝒊𝒐᭄\n\n> 𝘼𝙣𝙯𝙯 𝘿𝙨𝙠 | 𝘼𝙡𝙞𝙣𝙖 𝘽𝙤𝙩"
    }, { quoted: msg });
  }

  const banPath = path.resolve("./ban.json");
  const banData = fs.existsSync(banPath) ? JSON.parse(fs.readFileSync(banPath)) : {};
  if (!banData[chatId]) banData[chatId] = [];

  if (!banData[chatId].includes(target)) {
    banData[chatId].push(target);
    fs.writeFileSync(banPath, JSON.stringify(banData, null, 2));
    await conn.sendMessage(chatId, {
      text: `@${target.split("@")[0]} 𝑯𝒂 𝒔𝒊𝒅𝒐 𝑩𝒂𝒏𝒆𝒂𝒅𝒐 𝑬𝒙𝒊𝒕𝒐𝒔𝒂𝒎𝒆𝒏𝒕𝒆, 𝑸𝒖𝒆 𝒍𝒆 𝑽𝒂𝒚𝒂 𝑩𝒊𝒆𝒏, 𝒐 𝑸𝒖𝒆 𝒍𝒐 𝒂𝒕𝒓𝒐𝒑𝒆𝒍𝒍𝒆 𝑼𝒏 𝑻𝒓𝒆𝒏​᭄`,
      mentions: [target]
    }, { quoted: msg });
  } else {
    await conn.sendMessage(chatId, {
      text: "✘ 𝑬𝒔𝒕𝒆 𝑼𝒔𝒖𝒂𝒓𝒊𝒐 𝒀𝒂 𝒆𝒔𝒕𝒂 𝑩𝒂𝒏𝒆𝒂𝒅𝒐​᭄",
      mentions: [target]
    }, { quoted: msg });
  }
};

handler.command = ["ban"];
module.exports = handler;
