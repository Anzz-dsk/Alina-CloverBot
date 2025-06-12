const fs = require('fs');
const path = require('path');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const QRCode = require('qrcode');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason
} = require('@whiskeysockets/baileys');

const handler = async (msg, { conn, command, sock }) => {
  const usarPairingCode = ["sercode", "code"].includes(command);
  let sentCodeMessage = false;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function serbot() {
    try {
      const number = msg.key?.participant || msg.key.remoteJid;
      const sessionDir = path.join(__dirname, "../subbots");
      const sessionPath = path.join(sessionDir, number);
      const rid = number.split("@")[0];

      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }

      await conn.sendMessage(msg.key.remoteJid, {
        react: { text: '⌛', key: msg.key }
      });

      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
      const { version } = await fetchLatestBaileysVersion();
      const logger = pino({ level: "silent" });

      const socky = makeWASocket({
        version,
        logger,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        printQRInTerminal: !usarPairingCode,
        browser: ['Windows', 'Chrome']
      });

      let reconnectionAttempts = 0;
      const maxReconnectionAttempts = 3;

      socky.ev.on("connection.update", async ({ qr, connection, lastDisconnect }) => {
        if (qr && !sentCodeMessage) {
          if (usarPairingCode) {
            const code = await socky.requestPairingCode(rid);
            await conn.sendMessage(msg.key.remoteJid, {
              video: { url: "https://cdn.russellxz.click/b0cbbbd3.mp4" },
              caption: "*Código generado:*\nAbre WhatsApp > Vincular dispositivo y pega el siguiente código:",
              gifPlayback: true
            }, { quoted: msg });
            await sleep(1000);
            await conn.sendMessage(msg.key.remoteJid, {
              text: "```" + code + "```"
            }, { quoted: msg });
          } else {
            const qrImage = await QRCode.toBuffer(qr);
            await conn.sendMessage(msg.key.remoteJid, {
              image: qrImage,
              caption: `📲 Escanea este código QR desde *WhatsApp > Vincular dispositivo* para conectarte como subbot.`
            }, { quoted: msg });
          }
          sentCodeMessage = true;
        }

        switch (connection) {
          case "open":
            await conn.sendMessage(msg.key.remoteJid, {
              text: `
✎𝑺𝒖𝒃 𝑩𝒐𝒕 𝑨𝒍𝒊𝒏𝒂 𝑪𝒐𝒏𝒆𝒄𝒕𝒂𝒅𝒐 𝑬𝒙𝒊𝒕𝒐𝒔𝒂𝒎𝒆𝒏𝒕𝒆 ​᭄              

✎𝑬𝒏 𝑪𝒂𝒔𝒐 𝑫𝒆 𝒒𝒖𝒆 𝑷𝒓𝒆𝒔𝒆𝒏𝒕𝒆 𝑭𝒂𝒍𝒍𝒂𝒔 𝑬𝒏 𝑺𝒖 𝑺𝒖𝒃 𝑩𝒐𝒕 𝑼𝒔𝒆 𝑳𝒐𝒔 𝑺𝒊𝒈𝒖𝒊𝒆𝒏𝒕𝒆𝒔 𝑪𝒐𝒎𝒂𝒏𝒅𝒐𝒔 :

 #delbots
 𝑷𝒂𝒓𝒂 𝑬𝒍𝒊𝒎𝒊𝒏𝒂𝒓 𝑻𝒖 𝑺𝒆𝒔𝒊𝒐́𝒏 𝒀 𝑳𝒖𝒆𝒈𝒐 𝑽𝒖𝒆𝒍𝒗𝒆 𝑨 𝑪𝒐𝒏𝒆𝒄𝒕𝒂𝒓𝒕𝒆 𝑼𝒔𝒂𝒏𝒅𝒐:
 #serbot 𝑶 𝑷𝒂𝒓𝒂 𝑪𝒐𝒅𝒆 𝑺𝒊 𝑵𝒐 𝑸𝒖𝒊𝒆𝒓𝒆𝒔 𝑸𝒓 𝑼𝒔𝒂: #code o #sercode. 
 𝑯𝒂𝒔𝒕𝒂 𝑸𝒖𝒆 𝑺𝒆 𝑪𝒐𝒏𝒆𝒄𝒕𝒆 𝑪𝒐𝒓𝒓𝒆𝒄𝒕𝒂𝒎𝒆𝒏𝒕𝒆
`
            }, { quoted: msg });

            await conn.sendMessage(msg.key.remoteJid, {
              react: { text: "🔁", key: msg.key }
            });
            break;

          case "close": {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode || lastDisconnect?.error?.output?.statusCode;
            const messageError = DisconnectReason[reason] || `Código desconocido: ${reason}`;

            const eliminarSesion = () => {
              if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
              }
            };

            switch (reason) {
              case 401:
              case DisconnectReason.badSession:
              case DisconnectReason.loggedOut:
                await conn.sendMessage(msg.key.remoteJid, {
                  text: `⚠️ *Sesión eliminada.*
${messageError}
Usa ${global.prefix}serbot para volver a conectar.`
                }, { quoted: msg });
                eliminarSesion();
                break;

              case DisconnectReason.restartRequired:
                if (reconnectionAttempts < maxReconnectionAttempts) {
                  reconnectionAttempts++;
                  await sleep(3000);
                  await serbot();
                  return;
                }
                await conn.sendMessage(msg.key.remoteJid, {
                  text: `⚠️ *Reintentos de conexión fallidos.*`
                }, { quoted: msg });
                break;

              case DisconnectReason.connectionReplaced:
                console.log(`ℹ️ Sesión reemplazada por otra instancia.`);
                break;

              default:
                await conn.sendMessage(msg.key.remoteJid, {
                  text: `
𝑬𝑹𝑹𝑶𝑹 𝑬𝑵 𝑬𝑳 𝑺𝑼𝑩 𝑩𝑶𝑻
 ${messageError}
 
 
            
✎𝑬𝒏 𝑪𝒂𝒔𝒐 𝑫𝒆 𝒒𝒖𝒆 𝑷𝒓𝒆𝒔𝒆𝒏𝒕𝒆 𝑭𝒂𝒍𝒍𝒂𝒔 𝑬𝒏 𝑺𝒖 𝑺𝒖𝒃 𝑩𝒐𝒕 𝑼𝒔𝒆 𝑳𝒐𝒔 𝑺𝒊𝒈𝒖𝒊𝒆𝒏𝒕𝒆𝒔 𝑪𝒐𝒎𝒂𝒏𝒅𝒐𝒔 :

 #delbots
 𝑷𝒂𝒓𝒂 𝑬𝒍𝒊𝒎𝒊𝒏𝒂𝒓 𝑻𝒖 𝑺𝒆𝒔𝒊𝒐́𝒏 𝒀 𝑳𝒖𝒆𝒈𝒐 𝑽𝒖𝒆𝒍𝒗𝒆 𝑨 𝑪𝒐𝒏𝒆𝒄𝒕𝒂𝒓𝒕𝒆 𝑼𝒔𝒂𝒏𝒅𝒐:
 #serbot 𝑶 𝑷𝒂𝒓𝒂 𝑪𝒐𝒅𝒆 𝑺𝒊 𝑵𝒐 𝑸𝒖𝒊𝒆𝒓𝒆𝒔 𝑸𝒓 𝑼𝒔𝒂: #code o #sercode. 
 𝑯𝒂𝒔𝒕𝒂 𝑸𝒖𝒆 𝑺𝒆 𝑪𝒐𝒏𝒆𝒄𝒕𝒆 𝑪𝒐𝒓𝒓𝒆𝒄𝒕𝒂𝒎𝒆𝒏𝒕𝒆

`
                }, { quoted: msg });
                break;
            }
            break;
          }
        }
      });

      socky.ev.on("creds.update", saveCreds);

    } catch (e) {
      console.error("❌ Error en serbot:", e);
      await conn.sendMessage(msg.key.remoteJid, {
        text: `❌ *Error inesperado:* ${e.message}`
      }, { quoted: msg });
    }
  }

  await serbot();
};

handler.command = ['sercode', 'code', 'jadibot', 'serbot', 'qr'];
handler.tags = ['owner'];
handler.help = ['serbot', 'code'];
module.exports = handler;
