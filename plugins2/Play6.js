const yts = require('yt-search');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const ffmpeg = require('fluent-ffmpeg');
const streamPipeline = promisify(pipeline);

const handler = async (msg, { conn, text }) => {
    const formatVideo = ['240', '360', '480', '720'];

    const ddownr = {
        download: async (url, format) => {
            if (!formatVideo.includes(format)) {
                throw new Error('Formato de video no soportado.');
            }

            const config = {
                method: 'GET',
                url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            };

            const response = await axios.request(config);
            if (response.data && response.data.success) {
                const { id, title, info } = response.data;
                const downloadUrl = await ddownr.cekProgress(id);
                return {
                    title,
                    downloadUrl,
                    thumbnail: info.image,
                    uploader: info.author,
                    duration: info.duration,
                    views: info.views,
                    video_url: info.video_url
                };
            } else {
                throw new Error('No se pudo obtener la información del video.');
            }
        },
        cekProgress: async (id) => {
            const config = {
                method: 'GET',
                url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            };

            while (true) {
                const response = await axios.request(config);
                if (response.data?.success && response.data.progress === 1000) {
                    return response.data.download_url;
                }
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    };

    if (!text) {
        return await conn.sendMessage(msg.key.remoteJid, {
            text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *${global.prefix}play6* Bad Boy nightcore`
        }, { quoted: msg });
    }

    await conn.sendMessage(msg.key.remoteJid, {
        react: { text: '⏳', key: msg.key }
    });

    try {
        const search = await yts(text);
        if (!search.videos || search.videos.length === 0) {
            throw new Error('No se encontraron resultados.');
        }

        const video = search.videos[0];
        const { title, url, timestamp, views, author, thumbnail } = video;

        const durParts = timestamp.split(':').map(Number);
        const minutes = durParts.length === 3
            ? durParts[0] * 60 + durParts[1]
            : durParts[0];

        let quality = '360';
        if (minutes <= 3) quality = '720';
        else if (minutes <= 5) quality = '480';

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

        const { downloadUrl } = await ddownr.download(url, quality);

        const tmpDir = path.join(__dirname, '../tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
        const rawPath = path.join(tmpDir, `${Date.now()}_raw.mp4`);
        const finalPath = path.join(tmpDir, `${Date.now()}_compressed.mp4`);

        const videoRes = await axios.get(downloadUrl, {
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        await streamPipeline(videoRes.data, fs.createWriteStream(rawPath));

        let crf = 26;
        let bVideo = '600k';
        let bAudio = '128k';
        if (minutes <= 2) {
            crf = 24; bVideo = '800k';
        } else if (minutes > 5) {
            crf = 28; bVideo = '400k'; bAudio = '96k';
        }

        await new Promise((resolve, reject) => {
            ffmpeg(rawPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                    '-preset', 'veryfast',
                    `-crf`, `${crf}`,
                    `-b:v`, bVideo,
                    `-b:a`, bAudio,
                    '-movflags', '+faststart'
                ])
                .on('end', resolve)
                .on('error', reject)
                .save(finalPath);
        });

        const finalText = `𝑽𝒊𝒅𝒆𝒐 𝑫𝒆𝒔𝒄𝒂𝒓𝒈𝒂𝒅𝒐 𝑬𝒙𝒊𝒕𝒐𝒔𝒂𝒎𝒆𝒏𝒕𝒆​᭄\n\n✎𝑪𝒂𝒍𝒊𝒅𝒂 : ${quality}p.`;

        await conn.sendMessage(msg.key.remoteJid, {
            video: fs.readFileSync(finalPath),
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: finalText
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

handler.command = ['play6', 'ytv'];
handler.tags = ['downloader'];
handler.help = [
    'play6 <búsqueda> - Descarga video de YouTube con calidad automática'
];
module.exports = handler;
