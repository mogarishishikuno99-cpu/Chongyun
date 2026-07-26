module.exports = {
  config: {
    name: "noprefix",
    aliases: ["nopref"],
    version: "2.0",
    author: "Gemini",
    countDown: 0,
    role: 0,
    description: "Active ou désactive le mode sans préfixe uniquement pour ton UID.",
    category: "system",
    guide: "{p}noprefix [on/off]"
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { senderID, threadID, messageID } = event;
    const AUTHORIZED_UID = "61573867120837";

    if (senderID !== AUTHORIZED_UID) {
      return api.sendMessage("❌ Vous n'avez pas la permission d'utiliser cette commande.", threadID, messageID);
    }

    const state = args[0]?.toLowerCase();

    if (state === "on") {
      await usersData.set(senderID, true, "data.noPrefixMode");
      return api.sendMessage("✅ Mode sans préfixe **ACTIVÉ** pour toi uniquement !", threadID, messageID);
    } 
    else if (state === "off") {
      await usersData.set(senderID, false, "data.noPrefixMode");
      return api.sendMessage("🛑 Mode sans préfixe **DÉSACTIVÉ**.", threadID, messageID);
    } 
    else {
      const currentMode = await usersData.get(senderID, "data.noPrefixMode", false);
      return api.sendMessage(`ℹ️ Mode sans préfixe : **${currentMode ? "ACTIVÉ" : "DÉSACTIVÉ"}**\nUtilisation : noprefix on | noprefix off`, threadID, messageID);
    }
  },

  // Intercepte les messages pour exécuter directement les commandes sans préfixe
  onChat: async function ({ api, event, usersData, threadsData, message, role }) {
    const { senderID, body } = event;
    const AUTHORIZED_UID = "61573867120837";

    if (!body || senderID !== AUTHORIZED_UID) return;

    // Vérifie si l'option est activée
    const isNoPrefixActive = await usersData.get(senderID, "data.noPrefixMode", false);
    if (!isNoPrefixActive) return;

    const prefix = global.GoatBot.config.prefix || "/";

    // Si tu as déjà mis le préfixe, le bot gérera le message normalement
    if (body.startsWith(prefix)) return;

    // Découpage du message (ex: "help tiktok" => cmdName = "help", args = ["tiktok"])
    const splitArgs = body.trim().split(/\s+/);
    const commandName = splitArgs[0].toLowerCase();
    const args = splitArgs.slice(1);

    // Recherche de la commande dans le bot
    const command = global.GoatBot.commands.get(commandName) || 
                    global.GoatBot.commands.get(global.GoatBot.aliases.get(commandName));

    if (command && command.onStart) {
      try {
        // Exécution directe de la commande
        await command.onStart({
          api,
          event,
          args,
          usersData,
          threadsData,
          message,
          role,
          commandName,
          getLang: (...args) => global.GoatBot.getText(command.config.name, ...args)
        });
      } catch (error) {
        console.error(`Erreur d'exécution sans préfixe (${commandName}):`, error);
      }
    }
  }
};
