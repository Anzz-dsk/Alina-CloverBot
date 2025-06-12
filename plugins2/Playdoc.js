const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

const handler = async (msg, { conn, text }) => {
  const rawID = conn.user?.id || "";
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net";

  const prefixPath = path.resolve("prefixes.json");
  let prefixes = {};
  if (fs.existsSync(prefixPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
  }

  const usedPrefix = prefixes[subbotID] || ".";

  if (!text) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *${usedPrefix}playdoc* Bad Boy Nightcore`
    }, { quoted: msg });
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: '⏳', key: msg.key }
  });

  try {
    const search = await yts(text);
    const video = search.videos[0];
    if (!video) throw new Error('No se encontraron resultados');

    const videoUrl = video.url;
    const thumbnail = video.thumbnail;
    const title = video.title;
    const fduration = video.timestamp;
    const views = video.views.toLocaleString();
    const channel = video.author.name || 'Desconocido';

    const infoMessage = `
╭─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬🎧⃘⃪۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╮    
│  〔彡𝘼 𝙇 𝙄 𝙉 𝘼 - 𝘾 𝙇 𝙊 𝙑 𝙀 𝙍 彡〕
│˚̩̩̥͙°̩̥〔 𝘿 𝙚 𝙨 𝙘 𝙖 𝙧 𝙜 𝙖 𝙨 𝙋𝙡𝙖𝙮 〕°̩̥˚̩̩̥͙°̩̥ ·͙*̩̩͙
┃
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 🎼 𝑻𝒊𝒕𝒖𝒍𝒐: ${title}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ⏱️ 𝑫𝒖𝒓𝒂𝒄𝒊𝒐́𝒏: ${fduration}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 👁️ 𝑽𝒊𝒔𝒕𝒂𝒔: ${views}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 👤 𝑨𝒖𝒕𝒐𝒓: ${channel}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 🔗 𝑳𝒊𝒏𝒌 : ${videoUrl}
│
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊•𝙀𝙡𝙞𝙟𝙖 𝙇𝙖 𝙊𝙥𝙘𝙞𝙤́𝙣 𝙙𝙚 𝘿𝙚𝙨𝙘𝙖𝙧𝙜𝙖
│
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊•🎵 _${usedPrefix}play1 ${text}_
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊•🎥 _${usedPrefix}play2 ${text}_
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊•🎥 _${usedPrefix}play6 ${text}_
│
╰─〔𝙀𝙣𝙫𝙞𝙖𝙣𝙙𝙤▰▰▱▱〕
`;

    await conn.sendMessage(msg.key.remoteJid, {
      image: { url: thumbnail },
      caption: infoMessage
    }, { quoted: msg });

    const apiURL = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=russellxz`;
    const res = await axios.get(apiURL);
    const json = res.data;

    if (!json.status || !json.data?.url) throw new Error("No se pudo obtener el audio");

    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const rawPath = path.join(tmpDir, `${Date.now()}_raw.m4a`);
    const finalPath = path.join(tmpDir, `${Date.now()}_final.mp3`);

    const audioRes = await axios.get(json.data.url, { responseType: 'stream' });
    await streamPipeline(audioRes.data, fs.createWriteStream(rawPath));

    await new Promise((resolve, reject) => {
      ffmpeg(rawPath)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .format('mp3')
        .save(finalPath)
        .on('end', resolve)
        .on('error', reject);
    });

    await conn.sendMessage(msg.key.remoteJid, {
      document: fs.readFileSync(finalPath),
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: msg });

    fs.unlinkSync(rawPath);
    fs.unlinkSync(finalPath);

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '✅', key: msg.key }
    });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(msg.key.remoteJid, {
      text: `❌ *Error:* ${err.message}`
    }, { quoted: msg });

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '❌', key: msg.key }
    });
  }
};

handler.command = ['playdoc'];
module.exports = handler;
