const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "group",
    aliases: ["groups", "grouplist", "leavegc"],
    version: "2.0.5",
    author: "Shade",
    role: 4,
    category: "owner",
    description: "Affiche la liste des groupes et permet de les quitter.",
    guide: {
      en: "Tapez la commande, puis répondez au message avec 'page [numéro]' ou 'kick [numéro]'."
    }
  },

  onStart: async function ({ api, event, args, message, commandName }) {
    const { senderID } = event;

    // Récupération de la configuration globale
    const config = global.config || global.GoatBot?.config || {};
    
    // Supporte adminBot (config.json) et ADMINBOT
    const rawAdmin = config.adminBot || config.ADMINBOT || [];
    const rawNdch = config.ndch || config.NDCH || [];

    const adminList = [
      ...(Array.isArray(rawAdmin) ? rawAdmin : [rawAdmin]),
      ...(Array.isArray(rawNdch) ? rawNdch : [rawNdch])
    ].filter(Boolean).map(id => String(id).trim());

    if (!adminList.includes(String(senderID).trim())) {
      return message.reply(fonts.christus("❌ Cette commande est réservée aux administrateurs du bot."));
    }

    try {
      const inbox = (await api.getThreadList(100, null, ["INBOX"])) || [];
      const groupList = inbox.filter((t) => t.isGroup && t.name);

      if (groupList.length === 0) {
        return message.reply(fonts.christus("❌ Le bot n'est dans aucun groupe."));
      }

      const requestedPage = parseInt(args[0], 10) || 1;
      await sendGroupPage(api, event, groupList, requestedPage, commandName);
    } catch (err) {
      console.error("Erreur group list:", err);
      return message.reply(fonts.christus("❌ Erreur lors de la récupération des groupes."));
    }
  },

  onReply: async function ({ api, event, Reply, message, commandName }) {
    const { senderID, body } = event;
    const { author, groupList, messageID: replyMsgID } = Reply || {};

    const config = global.config || global.GoatBot?.config || {};
    const rawAdmin = config.adminBot || config.ADMINBOT || [];
    const rawNdch = config.ndch || config.NDCH || [];

    const adminList = [
      ...(Array.isArray(rawAdmin) ? rawAdmin : [rawAdmin]),
      ...(Array.isArray(rawNdch) ? rawNdch : [rawNdch])
    ].filter(Boolean).map(id => String(id).trim());

    if (!adminList.includes(String(senderID).trim()) || String(senderID) !== String(author)) return;

    const args = (body || "").trim().replace(/ +/g, " ").toLowerCase().split(" ");
    const action = args[0];

    if (action === "page") {
      const targetPage = parseInt(args[1], 10);
      const itemsPerPage = 10;
      const totalPages = Math.ceil(groupList.length / itemsPerPage);

      if (isNaN(targetPage) || targetPage < 1 || targetPage > totalPages) {
        return message.reply(fonts.christus(`⚠️ Page invalide (choisissez entre 1 et ${totalPages}).`));
      }

      if (replyMsgID) {
        try { await api.unsendMessage(replyMsgID); } catch (e) {}
      }
      await sendGroupPage(api, event, groupList, targetPage, commandName);
      return;
    }

    if (action === "kick" || action === "leave") {
      const targetNumber = parseInt(args[1], 10);

      if (isNaN(targetNumber) || targetNumber <= 0 || targetNumber > groupList.length) {
        return message.reply(fonts.christus("⚠️ Numéro invalide."));
      }

      const targetGroup = groupList[targetNumber - 1];
      if (!targetGroup) {
        return message.reply(fonts.christus("❌ Groupe introuvable."));
      }

      try {
        await api.sendMessage(
          fonts.christus("👋 Le bot quitte ce groupe sous l'ordre de son administrateur."),
          targetGroup.threadID
        ).catch(() => {});

        const botID = api.getCurrentUserID();
        await api.removeUserFromGroup(botID, targetGroup.threadID);

        if (replyMsgID) {
          try { await api.unsendMessage(replyMsgID); } catch (e) {}
        }
        return message.reply(fonts.christus(`✅ Le bot a quitté le groupe : ${targetGroup.name}`));
      } catch (err) {
        console.error("Erreur lors de la sortie du groupe:", err);
        return message.reply(fonts.christus("❌ Impossible de quitter ce groupe."));
      }
    }
  }
};

async function sendGroupPage(api, event, groupList, page, commandName) {
  const { threadID, messageID, senderID } = event;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(groupList.length / itemsPerPage);

  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;

  const startIdx = (page - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedGroups = groupList.slice(startIdx, endIdx);

  let msg = `👥 [ Liste des groupes - Page ${page}/${totalPages} ]\n`;
  msg += `Nombre total de groupes : ${groupList.length}\n\n`;

  paginatedGroups.forEach((group, index) => {
    const globalIndex = startIdx + index + 1;
    msg += `${globalIndex}. ${group.name}\nID : ${group.threadID}\nMembres : ${group.participantIDs?.length || "Inconnu"}\n\n`;
  });

  msg += `👉 Répondez à ce message avec :\n`;
  msg += `• "page [numéro]" (ex: page 2)\n`;
  msg += `• "kick [numéro]" (ex: kick 5)`;

  const sentInfo = await api.sendMessage(fonts.christus(msg), threadID, messageID);
  const targetMessageID = typeof sentInfo === "object" ? sentInfo?.messageID : sentInfo;

  if (global.GoatBot?.onReply && targetMessageID) {
    global.GoatBot.onReply.set(targetMessageID, {
      commandName,
      author: senderID,
      groupList,
      messageID: targetMessageID
    });
  }
}
