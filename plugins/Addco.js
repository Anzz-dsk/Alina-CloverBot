// plugins/addco.js
const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  // Verificación de permisos
  if (isGroup && !isOwner && !isFromMe) {
    const metadata = await conn.groupMetadata(chatId);
    const participant = metadata.participants.find(p => p.id === senderId);
    const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

    if (!isAdmin) {
      return conn.sendMessage(chatId, {
        text: "✘ 𝑺𝒐𝒍𝒐 𝒍𝒐𝒔 𝒂𝒅𝒎𝒊𝒏𝒊𝒔𝒕𝒓𝒂𝒅𝒐𝒓𝒆𝒔, 𝒆𝒍 𝒐𝒘𝒏𝒆𝒓 𝒐 𝒆𝒍 𝒃𝒐𝒕 𝒑𝒖𝒆𝒅𝒆𝒏 𝒖𝒔𝒂𝒓 𝒆𝒔𝒕𝒆 𝑪𝒐𝒎𝒂𝒏𝒅𝒐."
      }, { quoted: msg });
    }
  } else if (!isGroup && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, {
      text: "✘ 𝑺𝒐𝒍𝒐 𝒆𝒍 𝒐𝒘𝒏𝒆𝒓 𝒐 𝒆𝒍 𝒎𝒊𝒔𝒎𝒐 𝒃𝒐𝒕 𝒑𝒖𝒆𝒅𝒆𝒏 𝒖𝒔𝒂𝒓 𝒆𝒔𝒕𝒆 𝒄𝒐𝒎𝒂𝒏𝒅𝒐 𝒆𝒏 𝑷𝒓𝒊𝒗𝒂𝒅𝒐."
    }, { quoted: msg });
  }

  // Verifica que se responda a un sticker
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted?.stickerMessage) {
    return conn.sendMessage(chatId, {
      text: "✘ 𝑹𝒆𝒔𝒑𝒐𝒏𝒅𝒆 𝒂 𝒖𝒏 𝒔𝒕𝒊𝒄𝒌𝒆𝒓 𝒑𝒂𝒓𝒂 𝒂𝒔𝒊𝒈𝒏𝒂𝒓𝒍𝒆 𝒖𝒏 𝑪𝒐𝒎𝒂𝒏𝒅𝒐."
    }, { quoted: msg });
  }

  const comando = args.join(" ").trim();
  if (!comando) {
    return conn.sendMessage(chatId, {
      text: "✘ 𝑬𝒔𝒑𝒆𝒄𝒊𝒇𝒊𝒄𝒂 𝒆𝒍 𝒄𝒐𝒎𝒂𝒏𝒅𝒐 𝒂 𝒂𝒔𝒊𝒈𝒏𝒂𝒓. 𝑬𝒋𝒆𝒎𝒑𝒍𝒐: addco kick"
    }, { quoted: msg });
  }

  const fileSha = quoted.stickerMessage.fileSha256?.toString("base64");
  if (!fileSha) {
    return conn.sendMessage(chatId, {
      text: "✘ 𝑵𝒐 𝒔𝒆 𝒑𝒖𝒅𝒐 𝒐𝒃𝒕𝒆𝒏𝒆𝒓 𝒆𝒍 𝑰𝑫 𝒖́𝒏𝒊𝒄𝒐 𝒅𝒆𝒍 𝑺𝒕𝒊𝒄𝒌𝒆𝒓."
    }, { quoted: msg });
  }

  const jsonPath = path.resolve("./comandos.json");
  const data = fs.existsSync(jsonPath)
    ? JSON.parse(fs.readFileSync(jsonPath, "utf-8"))
    : {};

  data[fileSha] = comando;
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });

  return conn.sendMessage(chatId, {
    text: `✘ 𝑺𝒕𝒊𝒄𝒌𝒆𝒓 𝒗𝒊𝒏𝒄𝒖𝒍𝒂𝒅𝒐 𝒂𝒍 𝒄𝒐𝒎𝒂𝒏𝒅𝒐 𝒄𝒐𝒏 𝒆𝒙𝒊𝒕𝒐: \`${comando}\``,
    quoted: msg
  });
};

handler.command = ["addco"];
handler.tags = ["tools"];
handler.help = ["addco <comando>"];
module.exports = handler;
