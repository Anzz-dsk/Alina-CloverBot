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
  const userId = msg.key.participant || msg.key.remoteJid;

  // Reacción normal (no cambia)
  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "📜", key: msg.key }
  });

  const menu = `
╭ׅ┈ ─๋︩︪─︎︎︎︎︎̸𝘼 𝙇 𝙄 𝙉 𝘼 - 𝘾 𝙇 𝙊 𝙑 𝙀 𝙍︎︎︎̸ׅ┈ ─๋︩︪╮
│
├̟̇✎𝑶𝒘𝒏𝒆𝒓 : 𝘼𝙣𝙯𝙯 彡𝘿𝙨𝙠
├̟̇✎𝑵𝒎𝒓 *_: +502 38999796 ._*
│
╰─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─ ─๋︩︪─ ╯

╭〔 𝙎 𝙀 𝙍 - 𝙎 𝙐 𝘽 - 𝘽 𝙊 𝙏 〕
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}serbot / qr
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}code / codigo 
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}sercode / codigo
╰ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪──๋︩︪─╯

╭〔 𝘿 𝙀 𝙎 𝘾 𝘼 𝙍 𝙂 𝘼 𝙎 〕
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}play / ${usedPrefix}playdoc
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}play2 / ${usedPrefix}play2doc
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}play5
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}play6
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}ytmp3 / ${usedPrefix}ytmp3doc
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}ytmp35
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}ytmp4 / ${usedPrefix}ytmp4doc
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}ytmp45
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}apk
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}instagram / ${usedPrefix}ig
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}tiktok / ${usedPrefix}tt
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}facebook / ${usedPrefix}fb
╰ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪──๋︩︪─╯

╭〔 𝙎𝙏𝙆𝙍𝙎 + 𝙈 𝙐 𝙇 𝙏 𝙄 𝙈 𝘿 𝘼 〕
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}s
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}ver
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}toaudio 
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}hd
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}toimg
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}whatmusic
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}tts
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}perfil
╰ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪──๋︩︪─╯

╭〔 𝘾 𝙃 𝘼 𝙏 - 𝙄 𝘼 〕
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}chatgpt
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}geminis
╰ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪──๋︩︪─╯

╭〔 𝘾 𝙈 𝘿 - 𝙂 𝙍 𝙐 𝙋 𝙊 𝙎 〕
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}abrirgrupo
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}cerrargrupo
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}infogrupo
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}kick
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}modoadmins on o off
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}antilink on o off
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}welcome on o off
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}tag
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}tagall / ${usedPrefix}invocar / ${usedPrefix}todos
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}infogrupo
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}damelink
╰ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪──๋︩︪─╯

〔 Comandos De Juegos 〕
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}verdad
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}reto
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}memes o meme
╰ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪──๋︩︪─╯

╭〔 𝘾 𝙊 𝙉 𝙁 𝙄 𝙂 + 𝙊 𝙒 𝙉 𝙀 𝙍 〕
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}setprefix ↷
  Cambiar prefijo del subbot
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}creador ↷
  Contacto del creador
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}get ↷
  Descargar estados
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}addgrupo ↷
  Autorizar grupo pa que lo usen.
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}addlista ↷
  Autorizar usuario privado pa lo usen.
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}dellista ↷
  Quitar usuario autorizado pa que o lo usen.
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}delgrupo ↷
  Eliminar grupo autorizado pa que no lo usen.
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ${usedPrefix}ping ↷
  Medir latencia del bot
╰ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪─ ─ׅ─ׅ┈ ─๋︩︪──๋︩︪─╯  
`;

  // Mensaje principal con sendMessage2
  await conn.sendMessage(
  msg.key.remoteJid,
  {
    image: { url: `https://qu.ax/ZTjFR.jpg` },
    caption: menu
  },
  { quoted: msg }
);

  // Reacción final normal (no cambia)
  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ['menu', 'help', 'ayuda', 'comandos'];
module.exports = handler;
