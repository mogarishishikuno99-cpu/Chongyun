const fs = require("fs-extra");
const path = require("path");
const fonts = require("../func/fonts.js");

// 🌸 TON UID OWNER ICI
const OWNER_ID = "61573867120837";

module.exports = {
  config: {
    name: "developer",
    aliases: ["dev"],
    version: "2.7 Text-Font",
    author: "Shade × Gemini",
    countDown: 5,
    role: 0,
    description: {
      en: "Gérer les développeurs du bot (Owner uniquement)"
    },
    category: "owner",
    guide: {
      en: "{p}{n} list (-l) → Liste des développeurs\n{p}{n} add (-a) <uid/@tag/reply> → Ajouter un développeur\n{p}{n} remove (-r) <uid/@tag/reply> → Retirer un développeur"
    }
  },

  onStart: async function ({ api, message, args, usersData, event }) {
    const { config } = global.GoatBot;
    if (!config.developer) config.developer = [];
    
    const { senderID, threadID, messageID, mentions, type, messageReply } = event;
    const isOwner = senderID === OWNER_ID;

    const subAction = (args[0] || "").toLowerCase();
    let action = subAction;
    if (subAction === "l" || subAction === "-l") action = "list";
    if (subAction === "a" || subAction === "-a") action = "add";
    if (subAction === "r" || subAction === "-r") action = "remove";

    if (!action || !["list", "add", "remove"].includes(action)) {
      const errorMsg = fonts.christus("❌ Action invalide. Utilisez : list (-l), add (-a), ou remove (-r).");
      return api.sendMessage(errorMsg, threadID, messageID);
    }

    // ==========================================
    // 🎨 MODE 1 : LISTE DES DEVS (TEXTE + FONTS)
    // ==========================================
    if (action === "list") {
      if (config.developer.length === 0) {
        const emptyMsg = fonts.christus("💡 Aucun développeur enregistré pour le moment.");
        return api.sendMessage(emptyMsg, threadID, messageID);
      }

      let msg = fonts.christus("👨‍💻 𝗗𝗘𝗩 𝗨𝗌𝖾𝗋𝗌:\n");
      for (let i = 0; i < config.developer.length; i++) {
        const uid = config.developer[i];
        const name = await usersData.getName(uid) || "Utilisateur(ice) Facebook";
        const formattedName = fonts.christus(name);
        msg += `${i + 1}. ${formattedName} (${uid})\n`;
      }

      return api.sendMessage(msg.trim(), threadID, messageID);
    }

    // ==========================================
    // 🔒 EXTRACTION DE LA CIBLE (MENTION / ARGS / REPLY)
    // ==========================================
    let targetID = null;
    if (type === "message_reply" && messageReply) {
      targetID = messageReply.senderID;
    } else if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args[1] && !args[1].startsWith("-") && !isNaN(args[1])) {
      targetID = args[1].trim();
    } else if (args[2] && !isNaN(args[2])) {
      targetID = args[2].trim();
    }

    // ==========================================
    // ➕ MODE 2 : AJOUTER UN DEV
    // ==========================================
    if (action === "add") {
      if (!isOwner) {
        const errOwner = fonts.christus("⛔ Seul le propriétaire suprême (OWNER) peut utiliser cette fonction.");
        return api.sendMessage(errOwner, threadID, messageID);
      }
      if (!targetID) {
        const errTarget = fonts.christus("❌ Cible introuvable. Veuillez spécifier un UID, taguer quelqu'un ou répondre (reply) à son message.");
        return api.sendMessage(errTarget, threadID, messageID);
      }

      if (config.developer.includes(targetID)) {
        const errAlready = fonts.christus("💡 Cet utilisateur est déjà enregistré comme développeur.");
        return api.sendMessage(errAlready, threadID, messageID);
      }

      config.developer.push(targetID);
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2), "utf-8");

      const targetName = await usersData.getName(targetID) || "Utilisateur(ice) Facebook";
      const formattedTitle = fonts.christus("✅ | Added developer role for 1 users:\n• ");
      const formattedName = fonts.christus(targetName);
      const finalMsg = `${formattedTitle}${formattedName} (${targetID})`;

      return api.sendMessage(finalMsg, threadID, messageID);
    }

    // ==========================================
    // ➖ MODE 3 : RETIRER UN DEV
    // ==========================================
    if (action === "remove") {
      if (!isOwner) {
        const errOwner = fonts.christus("⛔ Seul le propriétaire suprême (OWNER) peut utiliser cette fonction.");
        return api.sendMessage(errOwner, threadID, messageID);
      }
      if (!targetID) {
        const errTarget = fonts.christus("❌ Veuillez spécifier un UID valide, taguer quelqu'un ou répondre (reply) à son message à supprimer.");
        return api.sendMessage(errTarget, threadID, messageID);
      }

      if (!config.developer.includes(targetID)) {
        const errNot = fonts.christus("❌ Cet utilisateur n'est pas enregistré comme développeur.");
        return api.sendMessage(errNot, threadID, messageID);
      }

      config.developer = config.developer.filter(id => id !== targetID);
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2), "utf-8");

      const targetName = await usersData.getName(targetID) || "Utilisateur(ice) Facebook";
      const formattedTitle = fonts.christus("✅ | Removed developer role of 1 users:\n• ");
      const formattedName = fonts.christus(targetName);
      const finalMsg = `${formattedTitle}${formattedName} (${targetID})`;

      return api.sendMessage(finalMsg, threadID, messageID);
    }

    return message.SyntaxError();
  }
};
