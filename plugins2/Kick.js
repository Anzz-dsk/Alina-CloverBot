const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn }) => {
  const rawID = conn.user?.id || "";
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net";

  const prefixPath = path.resolve("prefixes.json");
  let prefixes = {};
  if (fs.existsSync(prefixPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
  }
  const usedPrefix = prefixes[subbotID] || ".";

  if (!msg.key.remoteJid.includes("@g.us")) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "❌ *Este comando solo funciona en grupos.*"
    }, { quoted: msg });
  }

  const chat = await conn.groupMetadata(msg.key.remoteJid);
  const senderId = msg.key.participant.replace(/@s\.whatsapp\.net/, "");
  const groupAdmins = chat.participants.filter(p => p.admin);
  const isAdmin = groupAdmins.some(admin => admin.id === msg.key.participant);

  let isOwner = false;
  try {
    const ownerFile = path.join(__dirname, "../../../config.js");
    if (fs.existsSync(ownerFile)) {
      const config = require(ownerFile);
      if (config.owner) isOwner = config.owner.some(o => o[0] === senderId);
    }
  } catch {}

  if (!isAdmin && !isOwner) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "𝑬𝒚 𝑬𝒚 𝑷𝒆𝒒𝒖𝒆𝒏̃𝒂 𝑵𝒐 𝒕𝒊𝒆𝒏𝒆𝒔 𝑷𝒆𝒓𝒎𝒊𝒔𝒐 𝒑𝒂𝒓𝒂 𝑬𝒍𝒊𝒎𝒊𝒏𝒂𝒓 𝒂 𝒍𝒐𝒔 𝒎𝒊𝒆𝒎𝒃𝒓𝒐𝒔 𝒅𝒆𝒍 𝑮𝒓𝒖𝒑𝒐\n\n𝑷𝒐𝒓 𝑳𝒐 𝒕𝒂𝒏𝒕𝒐 𝑺𝒐𝒍𝒐 𝑬𝒍 𝑨𝒅𝒎𝒊𝒏, 𝑪𝒓𝒆𝒂𝒅𝒐, 𝑷𝒓𝒐𝒑𝒊𝒆𝒕𝒂𝒓𝒊𝒐 𝑷𝒖𝒆𝒅𝒆𝒏 𝑼𝒔𝒂𝒓 𝑬𝒔𝒕𝒆 𝑪𝒐𝒎𝒂𝒏𝒅o​᭄"
    }, { quoted: msg });
  }

  let userToKick = null;
  const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (mention?.length > 0) userToKick = mention[0];

  if (!userToKick && msg.message?.extendedTextMessage?.contextInfo?.participant) {
    userToKick = msg.message.extendedTextMessage.contextInfo.participant;
  }

  if (!userToKick) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "✎𝑴𝒆𝒏𝒄𝒊𝒐𝒏𝒆 𝑨 𝒖𝒏 𝑼𝒔𝒖𝒂𝒓𝒊𝒐 𝒑𝒂𝒓𝒂 𝑬𝒙𝒑𝒖𝒍𝒔𝒂𝒓​᭄"
    }, { quoted: msg });
  }

  // ⚠️ Verificar si el objetivo también es admin
  const isTargetAdmin = groupAdmins.some(admin => admin.id === userToKick);
  if (isTargetAdmin) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "✎𝑵𝒐 𝑬𝒔𝒕𝒂 𝑷𝒆𝒓𝒎𝒊𝒕𝒊𝒅𝒐 𝑬𝒍𝒊𝒎𝒊𝒏𝒂𝒓 𝑨 𝑼𝒏 𝑨𝒅𝒎𝒊𝒏𝒊𝒔𝒕𝒓𝒂𝒅𝒐𝒓​᭄"
    }, { quoted: msg });
  }

  await conn.groupParticipantsUpdate(msg.key.remoteJid, [userToKick], "remove");

  return await conn.sendMessage(msg.key.remoteJid, {
    text: `@${userToKick.split("@")[0]} ✎𝑯𝒂 𝑺𝒊𝒅𝒐 𝑬𝒍𝒊𝒎𝒊𝒏𝒂𝒅𝒐 𝑫𝒆𝒍 𝑮𝒓𝒖𝒑𝒐 𝑸𝒖𝒆 𝑳𝒆 𝑽𝒂𝒚𝒂 𝑩𝒊𝒆𝒏, 𝒐 𝑸𝒖𝒆 𝒍𝒐 𝑨𝒕𝒓𝒐𝒑𝒆𝒍𝒍𝒆 𝑼𝒏 𝑻𝒓𝒆𝒏`,
    mentions: [userToKick]
  }, { quoted: msg });
};

handler.command = ["kick"];
module.exports = handler;
