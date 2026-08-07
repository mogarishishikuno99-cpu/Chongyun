const axios = require("axios");
const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "imgur",
    version: "1.2",
    author: "Christus & Shade Edit",
    countDown: 3,
    role: 0,
    shortDescription: "Upload image/vidéo sur Imgur",
    longDescription: "Réponds à une image ou envoie une URL pour l’envoyer sur Imgur",
    category: "download",
    guide: "{pn} reply image/vidéo ou lien"
  },
  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    const send = (text) =>
      api.sendMessage(fonts.christus(`📌 ${text}`), threadID, messageID);

    try {
      let mediaUrl = "";
      
      if (messageReply?.attachments?.length > 0) {
        mediaUrl = messageReply.attachments[0].url;
      }
      else if (args.length > 0) {
        mediaUrl = args.join(" ");
      }

      if (!mediaUrl) {
        return send("Réponds à une image/vidéo ou donne un lien valide.");
      }

      api.setMessageReaction("⏳", messageID, () => {}, true);

      const res = await axios.get(
        `http://65.109.80.126:20409/aryan/imgur?url=${encodeURIComponent(mediaUrl)}`
      );
      const link = res.data?.imgur;

      if (!link) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return send("Upload échoué sur Imgur...");
      }

      api.setMessageReaction("✅", messageID, () => {}, true);

      const caption = `╭───────────────✦` +
        `\n│ 📤 𝗜𝗠𝗚𝗨𝗥 𝗨𝗣𝗟𝗢𝗔𝗗 𝗣𝗥𝗢` +
        `\n├────────────────` +
        `\n│ 🔗 Lien : ${link}` +
        `\n├────────────────` +
        `\n│ 📌 Status : Upload terminé` +
        `\n│ 🤖 System par Shade` +
        `\n╰───────────────✦`;

      return api.sendMessage(
        fonts.christus(caption),
        threadID,
        messageID
      );

    } catch (err) {
      console.error("Imgur error:", err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return send("Une erreur est survenue pendant l’upload.");
    }
  }
};
