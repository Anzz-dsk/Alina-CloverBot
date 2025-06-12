const handler = async (msg, { conn }) => {
  const ownerNumber = "50238999796@s.whatsapp.net"; // Número del creador
  const ownerName = "𝘼𝙣𝙯𝙯 彡 𝘿𝙨𝙠"; // Nombre visible del creador

  const messageText = `
𝑯𝒊, 𝑨𝒍𝒊𝒏𝒂 𝑪𝒍𝒐𝒗𝒆𝒓 𝑬𝒔 𝑼𝒏 𝑩𝒐𝒕 𝑪𝒓𝒆𝒂𝒅𝒐 𝑼𝒔𝒂𝒏𝒅𝒐 𝑪𝒐𝒎𝒐 𝑩𝒂𝒔𝒆 𝑨𝒍 𝑩𝒐𝒕 𝑨𝒛𝒖𝒓𝒂 𝑼𝒍𝒕𝒓𝒂 𝑪𝒓𝒆𝒂𝒅𝒐𝒓 𝑷𝒐𝒓 𝑹𝒖𝒔𝒔𝒆𝒍𝒍 𝒙𝒛, 𝑷𝒐𝒄𝒐 𝑨 𝑷𝒐𝒄𝒐 𝑺𝒆 𝑳𝒆 𝒊𝒓𝒂 𝑪𝒂𝒎𝒃𝒊𝒂𝒏𝒅𝒐 𝑴𝒖𝒄𝒉𝒐 𝒎𝒂𝒔 𝑬𝒍 𝑫𝒊𝒔𝒆𝒏̃𝒐 𝑫𝒆𝒍 𝑩𝒐𝒕

𝑫𝒖𝒅𝒂𝒔 𝒐 𝒑𝒓𝒆𝒈𝒖𝒏𝒕𝒂𝒔? 

𝑴𝒊 𝑪𝒐𝒏𝒕𝒂𝒄𝒕𝒐 𝒐𝒇𝒄 

+502 38999796`;

  // Enviar contacto vCard
  await conn.sendMessage(msg.key.remoteJid, {
    contacts: {
      displayName: ownerName,
      contacts: [
        {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;waid=${ownerNumber.split('@')[0]}:+${ownerNumber.split('@')[0]}\nEND:VCARD`
        }
      ]
    }
  });

  // Enviar texto informativo
  await conn.sendMessage(msg.key.remoteJid, {
    text: messageText
  }, { quoted: msg });
};

handler.command = ['creador'];
module.exports = handler;
