const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

const handler = async (msg, { conn, text, usedPrefix }) => {
  if (!text || (!text.includes('youtube.com') && !text.includes('youtu.be'))) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *${usedPrefix}ytmp4doc* https://youtube.com/watch?v=...`
    }, { quoted: msg });
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: '⏳', key: msg.key }
  });

  try {
    const qualities = ['720p', '480p', '360p'];
    let videoData = null;

    for (let quality of qualities) {
      try {
        const apiUrl = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(text)}&type=video&quality=${quality}&apikey=russellxz`;
        const response = await axios.get(apiUrl);
        if (response.data?.status && response.data?.data?.url) {
          videoData = {
            url: response.data.data.url,
            title: response.data.title || 'video',
            thumbnail: response.data.thumbnail,
            duration: response.data.fduration,
            views: response.data.views,
            channel: response.data.channel,
            quality: response.data.data.quality || quality,
            size: response.data.data.size || 'Desconocido',
            publish: response.data.publish || 'Desconocido',
            id: response.data.id || ''
          };
          break;
        }
      } catch { continue; }
    }

    if (!videoData) throw new Error('No se pudo obtener el video en ninguna calidad');

    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const filePath = path.join(tmpDir, `${Date.now()}_video.mp4`);

    const response = await axios.get(videoData.url, {
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    await streamPipeline(response.data, fs.createWriteStream(filePath));

    const stats = fs.statSync(filePath);
    if (!stats || stats.size < 100000) {
      fs.unlinkSync(filePath);
      throw new Error('El video descargado está vacío o incompleto');
    }

    const caption = `
╭─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬🎧⃘⃪۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╮    
│  〔彡𝘼 𝙇 𝙄 𝙉 𝘼 - 𝘾 𝙇 𝙊 𝙑 𝙀 𝙍 彡〕
│˚̩̩̥͙°̩̥〔 𝘿 𝙚 𝙨 𝙘 𝙖 𝙧 𝙜 𝙖 𝙨 𝙋𝙡𝙖𝙮 〕°̩̥˚̩̩̥͙°̩̥ ·͙*̩̩͙
┃
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 🎼 𝑻𝒊𝒕𝒖𝒍𝒐: ${videoData.title}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ⏱️ 𝑫𝒖𝒓𝒂𝒄𝒊𝒐́𝒏: ${videoData.duration}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 👁️ 𝑽𝒊𝒔𝒕𝒂𝒔: ${videoData.views}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 👤 𝑪𝒂𝒏𝒂𝒍: ${videoData.channel}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 🗓️ 𝑷𝒖𝒃𝒍𝒊𝒄𝒂𝒅𝒐: ${videoData.publish}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 📦 𝑻𝒂𝒎𝒂𝒏̃𝒐: ${videoData.size}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 📹 𝑪𝒂𝒍𝒊𝒅𝒂𝒅: ${videoData.quality}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 🔗 𝑳𝒊𝒏𝒌: https://youtu.be/${videoData.id}
│
╰─〔𝙀𝙣𝙫𝙞𝙖𝙣𝙙𝙤▰▰▱▱〕
`;

    await conn.sendMessage(msg.key.remoteJid, {
      document: fs.readFileSync(filePath),
      mimetype: 'video/mp4',
      fileName: `${videoData.title}.mp4`,
      caption
    }, { quoted: msg });

    fs.unlinkSync(filePath);

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '✅', key: msg.key }
    });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(msg.key.remoteJid, {
      text: `❌ *Error Talvez excede el límite de 99MB:* ${err.message}`
    }, { quoted: msg });

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '❌', key: msg.key }
    });
  }
};

handler.command = ['ytmp4doc'];
module.exports = handler;
