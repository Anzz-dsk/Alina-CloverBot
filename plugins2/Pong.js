const handler = async (msg, { conn }) => {
  const start = Date.now();

  const respuesta = await conn.sendMessage(msg.key.remoteJid, {
    text: "✎𝑨𝒍𝒊𝒏𝒂 𝑺𝒖𝒃𝑩𝒐𝒕 𝑨𝒄𝒕𝒊𝒗𝒂 𝑷𝒂𝒓𝒂 𝑻𝒓𝒂𝒃𝒂𝒋𝒂𝒓 𝒆𝒏 𝑺𝒖 𝑹𝒆𝒄𝒆𝒑𝒄𝒊𝒐́𝒏 (𝑯𝒐𝒚 𝑺𝒆𝒈𝒖𝒓𝒂𝒎𝒆𝒏𝒕𝒆 𝒕𝒂𝒎𝒃𝒊𝒆́𝒏 𝒍𝒆 𝑻𝒐𝒂𝒄𝒂𝒓𝒂𝒏 𝑯𝒐𝒓𝒂𝒔 𝑬𝒙𝒕𝒓𝒂𝒔) "
  }, { quoted: msg });

  const end = Date.now();
  const ping = end - start;

  await conn.sendMessage(msg.key.remoteJid, {
    text: `✎𝑷𝒊𝒏𝒈 : ${ping} 𝙢𝙨`,
    quoted: respuesta
  });
};

handler.command = ['ping'];
module.exports = handler;
