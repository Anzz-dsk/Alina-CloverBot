const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: "✘ 𝑬𝒔𝒕𝒆 𝑪𝒐𝒎𝒂𝒏𝒅𝒐 𝑺𝒐𝒍𝒂𝒎𝒆𝒏𝒕𝒆 𝑷𝒖𝒆𝒅𝒆 𝑺𝒆𝒓 𝒖𝒔𝒂𝒅𝒐 𝑷𝒐𝒓 𝑴𝒊 𝑪𝒓𝒆𝒂𝒅𝒐𝒓/𝑷𝒓𝒐𝒑𝒊𝒆𝒕𝒂𝒓𝒊𝒐"
    }, { quoted: msg });
  }

  const filePath = "./activos.json";
  const data = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
    : {};

  if (data.apagado && data.apagado[chatId]) {
    delete data.apagado[chatId];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  await conn.sendMessage(chatId, {
    text: "☕︎︎𝑨𝒍𝒊𝒏𝒂 𝑯𝒂 𝑺𝒊𝒅𝒐 𝑨𝒄𝒕𝒊𝒗𝒂𝒅𝒂 𝑬𝒏 𝑬𝒔𝒕𝒆 𝑮𝒓𝒖𝒑𝒐​᭄"
  }, { quoted: msg });
};

handler.command = ["prender"];
module.exports = handler;
