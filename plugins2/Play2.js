const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { pipeline } = require('stream');
const streamPipeline = promisify(pipeline);

const handler = async (msg, { conn, text }) => {
  // Detectar subbotID y prefijo
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
      text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *${usedPrefix}play2* Bad Boy Nightcore`
    }, { quoted: msg });
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: '⏳', key: msg.key }
  });

  try {
    const searchUrl = `https://api.neoxr.eu/api/video?q=${encodeURIComponent(text)}&apikey=russellxz`;
    const searchRes = await axios.get(searchUrl);
    const videoInfo = searchRes.data;

    if (!videoInfo || !videoInfo.data?.url) throw new Error('No se pudo encontrar el video');

    const title = videoInfo.title || 'video';
    const thumbnail = videoInfo.thumbnail;
    const duration = videoInfo.fduration || '0:00';
    const views = videoInfo.views || 'N/A';
    const author = videoInfo.channel || 'Desconocido';
    const videoLink = `https://www.youtube.com/watch?v=${videoInfo.id}`;

    const captionPreview = `
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
      caption: captionPreview
    }, { quoted: msg });

    const qualities = ['720p', '480p', '360p'];
    let videoData = null;

    for (let quality of qualities) {
      try {
        const apiUrl = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoLink)}&apikey=russellxz&type=video&quality=${quality}`;
        const response = await axios.get(apiUrl);
        if (response.data?.status && response.data?.data?.url) {
          videoData = {
            url: response.data.data.url,
            title: response.data.title || title,
            id: response.data.id || videoInfo.id
          };
          break;
        }
      } catch { continue; }
    }

    if (!videoData) throw new Error('No se pudo obtener el video');

    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const filePath = path.join(tmpDir, `${Date.now()}_video.mp4`);

    const resDownload = await axios.get(videoData.url, {
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    await streamPipeline(resDownload.data, fs.createWriteStream(filePath));

    const stats = fs.statSync(filePath);
    if (!stats || stats.size < 100000) {
      fs.unlinkSync(filePath);
      throw new Error('El video descargado está vacío o incompleto');
    }

    await conn.sendMessage(msg.key.remoteJid, {
      video: fs.readFileSync(filePath),
      mimetype: 'video/mp4',
      fileName: `${videoData.title}.mp4`,
      caption: `𝑽𝒊𝒅𝒆𝒐 𝒆𝒏 𝑪𝒂𝒍𝒊𝒅𝒂𝒅 𝑵𝒐𝒓𝒎𝒂𝒍 𝑫𝒆𝒔𝒄𝒂𝒓𝒈𝒂𝒅𝒐 𝑬𝒙𝒊𝒕𝒐𝒔𝒂𝒎𝒆𝒏𝒕𝒆​᭄`
    }, { quoted: msg });

    fs.unlinkSync(filePath);

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

handler.command = ['play2'];
module.exports = handler;
