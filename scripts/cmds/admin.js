const path = require("path");
const fs = require("fs-extra");
const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "admin",
    version: "1.0.4",
    role: 2,
    author: "Shade & AI",
    description: "Ajoute, supprime ou liste les administrateurs du bot",
    category: "system",
    guide: {
      fr: "{p}{n} list (-l)\n{p}{n} add (-a) [@tag / reply / uid]\n{p}{n} remove (-r) [uid / @tag / reply]"
    },
    countDown: 2
  },
  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, type, messageReply, mentions } = event;
    const subAction = args[0]?.toLowerCase();
    
    let action = subAction;
    if (subAction === "l" || subAction === "-l") action = "list";
    if (subAction === "a" || subAction === "-a") action = "add";
    if (subAction === "r" || subAction === "-r") action = "remove";

    if (!action || !["list", "add", "remove"].includes(action)) {
      const errorMsg = fonts.christus("❌ Action invalide. Utilisez : list (-l), add (-a), ou remove (-r).");
      return api.sendMessage(errorMsg, threadID, messageID);
    }
    
    const configPath = path.join(process.cwd(), "config.json");
    let botConfig = {};
    if (fs.existsSync(configPath)) {
      botConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    if (!botConfig.adminBot) botConfig.adminBot = [];
    
    // --- CASE 1 : LIST ---
    if (action === "list") {
      if (botConfig.adminBot.length === 0) {
        const emptyMsg = fonts.christus("💡 Aucun administrateur n'est enregistré pour le moment.");
        return api.sendMessage(emptyMsg, threadID, messageID);
      }
      
      let msg = fonts.christus("👑 | List of admins:\n");
      for (let i = 0; i < botConfig.adminBot.length; i++) {
        const uid = botConfig.adminBot[i];
        const name = await usersData.getName(uid) || "Utilisateur inconnu";
        const formattedName = fonts.christus(name);
        msg += `• ${formattedName} (${uid})\n`;
      }
      
      return api.sendMessage(msg.trim(), threadID, messageID);
    }
    
    // --- CASE 2 : REMOVE ---
    if (action === "remove") {
      let targetID = args[1];
      if (!targetID || targetID.startsWith("-")) targetID = null;

      if (!targetID && type === "message_reply" && messageReply) {
        targetID = messageReply.senderID;
      } else if (!targetID && mentions && Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
      }
      
      if (!targetID || isNaN(targetID)) {
        const errValid = fonts.christus("❌ Veuillez spécifier un UID valide à supprimer de la liste.");
        return api.sendMessage(errValid, threadID, messageID);
      }
      
      if (!botConfig.adminBot.includes(targetID)) {
        const errNot = fonts.christus("❌ Cet utilisateur n'est pas dans la liste des administrateurs.");
        return api.sendMessage(errNot, threadID, messageID);
      }
      
      botConfig.adminBot = botConfig.adminBot.filter(id => id !== targetID);
      fs.writeFileSync(configPath, JSON.stringify(botConfig, null, 2), "utf-8");
      
      if (global.config) global.config.adminBot = botConfig.adminBot;
      if (global.GoatBot && global.GoatBot.config) global.GoatBot.config.adminBot = botConfig.adminBot;
      
      const targetName = await usersData.getName(targetID) || "Ancien Admin";
      const formattedTitle = fonts.christus("✅ | Removed admin role of 1 users:\n• ");
      const formattedName = fonts.christus(targetName);
      const finalMsg = `${formattedTitle}${formattedName} (${targetID})`;
      
      return api.sendMessage(finalMsg, threadID, messageID);
    }
    
    // --- CASE 3 : ADD ---
    if (action === "add") {
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
        const errTarget = fonts.christus("❌ Cible introuvable. Répondez à un message, mentionnez (@tag) ou tapez un UID directement.");
        return api.sendMessage(errTarget, threadID, messageID);
      }
      
      if (botConfig.adminBot.includes(targetID)) {
        const errAlready = fonts.christus("💡 Cet utilisateur est déjà administrateur.");
        return api.sendMessage(errAlready, threadID, messageID);
      }
      
      botConfig.adminBot.push(targetID);
      fs.writeFileSync(configPath, JSON.stringify(botConfig, null, 2), "utf-8");
      
      if (global.config) global.config.adminBot = botConfig.adminBot;
      if (global.GoatBot && global.GoatBot.config) global.GoatBot.config.adminBot = botConfig.adminBot;
      
      const targetName = await usersData.getName(targetID) || "Nouvel Admin";
      const formattedTitle = fonts.christus("✅ | Added admin role for 1 users:\n• ");
      const formattedName = fonts.christus(targetName);
      const finalMsg = `${formattedTitle}${formattedName} (${targetID})`;
      
      return api.sendMessage(finalMsg, threadID, messageID);
    }
  }
};
