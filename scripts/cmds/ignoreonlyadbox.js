const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "ignoreonlyadbox",
    aliases: ["ignoreadboxonly", "ignoreadminboxonly", "ignbox"],
    version: "2.1.5",
    author: "Shade & Gemini",
    countDown: 5,
    role: 2,
    description: "Gérer la liste des commandes qui ignorent le mode adminOnly par groupe",
    category: "security",
    guide: {
      en: "• {p}{n} add [commande] → Autoriser une commande\n• {p}{n} del [commande] → Retirer une commande\n• {p}{n} list → Afficher la liste des exceptions"
    }
  },
  langs: {
    en: {
      denied: "❌ Accès refusé. Cette commande est strictement réservée aux administrateurs.",
      missingAdd: "❌ Veuillez spécifier le nom de la commande à ajouter aux exceptions.",
      missingDel: "❌ Veuillez spécifier le nom de la commande à retirer des exceptions.",
      notFound: "❌ La commande \"%1\" n'existe pas dans le système.",
      already: "⚠️ La commande \"%1\" est déjà présente dans la liste des exceptions de ce groupe.",
      added: "✓ La commande \"%1\" ignore désormais les restrictions adminOnly dans ce groupe.",
      notIn: "❌ La commande \"%1\" ne fait pas partie de la liste des exceptions.",
      removed: "✓ La commande \"%1\" a été retirée des exceptions avec succès.",
      list: "⚡ 𝗘𝗫𝗖𝗘𝗣𝗧𝗜𝗢𝗡𝗦 𝗗𝗘 𝗟'𝗔𝗗𝗠𝗜𝗡 𝗕𝗢𝗫 ⚡\n\n%1\n\n✨ Total : %2 commande(s) autorisée(s)",
      empty: "📦 Aucune exception enregistrée pour le moment dans ce groupe."
    }
  },
  onStart: async function ({ args, message, event, threadsData, getLang }) {
    try {
      const threadID = event.threadID;
      let ignoreList = await threadsData.get(
        threadID,
        "data.ignoreCommanToOnlyAdminBox",
        []
      );
      const action = args[0]?.toLowerCase();

      // ➕ AJOUT D'UNE EXCEPTION
      if (action === "add") {
        if (!args[1]) return message.reply(fonts.christus(getLang("missingAdd")));
        const cmd = args[1].toLowerCase();
        
        const command = global.GoatBot.commands.get(cmd) || global.GoatBot.commands.get(global.GoatBot.config.aliases?.[cmd]);
        if (!command) return message.reply(fonts.christus(getLang("notFound", cmd)));
        const realName = command.config.name;
        
        if (ignoreList.includes(realName)) return message.reply(fonts.christus(getLang("already", realName)));
        
        ignoreList.push(realName);
        await threadsData.set(
          threadID,
          ignoreList,
          "data.ignoreCommanToOnlyAdminBox"
        );
        return message.reply(fonts.christus(getLang("added", realName)));
      }

      // ❌ SUPPRESSION D'UNE EXCEPTION
      if (["del", "remove", "rm"].includes(action)) {
        if (!args[1]) return message.reply(fonts.christus(getLang("missingDel")));
        const cmd = args[1].toLowerCase();
        const command = global.GoatBot.commands.get(cmd) || global.GoatBot.commands.get(global.GoatBot.config.aliases?.[cmd]);
        if (!command) return message.reply(fonts.christus(getLang("notFound", cmd)));
        const realName = command.config.name;

        if (!ignoreList.includes(realName)) return message.reply(fonts.christus(getLang("notIn", realName)));
        
        ignoreList.splice(ignoreList.indexOf(realName), 1);
        await threadsData.set(
          threadID,
          ignoreList,
          "data.ignoreCommanToOnlyAdminBox"
        );
        return message.reply(fonts.christus(getLang("removed", realName)));
      }

      // 📜 AFFICHAGE DE LA LISTE
      if (action === "list") {
        if (!ignoreList || ignoreList.length === 0) return message.reply(fonts.christus(getLang("empty")));
        
        const formattedList = ignoreList.map((c, index) => `┃  ${index + 1}. ➔ ${c}`).join("\n");
        return message.reply(
          fonts.christus(
            getLang("list", formattedList, ignoreList.length)
          )
        );
      }

      return message.SyntaxError();
    } catch (e) {
      console.error(e);
      return message.reply(fonts.christus("❌ Une erreur interne est survenue lors de la configuration du protocole."));
    }
  }
};
