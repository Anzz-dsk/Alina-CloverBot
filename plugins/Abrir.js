const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) {
    await conn.sendMessage(chatId, {
      text: "✘ 𝑬𝒔𝒕𝒆 𝒄𝒐𝒎𝒂𝒏𝒅𝒐 𝒔𝒐𝒍𝒐 𝒑𝒖𝒆𝒅𝒆 𝒖𝒔𝒂𝒓𝒔𝒆 𝑬𝒏 𝑮𝒓𝒖𝒑𝒐𝒔."
    }, { quoted: msg });
    return;
  }

  const metadata = await conn.groupMetadata(chatId);
  const participante = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participante?.admin === "admin" || participante?.admin === "superadmin";
  const isOwner = global.owner.some(([id]) => id === senderClean);
  const isFromMe = msg.key.fromMe;

  if (!isAdmin && !isOwner && !isFromMe) {
    await conn.sendMessage(chatId, {
      text: "✘ 𝒔𝒐𝒍𝒐 𝑨𝒅𝒎𝒊𝒏𝒊𝒔𝒕𝒓𝒂𝒅𝒐𝒓𝒆𝒔 𝒐 𝑶𝒘𝒏𝒆𝒓𝒔 𝑷𝒖𝒆𝒅𝒆𝒏 𝑼𝒔𝒂𝒓 𝑬𝒔𝒕𝒆 𝑪𝒐𝒎𝒂𝒏𝒅𝒐."
    }, { quoted: msg });
    return;
  }

  if (!args[0]) {
    await conn.sendMessage(chatId, {
      text: "⚙️ 𝑼𝒔𝒂𝒓: *Abrir 10s*, *abrir 10m* o *abrir 1h* para programar la apertura automática."
    }, { quoted: msg });
    return;
  }

  const match = args[0].match(/^(\d+)([smh])$/i);
  if (!match) {
    await conn.sendMessage(chatId, {
      text: "❌ Formato incorrecto. Usa: *abrir 10s*, *abrir 10m* o *abrir 1h*."
    }, { quoted: msg });
    return;
  }

  const amount = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  let milliseconds = 0;

  if (unit === "s") milliseconds = amount * 1000;
  else if (unit === "m") milliseconds = amount * 60 * 1000;
  else if (unit === "h") milliseconds = amount * 60 * 60 * 1000;
  else milliseconds = 0;

  if (milliseconds <= 0) {
    await conn.sendMessage(chatId, {
      text: "❌ Tiempo inválido."
    }, { quoted: msg });
    return;
  }

  const tiempoPath = path.resolve("./tiempo2.json");
  if (!fs.existsSync(tiempoPath)) {
    fs.writeFileSync(tiempoPath, JSON.stringify({}, null, 2));
  }

  const tiempoData = JSON.parse(fs.readFileSync(tiempoPath, "utf-8"));
  const ahora = Date.now();
  tiempoData[chatId] = ahora + milliseconds;
  fs.writeFileSync(tiempoPath, JSON.stringify(tiempoData, null, 2));

  await conn.sendMessage(chatId, {
    text: `⏳ 𝑮𝒓𝒖𝒑𝒐 𝑷𝒓𝒐𝒈𝒓𝒂𝒎𝒂𝒅𝒐 𝑷𝒂𝒓𝒂 𝑨𝒃𝒓𝒊𝒓𝒔𝒆 𝑨𝒖𝒕𝒐𝒎𝒂́𝒕𝒊𝒄𝒂𝒎𝒆𝒏𝒕𝒆 𝑬𝒏 *${amount}${unit}*.`
  }, { quoted: msg });

  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ["abrir"];
module.exports = handler;
