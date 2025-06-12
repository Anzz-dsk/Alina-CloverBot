const handler = async (msg, { conn }) => {
  const fs = require("fs");
  const path = require("path");

  const subbotsFolder = "./subbots";
  const prefixPath = path.join(__dirname, "..", "prefixes.json");

  const subDirs = fs.existsSync(subbotsFolder)
    ? fs.readdirSync(subbotsFolder).filter(d => fs.existsSync(path.join(subbotsFolder, d, "creds.json")))
    : [];

  if (subDirs.length === 0) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "⚠️ No hay subbots conectados actualmente.",
      quoted: msg
    });
  }

  // Cargar prefijos si existen
  let dataPrefijos = {};
  if (fs.existsSync(prefixPath)) {
    dataPrefijos = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
  }

  const total = subDirs.length;
  const lista = subDirs.map((id, i) => {
    const jid = id.split("@")[0];
    const subbotJid = id.includes("@s.whatsapp.net") ? id : `${jid}@s.whatsapp.net`;
    const prefijo = dataPrefijos[subbotJid] || ".";

    return `╭彡 𝙎𝙪𝙗𝘽𝙤𝙩 ${i + 1}*\n├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 𝙉𝙪́𝙢𝙚𝙧𝙤: @${jid}\n├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 𝙋𝙧𝙚𝙛𝙞𝙟𝙤: *${prefijo}*\n╰───────────────`;
  }).join("\n\n");

  const menu = `╭━〔 𝘼𝙡𝙞𝙣𝙖 𝘾𝙡𝙤𝙫𝙚𝙧 𝙎𝙪𝙗𝙨 〕━彡\n├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 𝙎𝙪𝙗𝘽𝙤𝙩𝙨 𝙘𝙤𝙣𝙚𝙘𝙩𝙖𝙙𝙤𝙨\n│  Total: *${total}*\n╰━━━━━━━━━━━━彡\n\n${lista}`;

  await conn.sendMessage(msg.key.remoteJid, {
    text: menu,
    mentions: subDirs.map(id => id),
    quoted: msg
  });
};

handler.command = ['bots'];
module.exports = handler;
