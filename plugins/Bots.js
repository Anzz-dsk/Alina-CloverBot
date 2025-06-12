const handler = async (msg, { conn }) => {
  const fs = require("fs");
  const path = require("path");

  const subbotsFolder = "./subbots";
  const prefixPath = path.join(__dirname, "..", "prefixes.json");

  // Leer subbots conectados
  const subDirs = fs.existsSync(subbotsFolder)
    ? fs.readdirSync(subbotsFolder).filter(d => 
        fs.existsSync(path.join(subbotsFolder, d, "creds.json"))
      )
    : [];

  if (subDirs.length === 0) {
    return await conn.sendMessage2(
      msg.key.remoteJid,
      "✘ 𝑬𝒏 𝑬𝒔𝒕𝒆 𝑴𝒐𝒎𝒆𝒏𝒕𝒐 𝑵𝒐 𝒔𝒆 𝑬𝒏𝒄𝒖𝒆𝒏𝒕𝒓𝒂𝒏 𝑨𝒍𝒊𝒏𝒂-𝑺𝒖𝒃-𝑩𝒐𝒕𝒔 𝑹𝒆𝒈𝒊𝒔𝒕𝒓𝒂𝒅𝒐𝒔",
      msg
    );
  }

  // Cargar prefijos personalizados
  let dataPrefijos = {};
  if (fs.existsSync(prefixPath)) {
    dataPrefijos = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
  }

  // Generar lista de subbots
  const total = subDirs.length;
  const mentions = [];
  const lista = subDirs.map((dir, i) => {
    const jid = dir.split("@")[0];
    const fullJid = `${jid}@s.whatsapp.net`;
    mentions.push(fullJid);
    const prefijo = dataPrefijos[fullJid] || ".";

    return `╭〔 𝙎𝙪𝙗𝘽𝙤𝙩 ${i + 1}〕\n├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 𝙉𝙪́𝙢𝙚𝙧𝙤: @${jid}\n├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 𝙋𝙧𝙚𝙛𝙞𝙟𝙤: *${prefijo}*\n╰───────────────`;
  }).join("\n\n");

  // Construir mensaje final
  const menu = `╭━〔 𝘼𝙡𝙞𝙣𝙖 𝘾𝙡𝙤𝙫𝙚𝙧 𝘽𝙤𝙩 〕━✧\n├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊•𝙎𝙪𝙗𝘽𝙤𝙩𝙨 𝘾𝙤𝙣𝙚𝙘𝙩𝙖𝙙𝙤𝙨\n├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊•𝙏𝙤𝙩𝙖𝙡: *${total}*\n╰━━━━━━━━━━━━╯\n\n${lista}`;

  // Enviar usando sendMessage2
  await conn.sendMessage2(
    msg.key.remoteJid,
    {
      text: menu,
      mentions: mentions
    },
    msg
  );
};

handler.command = ['bots', 'subbots'];
handler.tags = ['owner'];
handler.help = ['bots'];
module.exports = handler;
