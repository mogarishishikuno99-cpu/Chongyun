const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "noprefix",
    version: "1.0.3",
    author: "Shade",
    countDown: 0,
    role: 4,
    description: "Gestionnaire de commandes sans préfixe",
    category: "system",
    guide: "{p}noprefix [on/off]"
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const { threadID, messageID, senderID } = event;
    const action = args[0]?.toLowerCase();

    if (action === "on" || action === "off") {
      const targetState = action === "on";
      await usersData.set(senderID, targetState, "data.noPrefixMode");
      return api.sendMessage(fonts.christus(`⚠ | Le mode sans préfixe a été ${targetState ? "activé" : "désactivé"} avec succès.`), threadID, messageID);
    }

    const currentStatus = await usersData.get(senderID, "data.noPrefixMode", false);
    return api.sendMessage(fonts.christus(`⚠ | Mode sans préfixe : ${currentStatus ? "ACTIVÉ" : "DÉSACTIVÉ"}\nUtilisez "noprefix on" ou "noprefix off".`), threadID, messageID);
  },

  onChat: async function ({ api, event, usersData, threadsData, role }) {
    if (!event.body || role < 0) return;

    const senderID = event.senderID;
    
    const noPrefixMode = await usersData.get(senderID, "data.noPrefixMode", false);
    if (!noPrefixMode) return;

    const prefix = global.GoatBot.config.prefix || "/";
    if (event.body.startsWith(prefix)) return;

    const args = event.body.trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const commands = global.GoatBot.commands;
    let command = commands.get(commandName) || commands.get(global.GoatBot.aliases?.get(commandName));

    if (!command) return;

    const requiredRole = command.config.role || 0;
    if (role < requiredRole) {
      return api.sendMessage(fonts.christus("⚠ | Vous n'avez pas les permissions requises."), event.threadID, event.messageID);
    }

    try {
      // Construction de l'objet message natif avec support de tous les utilitaires
      const msg = {
        reply: (text, callback) => api.sendMessage(text, event.threadID, callback, event.messageID),
        send: (text, callback) => api.sendMessage(text, event.threadID, callback),
        SyntaxError: () => {
          const usage = command.config.guide?.[global.GoatBot.config.language] || command.config.guide?.en || "Aucun guide disponible.";
          return api.sendMessage(fonts.christus(`⚠ | Syntaxe incorrecte. Guide :\n${usage}`), event.threadID, event.messageID);
        }
      };

      // Implémentation réelle de getLang liée au système de traduction de GoatBot
      const getLang = function (...keys) {
        try {
          return global.GoatBot.getText(command.config.name, ...keys);
        } catch {
          return keys[0]; // Fallback si la clé n'est pas trouvée
        }
      };

      // Exécution de la commande avec le contexte complet
      await command.onStart({
        api,
        event,
        args,
        message: msg,
        usersData,
        threadsData,
        prefix: "",
        role,
        commandName,
        getLang
      });

    } catch (error) {
      console.error(`Erreur sans préfixe (${commandName}):`, error);
      return api.sendMessage(fonts.christus("⚠ | Une erreur est survenue lors de l'exécution de la commande."), event.threadID, event.messageID);
    }
  }
};
