const yts = require('yt-search');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const ffmpeg = require('fluent-ffmpeg');

const streamPipeline = promisify(pipeline);
const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav'];

const handler = async (msg, { conn, text }) => {
    const ddownr = {
        download: async (url, format) => {
            if (!formatAudio.includes(format)) {
                throw new Error('Formato no soportado.');
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
                throw new Error('No se pudo obtener la información del audio.');
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
            text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *${global.prefix}play5* Bad Boy Nightcore`
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

        const { downloadUrl } = await ddownr.download(url, 'mp3');

        const tmpDir = path.join(__dirname, '../tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
        const rawPath = path.join(tmpDir, `${Date.now()}_raw.mp3`);
        const finalPath = path.join(tmpDir, `${Date.now()}_compressed.mp3`);

        const audioRes = await axios.get(downloadUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        await streamPipeline(audioRes.data, fs.createWriteStream(rawPath));

        // Compresión del audio con ffmpeg
        await new Promise((resolve, reject) => {
            ffmpeg(rawPath)
                .audioBitrate('128k')
                .format('mp3')
                .on('end', resolve)
                .on('error', reject)
                .save(finalPath);
        });

        await conn.sendMessage(msg.key.remoteJid, {
            audio: fs.readFileSync(finalPath),
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

handler.command = ['play5'];
handler.tags = ['downloader'];
handler.help = ['play5 <búsqueda>'];
module.exports = handler;
