const fs = require("fs-extra");
const path = require("path");
const fonts = require("../func/fonts.js");

const DB_FILE = path.join(__dirname, "premium_codes.json");

function loadCodes() {
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}");
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function saveCodes(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "premium",
    version: "8.0.0",
    author: "Shade × Gemini",
    role: 2, // Seuls les administrateurs du bot (Rôle 2) peuvent utiliser cette commande
    category: "system",
    description: {
      fr: "Gestion des membres premium via le config.json (Format Texte avec Fonts)",
      en: "Premium members management via config.json (Text Format with Fonts)"
    },
    guide: {
      en: "{p}{n} list (-l) → Liste des membres premium\n{p}{n} add (-a) [@tag | uid | reply] → Ajouter le premium\n{p}{n} remove (-r) [@tag | uid | reply] → Retirer le premium\n{p}{n} check [@tag | uid | reply] → Vérifier le statut\n{p}{n} redeem [code] → Activer un code"
    }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { threadID, messageID, type, messageReply, mentions } = event;

    try {
      // 1. Gestion de config.json
      const configPath = path.join(process.cwd(), "config.json");
      let botConfig = {};
      if (fs.existsSync(configPath)) {
        botConfig = fs.readJsonSync(configPath);
      }

      // Initialisation du tableau premiumUser dans le config.json si absent
      if (!Array.isArray(botConfig.premiumUser)) {
        botConfig.premiumUser = [];
      }

      if (!args[0]) {
        const errAction = fonts.christus("Dis, tu as oublié l'action ! 👀 Utilise : add, remove, check, list ou redeem ! ✨");
        return api.sendMessage(errAction, threadID, messageID);
      }

      const subAction = args[0].toLowerCase();
      let action = subAction;
      if (subAction === "l" || subAction === "-l") action = "list";
      if (subAction === "a" || subAction === "-a") action = "add";
      if (subAction === "r" || subAction === "-r") action = "remove";

      let targetID = null;

      // --- 🎯 GESTION DE LA CIBLE ---
      if (action === "add" || action === "remove" || action === "check") {
        if (type === "message_reply" && messageReply) {
          targetID = messageReply.senderID;
        } else if (mentions && Object.keys(mentions).length > 0) {
          targetID = Object.keys(mentions)[0];
        } else if (args[1] && !args[1].startsWith("-") && !isNaN(args[1])) {
          targetID = args[1].trim();
        } else if (args[2] && !isNaN(args[2])) {
          targetID = args[2].trim();
        }
      }

      if (!targetID && action !== "list" && action !== "redeem") {
        const errTarget = fonts.christus("Heu... Je ne trouve pas cet utilisateur. Tu as bien mentionné quelqu'un, répondu à un message ou mis un ID valide ? 🤔");
        return api.sendMessage(errTarget, threadID, messageID);
      }

      // --- 💎 ACTION : ADD ---
      if (action === "add") {
        if (botConfig.premiumUser.includes(targetID)) {
          const errAlready = fonts.christus("💡 Cet utilisateur est déjà enregistré comme premium.");
          return api.sendMessage(errAlready, threadID, messageID);
        }

        botConfig.premiumUser.push(targetID);
        fs.writeJsonSync(configPath, botConfig, { spaces: 2 });

        // Synchronisation globale en mémoire
        if (global.config) global.config.premiumUser = botConfig.premiumUser;
        if (global.GoatBot && global.GoatBot.config) global.GoatBot.config.premiumUser = botConfig.premiumUser;

        const targetName = await usersData.getName(targetID) || "Utilisateur(ice) Facebook";
        const formattedTitle = fonts.christus("✓  | Added premium role for 1 users:\n• ");
        const formattedName = fonts.christus(targetName);
        const finalMsg = `${formattedTitle}${formattedName} (${targetID})`;

        return api.sendMessage(finalMsg, threadID, messageID);
      }

      // --- ❌ ACTION : REMOVE ---
      if (action === "remove") {
        if (!botConfig.premiumUser.includes(targetID)) {
          const errNot = fonts.christus("❌ Cet utilisateur n'est pas enregistré comme premium.");
          return api.sendMessage(errNot, threadID, messageID);
        }

        botConfig.premiumUser = botConfig.premiumUser.filter(id => id !== targetID);
        fs.writeJsonSync(configPath, botConfig, { spaces: 2 });

        // Synchronisation globale en mémoire
        if (global.config) global.config.premiumUser = botConfig.premiumUser;
        if (global.GoatBot && global.GoatBot.config) global.GoatBot.config.premiumUser = botConfig.premiumUser;

        const targetName = await usersData.getName(targetID) || "Utilisateur(ice) Facebook";
        const formattedTitle = fonts.christus("✓ | Removed premium role of 1 users:\n• ");
        const formattedName = fonts.christus(targetName);
        const finalMsg = `${formattedTitle}${formattedName} (${targetID})`;

        return api.sendMessage(finalMsg, threadID, messageID);
      }

      // --- 🌸 ACTION : CHECK ---
      if (action === "check") {
        const isPremium = botConfig.premiumUser.includes(targetID);
        if (isPremium) {
          const checkMsg = fonts.christus("💎 Validé ! Cet utilisateur fait bien partie des membres PREMIUM ! ✨");
          return api.sendMessage(checkMsg, threadID, messageID);
        } else {
          const checkNo = fonts.christus("❌ Désolée, mais cet utilisateur est un membre tout à fait ordinaire ! Pas de passe-droit ici. 🤫");
          return api.sendMessage(checkNo, threadID, messageID);
        }
      }

      // --- 🎟️ ACTION : REDEEM ---
      if (action === "redeem") {
        const code = args[1];
        if (!code) {
          const errCode = fonts.christus("Tu essaies d'activer du vent ? Donne-moi un code premium valide ! 🧎");
          return api.sendMessage(errCode, threadID, messageID);
        }
        let codes = loadCodes();
        if (!codes[code]) {
          const errWrong = fonts.christus("Argh ! Ce code est complètement faux ou a déjà expiré ! Retente ta chance. 😜");
          return api.sendMessage(errWrong, threadID, messageID);
        }
        
        // Si le redeem est validé, on ajoute l'expéditeur (senderID) au config.json s'il n'y est pas déjà
        if (!botConfig.premiumUser.includes(event.senderID)) {
          botConfig.premiumUser.push(event.senderID);
          fs.writeJsonSync(configPath, botConfig, { spaces: 2 });
          if (global.config) global.config.premiumUser = botConfig.premiumUser;
          if (global.GoatBot && global.GoatBot.config) global.GoatBot.config.premiumUser = botConfig.premiumUser;
        }

        const days = codes[code];
        delete codes[code];
        saveCodes(codes);

        const redMsg = fonts.christus(`🎉 Code activé avec succès ! Tu gagnes le statut PREMIUM permanent ! Profites-en bien ! 😊`);
        return api.sendMessage(redMsg, threadID, messageID);
      }

      // --- 📋 ACTION : LIST (TEXTE + FONTS) ---
      if (action === "list") {
        if (!botConfig.premiumUser.length) {
          const emptyMsg = fonts.christus("C'est bien calme ici... Aucun utilisateur n'est PREMIUM pour le moment ! 🌸");
          return api.sendMessage(emptyMsg, threadID, messageID);
        }

        let msg = fonts.christus("★ | 𝗟𝗂𝗌𝗍 𝗈𝖿 𝗉𝗋𝖾𝗆𝗂𝗎𝗆 𝗎𝗌𝖾𝗋𝗌:\n");
        for (let i = 0; i < botConfig.premiumUser.length; i++) {
          const uid = botConfig.premiumUser[i];
          const name = await usersData.getName(uid) || "Utilisateur inconnu";
          const formattedName = fonts.christus(name);
          
          msg += `• ${formattedName} (${uid}) - ${fonts.christus("Permanent")}\n`;
        }

        return api.sendMessage(msg.trim(), threadID, messageID);
      }

      const errSyntax = fonts.christus("Hum... Tu parles une autre langue ? Je ne comprends pas cette sous-commande. 🤨");
      return api.sendMessage(errSyntax, threadID, messageID);

    } catch (err) {
      console.error("PREMIUM ERROR:", err);
      return message.reply("❌ Une erreur est survenue lors de la lecture du fichier de configuration.");
    }
  }
};
