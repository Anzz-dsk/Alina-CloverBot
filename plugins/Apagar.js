const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: "✘ 𝑬𝒔𝒕𝒆 𝑪𝒐𝒎𝒂𝒏𝒅𝒐 𝑺𝒐𝒍𝒂𝒎𝒆𝒏𝒕𝒆 𝑷𝒖𝒆𝒅𝒆 𝒔𝒆𝒓 𝒖𝒔𝒂𝒅𝒐 𝒑𝒐𝒓 𝒎𝒊 𝑪𝒓𝒆𝒂𝒅𝒐𝒓 𝒐 𝑷𝒓𝒐𝒑𝒊𝒆𝒕𝒂𝒓𝒊𝒐 𝒅𝒆𝒍 𝑩𝒐𝒕\n\n彡𝑪𝒓𝒆𝒂𝒅𝒐𝒓 : 𝑨𝒏𝒛𝒛 𝒅𝒔𝒌\n彡𝑵𝒎𝒓 : +502 38999796"
    }, { quoted: msg });
  }

  const filePath = "./activos.json";
  const data = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
    : {};

  if (!data.apagado) data.apagado = {};
  data.apagado[chatId] = true;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  await conn.sendMessage(chatId, {
    text: "✎𝑨𝒍𝒊𝒏𝒂 𝒉𝒂 𝒔𝒊𝒅𝒐 𝑨𝒑𝒂𝒈𝒂𝒅𝒂 𝒆𝒏 𝒆𝒔𝒕𝒆 𝑮𝒓𝒖𝒑𝒐​᭄"
  }, { quoted: msg });
};

handler.command = ["apagar","offbye"];
module.exports = handler;
