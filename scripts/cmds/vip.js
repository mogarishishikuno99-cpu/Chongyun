const fs = require("fs-extra");
const path = require("path");
const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "vip",
    aliases: ["vipmember", "viplist"],
    version: "6.1.0",
    author: "Shade × Gemini",
    countDown: 5,
    role: 3, // Rôle 2 (Administrateur/AdminBot) requis pour gérer les VIP, sans OWNER_ID fixe
    description: "💎 Gestion du club VIP Privé (Format Texte avec Fonts)",
    category: "system",
    guide: {
      en: "{p}{n} list (-l) → Afficher le club VIP (Public)\n{p}{n} add (-a) [@tag | uid | reply] → Inscrire un VIP\n{p}{n} remove (-r) [@tag | uid | reply] → Révoquer un VIP"
    }
  },

  onStart: async function ({ message, args, event, api, usersData }) {
    const { threadID, messageID, type, messageReply, mentions } = event;

    try {
      // 1. Définition du chemin vers config.json
      const configPath = path.join(process.cwd(), "config.json");

      // Lecture à la volée du fichier de configuration
      let botConfig = {};
      if (fs.existsSync(configPath)) {
        botConfig = fs.readJsonSync(configPath);
      }

      // 2. Initialisation automatique de la clé si absente
      if (!Array.isArray(botConfig.vipuser)) {
        botConfig.vipuser = [];
      }

      // 3. Référence de la liste VIP
      let vipList = botConfig.vipuser;

      const subAction = (args[0] || "").toLowerCase();
      let action = subAction;
      if (subAction === "l" || subAction === "-l") action = "list";
      if (subAction === "a" || subAction === "-a") action = "add";
      if (subAction === "r" || subAction === "-r") action = "remove";

      if (!action || !["list", "add", "remove"].includes(action)) {
        const errorMsg = fonts.christus("❌ Action invalide. Utilisez : list (-l), add (-a), ou remove (-r).");
        return api.sendMessage(errorMsg, threadID, messageID);
      }

      // --- COMMANDES ADMINISTRATIVES ---
      if (["add", "remove"].includes(action)) {
        // Récupération de la cible via : 1/ Le Reply, 2/ Les Mentions, 3/ Les UIDs écrits en texte brut
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

        if (!targetID) {
          const errTarget = fonts.christus("❌ Cible introuvable. Veuillez spécifier un UID, taguer quelqu'un ou répondre (reply) à son message.");
          return api.sendMessage(errTarget, threadID, messageID);
        }

        try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch(e){}

        // 4. ACTION : ADD VIP
        if (action === "add") {
          if (vipList.includes(targetID)) {
            const errAlready = fonts.christus("💡 Cet utilisateur est déjà enregistré comme VIP.");
            return api.sendMessage(errAlready, threadID, messageID);
          }

          vipList.push(targetID);
          botConfig.vipuser = vipList;

          // Sauvegarde persistante synchrone dans config.json
          fs.writeJsonSync(configPath, botConfig, { spaces: 2 });

          // Synchronisation globale en mémoire
          if (global.config) global.config.vipuser = vipList;
          if (global.GoatBot && global.GoatBot.config) global.GoatBot.config.vipuser = vipList;

          try { api.setMessageReaction("👑", messageID, () => {}, true); } catch(e){}

          const targetName = await usersData.getName(targetID) || "Utilisateur(ice) Facebook";
          const formattedTitle = fonts.christus("✅ | Added VIP role for 1 users:\n• ");
          const formattedName = fonts.christus(targetName);
          const finalMsg = `${formattedTitle}${formattedName} (${targetID})`;

          return api.sendMessage(finalMsg, threadID, messageID);
        }

        // 5. ACTION : REMOVE VIP
        if (action === "remove") {
          if (!vipList.includes(targetID)) {
            const errNot = fonts.christus("❌ Cet utilisateur n'est pas enregistré comme VIP.");
            return api.sendMessage(errNot, threadID, messageID);
          }

          vipList = vipList.filter(id => id !== targetID);
          botConfig.vipuser = vipList;

          // Sauvegarde persistante synchrone dans config.json
          fs.writeJsonSync(configPath, botConfig, { spaces: 2 });

          // Synchronisation globale en mémoire
          if (global.config) global.config.vipuser = vipList;
          if (global.GoatBot && global.GoatBot.config) global.GoatBot.config.vipuser = vipList;

          try { api.setMessageReaction("🗑️", messageID, () => {}, true); } catch(e){}

          const targetName = await usersData.getName(targetID) || "Utilisateur(ice) Facebook";
          const formattedTitle = fonts.christus("✅ | Removed VIP role of 1 users:\n• ");
          const formattedName = fonts.christus(targetName);
          const finalMsg = `${formattedTitle}${formattedName} (${targetID})`;

          return api.sendMessage(finalMsg, threadID, messageID);
        }
      }

      // 6. ACTION : LIST VIP (TEXTE + FONTS)
      if (action === "list") {
        if (!vipList.length) {
          const emptyMsg = fonts.christus("💡 Aucun membre VIP n'est actuellement enregistré dans le club.");
          return api.sendMessage(emptyMsg, threadID, messageID);
        }

        try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch(e){}

        let msg = fonts.christus("💎 𝗩𝗜𝗣 𝗨𝗌𝖾𝗋𝗌:\n");
        for (let i = 0; i < vipList.length; i++) {
          const uid = vipList[i];
          const name = await usersData.getName(uid) || "Utilisateur(ice) Facebook";
          const formattedName = fonts.christus(name);
          msg += `${i + 1}. ${formattedName} (${uid})\n`;
        }

        try { api.setMessageReaction("💎", messageID, () => {}, true); } catch(e){}
        return api.sendMessage(msg.trim(), threadID, messageID);
      }

      return message.SyntaxError();

    } catch (err) {
      console.error("VIP ERROR:", err);
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
      return message.reply("❌ Une erreur critique est survenue dans la compilation de la matrice VIP.");
    }
  }
};
