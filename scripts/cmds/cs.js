const axios = require("axios");
const fonts = require("../func/fonts.js");
const cmdsInfoUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/cmdsinfo.json";
const cmdsUrlJson = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/cmdsurl.json";
const fontUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/xfont.json";
const ITEMS_PER_PAGE = 10;
let fontMap = {};
async function loadFont() {
  try {
    const res = await axios.get(fontUrl, { timeout: 5000 });
    fontMap = res.data || {};
  } catch {
    fontMap = {};
  }
}
// Fonction utilitaire pour générer l'affichage d'une page spécifique
function generatePageMessage(finalArray, page, totalPages) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  const cmdsToShow = finalArray.slice(start, start + ITEMS_PER_PAGE);
  let msg = fonts.christus("[CYBER STORE - TERMINAL]\n━━━━━━━━━━━━━━━━━━━━━━━━━\nPage : ") + page + " / " + totalPages + "\n" + fonts.christus("Total disponible : ") + finalArray.length + fonts.christus(" cmds\n━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  cmdsToShow.forEach((cmd, i) => {
    if (!cmd?.cmd) return;
    msg += fonts.christus(`${start + i + 1}. `) + cmd.cmd + "\n" + fonts.christus("Auteur : ") + (cmd.author || "Inconnu") + "\n" + fonts.christus("Maj : ") + (cmd.update || "Inconnu") + "\n━━━━━━━━━━━━━━━━━━━━━━━━━\n";
  });
  msg += fonts.christus("[NAVIGATION]\n• Réponds avec le numéro pour extraire la commande.\n• Réponds page [num] pour changer de page (Ex: page 2).");
  return msg;
}
module.exports = {
  config: {
    name: "cs",
    aliases: ["cmdstore", "commandstore", "sakurastore"],
    version: "3.0.0",
    author: "Shade",
    role: 2,
    countDown: 3,
    category: "admin",
    guide: { fr: fonts.bold("{p}{n} [Recherche | Lettre | Page]") }
  },
  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    try {
      try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch(e){}
      await loadFont();
      const query = (args.join(" ") || "").trim().toLowerCase();
      const res = await axios.get(cmdsInfoUrl, { timeout: 7000 });
      const cmds = res?.data?.cmdName;
      if (!Array.isArray(cmds)) {
        return api.sendMessage(fonts.christus("[ERREUR FLUX] Base de données distante introuvable ou corrompue."), threadID, messageID);
      }
      let finalArray = cmds;
      let page = 1;
      if (query) {
        if (!isNaN(query)) {
          page = parseInt(query);
        } else if (query.length === 1) {
          finalArray = cmds.filter(c => c?.cmd?.toLowerCase()?.startsWith(query));
        } else {
          finalArray = cmds.filter(c => c?.cmd?.toLowerCase()?.includes(query));
        }
      }
      if (!finalArray.length) {
        try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
        return api.sendMessage(fonts.christus("[RÉSULTAT] Aucune commande ne correspond à cette recherche."), threadID, messageID);
      }
      const totalPages = Math.ceil(finalArray.length / ITEMS_PER_PAGE);
      if (page < 1 || page > totalPages) page = 1;
      const msg = generatePageMessage(finalArray, page, totalPages);
      const sent = await api.sendMessage(msg, threadID, messageID);
      try { api.setMessageReaction("✅", messageID, () => {}, true); } catch(e){}
      if (!sent?.messageID) return;
      global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        author: senderID,
        data: finalArray,
        page: page
      });
    } catch (err) {
      console.error(err);
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
      return api.sendMessage(fonts.christus("Échec de la connexion au serveur de stockage Cyber."), threadID, messageID);
    }
  },
  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, senderID, body } = event;
    const { author, data, page: currentPage, messageID: replyMsgID } = Reply || {};
    if (!data) return;
    if (senderID !== author) {
      return api.sendMessage(fonts.christus("[VERROU] Session expirée ou accès non autorisé."), threadID, messageID);
    }
    const input = body.trim().toLowerCase();
    const argsReply = input.split(/\s+/);
    // --- CAS 1 : CHANGEMENT DE PAGE ("page 2" ou "p 2") ---
    if (argsReply[0] === "page" || argsReply[0] === "p") {
      const nextPage = parseInt(argsReply[1]);
      const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
      if (isNaN(nextPage) || nextPage < 1 || nextPage > totalPages) {
        return api.sendMessage(fonts.christus(`[NAVIGATION] Index de page invalide. Choisissez entre 1 et ${totalPages}.`), threadID, messageID);
      }
      try {
        // Supprime l'ancien menu pour garder le salon propre
        try { api.unsendMessage(replyMsgID); } catch(e){}
        const newMsg = generatePageMessage(data, nextPage, totalPages);
        const sent = await api.sendMessage(newMsg, threadID, messageID);
        // Enregistre la nouvelle position de page dans global.GoatBot
        global.GoatBot.onReply.set(sent.messageID, {
          commandName: this.config.name,
          author: senderID,
          data: data,
          page: nextPage
        });
      } catch (err) {
        console.error(err);
      }
      return;
    }
    // --- CAS 2 : SÉLECTION D'UN NUMÉRO DE COMMANDE ---
    const num = parseInt(input);
    if (isNaN(num)) return;
    const index = num - 1;
    if (index < 0 || index >= data.length) {
      return api.sendMessage(fonts.christus("[INDEX INVALID] Ce numéro ne fait pas partie du registre actuel."), threadID, messageID);
    }
    try {
      try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch(e){}
      const cmd = data[index];
      const res = await axios.get(cmdsUrlJson, { timeout: 7000 });
      const url = res?.data?.[cmd.cmd];
      if (!url) {
        try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
        return api.sendMessage(fonts.christus(`[LINK NOT FOUND] Aucun dépôt d'URL enregistré pour la commande ${cmd.cmd}.`), threadID, messageID);
      }
      try { api.unsendMessage(replyMsgID); } catch(e){}
      try { api.setMessageReaction("💎", messageID, () => {}, true); } catch(e){}
      return api.sendMessage(fonts.christus("[DONNÉES DU PAQUET - STORE]\n━━━━━━━━━━━━━━━━━━━━━━━━━\nModule : ") + cmd.cmd + "\n" + fonts.christus("Développeur : ") + (cmd.author || "Inconnu") + "\n" + fonts.christus("Dernière mise à jour : ") + (cmd.update || "Non spécifiée") + "\n" + fonts.christus("Source URL : ") + url + "\n━━━━━━━━━━━━━━━━━━━━━━━━━",
        threadID,
        messageID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage(fonts.christus("Erreur critique lors de la récupération du paquet source."), threadID, messageID);
    }
  }
};
