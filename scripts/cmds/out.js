const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "out",
    aliases: ["leave", "quitter"],
    version: "2.5.0",
    author: "Shade × Gemini",
    countDown: 5,
    role: 1, // Niveau Admin du groupe (et Owner via l'UID)
    description: "Fait quitter le bot du groupe actuel ou de tous les autres groupes connectés",
    category: "owner",
    guide: {
      fr: "{p}{n} : Quitter le groupe actuel\n{p}{n} all : Quitter tous les autres groupes connectés"
    }
  },

  onStart: async function ({ api, event, args }) {
    const ownerID = "61573867120837"; // Identifiant administrateur principal (toi)
    const { threadID, senderID, messageID } = event;

    // Vérification des droits : soit c'est le propriétaire (toi), soit c'est un admin du groupe
    let isAuthorized = (senderID === ownerID);

    if (!isAuthorized) {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
        if (adminIDs.includes(senderID)) {
          isAuthorized = true;
        }
      } catch (e) {
        console.error("Erreur lors de la vérification des administrateurs du groupe", e);
      }
    }

    if (!isAuthorized) {
      return api.sendMessage(fonts.christus("Désolé, cette commande est réservée aux administrateurs du groupe ou à mon créateur."), threadID, messageID);
    }

    const action = args[0]?.toLowerCase();

    // ==========================================
    // PROTOCOLE : QUITTER TOUS LES AUTRES GROUPES
    // ==========================================
    if (action === "all") {
      // Sécurité supplémentaire : seul le créateur (ownerID) peut utiliser la commande "all"
      if (senderID !== ownerID) {
        return api.sendMessage(fonts.christus("Désolé, seul mon créateur peut utiliser l'option 'all'."), threadID, messageID);
      }

      try {
        const list = await api.getThreadList(100, null, ["INBOX"]);
        
        // Filtrage pour exclure le groupe actuel
        const otherGroups = list.filter(thread => thread.isGroup && thread.threadID !== threadID);

        if (otherGroups.length === 0) {
          return api.sendMessage(fonts.christus("Aucun autre groupe détecté. Je reste connecté ici."), threadID);
        }

        await api.sendMessage(fonts.christus(`Nettoyage en cours... Départ de ${otherGroups.length} groupes.`), threadID);

        let count = 0;
        for (const group of otherGroups) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            await api.removeUserFromGroup(api.getCurrentUserID(), group.threadID);
            count++;
          } catch (e) {
            console.error(`Impossible de quitter le groupe ID: ${group.threadID}`, e);
          }
        }

        return api.sendMessage(fonts.christus(`Opération terminée. Groupes quittés : ${count}.`), threadID);
      } catch (err) {
        console.error(err);
        return api.sendMessage(fonts.christus("Une erreur est survenue lors du nettoyage global."), threadID);
      }
    }

    // ==========================================
    // PROTOCOLE : QUITTER LE GROUPE ACTUEL
    // ==========================================
    try {
      await api.sendMessage(fonts.christus("D'accord, je quitte 👋. Prenez soin de vous ☺️"), threadID);

      setTimeout(() => {
        api.removeUserFromGroup(api.getCurrentUserID(), threadID);
      }, 1000);
    } catch (err) {
      console.error(err);
      api.sendMessage(fonts.christus("Échec : Impossible de quitter le groupe actuel."), threadID);
    }
  }
};
