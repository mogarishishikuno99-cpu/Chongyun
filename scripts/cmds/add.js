const sleep = ms => new Promise(r => setTimeout(r, ms));

function extractUIDLocal(input) {
  if (!input) return null;
  const cleanInput = input.trim();
  if (/^\d+$/.test(cleanInput)) return cleanInput;
  const idMatch = cleanInput.match(/[?&]id=(\d+)/);
  if (idMatch) return idMatch[1];
  const slashMatch = cleanInput.match(/\/(\d+)(?:\/|\?|$)/);
  if (slashMatch) return slashMatch[1];
  return null;
}

module.exports = {
  config: {
    name: "add",
    aliases: ["ajoute", "addmember"],
    version: "3.1.0",
    author: "Shade × Gemini",
    role: 1, // Passer à 1 ou 0 selon les permissions de votre framework
    description: "⚡ Ajouter des membres via UID ou Lien (Réservé au Propriétaire et Admin Groupe)",
    category: "system"
  },

  langs: {
    fr: {
      notAllowed: "⛔ **[ACCÈS REFUSÉ]** Seuls les administrateurs du groupe et le Fondateur peuvent utiliser ce terminal.",
      usage: "💡 **[INFO TERMINAL]** Syntaxe requise : `add [UID ou Lien du profil]`",
      processing: "⏳ **[INITIALISATION]** Connexion à la passerelle Facebook... Tentative d'injection des utilisateurs.",
      result: "⚡ **[RAPPORT DE TRANSIT CYBER]**\n━━━━━━━━━━━━━━━━━\n🟩 Membres injectés : %1\n🟥 Échecs / Rejets : %2"
    },
    en: {
      notAllowed: "⛔ **[ACCESS DENIED]** Only group admins and the Founder can use this terminal.",
      usage: "💡 **[INFO TERMINAL]** Syntax: `add [UID or Profile Link]`",
      processing: "⏳ **[INITIALIZING]** Connecting to Facebook gateway...",
      result: "⚡ **[CYBER TRANSIT REPORT]**\n━━━━━━━━━━━━━━━━━\n🟩 Members added: %1\n🟥 Failed/Rejected: %2"
    }
  },

  onStart: async function ({ message, api, event, args, threadsData, getLang }) {
    const { threadID, messageID, senderID } = event;
    const OWNER_ID = "61573867120837";

    try {
      // 1. Récupération des données du groupe et de ses administrateurs
      const threadInfo = await threadsData.get(threadID) || {};
      const adminIDs = (threadInfo.adminIDs || []).map(admin => admin.id || admin);

      // 2. Vérification des permissions (Owner OU Admin du groupe)
      const isOwner = senderID === OWNER_ID;
      const isAdmin = adminIDs.includes(senderID);

      if (!isOwner && !isAdmin) {
        return message.reply(getLang("notAllowed"));
      }

      if (args.length === 0) {
        return message.reply(getLang("usage"));
      }

      try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch(e){}
      await message.reply(getLang("processing"));

      const members = threadInfo.members || [];
      let successCount = 0;
      let failedCount = 0;

      for (const item of args) {
        let uid = extractUIDLocal(item);

        if (!uid && global.utils?.findUid && /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb)\.com\/.*/i.test(item)) {
          try {
            uid = await global.utils.findUid(item);
          } catch (err) {
            uid = null;
          }
        }

        if (!uid) {
          failedCount++;
          continue;
        }

        if (members.some(m => m.userID == uid && m.inGroup)) {
          failedCount++;
          continue;
        }

        try {
          await api.addUserToGroup(uid, threadID);
          successCount++;
          await sleep(1200);
        } catch (addError) {
          failedCount++;
        }
      }

      if (successCount > 0) {
        try { api.setMessageReaction("✅", messageID, () => {}, true); } catch(e){}
      } else {
        try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
      }

      return message.reply(getLang("result", successCount, failedCount));
    } catch (globalError) {
      console.error(globalError);
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
      return message.reply("❌ Une erreur critique est survenue durant l'exécution du script.");
    }
  }
};
