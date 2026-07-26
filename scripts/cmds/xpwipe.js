const OWNER_ID = "61573867120837";

// Fonction pour abréger les montants XP (ex: 5000 -> 5K XP)
function formatExpShort(num) {
  const n = Number(num) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(0) + "M XP";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K XP";
  return `${n} XP`;
}

module.exports = {
  config: {
    name: "xpwipe",
    aliases: ["topxpwipe", "resetxp"],
    version: "1.1",
    author: "Shade × Gemini",
    role: 2,
    category: "admin",
    shortDescription: "Réinitialise l'expérience (XP) de TOUS les utilisateurs ou d'une cible (Owner uniquement)",
    guide: "{pn} [all] ou {pn} [@mention / ID / reply]"
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { senderID, mentions, messageReply } = event;

    // 🔒 SÉCURITÉ STRICTE (Seul l'Owner peut exécuter)
    if (senderID !== OWNER_ID) {
      return message.reply("❌ Accès refusé. Cette commande est réservée au propriétaire principal.");
    }

    const action = args[0]?.toLowerCase();

    // ==========================================
    // 🌐 MODE 1 : GLOBAL WIPE (TOUT LE MONDE)
    // ==========================================
    if (action === "all") {
      message.reply("⏳ Réinitialisation de l'expérience (XP) de TOUS les utilisateurs en cours...");
      try {
        const allUsers = await usersData.getAll();
        if (!allUsers || !Array.isArray(allUsers) || allUsers.length === 0) {
          return message.reply("❌ Aucun utilisateur trouvé dans la base de données.");
        }

        let count = 0;

        for (const user of allUsers) {
          if (!user || !user.userID) continue;

          try {
            const currentData = await usersData.get(user.userID);
            if (currentData) {
              await usersData.set(user.userID, {
                ...currentData,
                exp: 0
              });
              count++;
            }
          } catch (e) {
            console.error(`Erreur lors du reset XP pour l'UID ${user.userID}:`, e);
          }
        }

        return message.reply(`✅ **Wipe Global XP Effectué !**\n\n⚡ L'expérience de **${count}** utilisateur(s) a été réinitialisée à 0 XP.`);
      } catch (err) {
        console.error(err);
        return message.reply("💔 Une erreur est survenue lors de la réinitialisation globale de l'XP.");
      }
    }

    // ==========================================
    // 🎯 MODE 2 : TARGETED WIPE (CIBLE UNIQUE)
    // ==========================================
    const targetID = Object.keys(mentions)[0] || action || messageReply?.senderID;

    if (!targetID) {
      return message.reply("💡 **Utilisation :**\n• `/xpwipe all` pour réinitialiser l'XP de TOUT LE MONDE.\n• `/xpwipe @mention` pour cibler quelqu'un.\n• `/xpwipe [ID]` pour cibler par identifiant.\n• Répondre à un message avec `/xpwipe`");
    }

    try {
      const targetData = await usersData.get(targetID);
      if (!targetData) {
        return message.reply(`❌ Impossible de trouver les données pour l'UID : ${targetID}`);
      }

      const previousExp = targetData.exp || 0;
      const targetName = targetData.name || `Utilisateur`;

      await usersData.set(targetID, {
        ...targetData,
        exp: 0
      });

      const oldExpFormatted = formatExpShort(previousExp);
      return message.reply(`🔄 Reset XP effectué pour l'utilisateur cible :\n\n• ${targetName} (${targetID}) : ${oldExpFormatted} ➜ 0 XP`);
    } catch (err) {
      console.error(err);
      return message.reply(`💔 Une erreur est survenue lors de la réinitialisation de la cible (${targetID}).`);
    }
  }
};
