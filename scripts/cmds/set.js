const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "set",
    version: "2.3.0",
    author: "Shade & AI",
    shortDescription: "Gestion des données admin avec support Reply et mode global (all)",
    longDescription: "Définir l'argent, l'expérience ou des variables personnalisées d'un utilisateur par tag, reply, sur soi-même ou à tous les utilisateurs (all).",
    category: "settings",
    guide: {
      fr: "En réponse ou sur soi-même :\n{p}set money [montant]\nPar tag :\n{p}set money [montant] [@utilisateur]\nPour tout le monde :\n{p}set money all [montant]"
    },
    role: 5 // Niveau Admin requis par le système
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      // Liste des UID des Admins suprêmes autorisés
      const ADMIN_UIDS = ["61573867120837"];
            
      if (!ADMIN_UIDS.includes(event.senderID.toString())) {
        return api.sendMessage(fonts.christus("⛔ Accès refusé : privilèges admin requis"), event.threadID);
      }

      const action = args[0]?.toLowerCase();
      if (!action) {
        return api.sendMessage(fonts.christus("❌ Action manquante. Options : money, exp, custom"), event.threadID);
      }

      // --- VÉRIFICATION DU MODE GLOBAL "ALL" ---
      const isAllMode = args[1]?.toLowerCase() === "all" || args[2]?.toLowerCase() === "all";

      if (isAllMode) {
        // Détermine le montant selon la position de "all"
        const amountIndex = args[1]?.toLowerCase() === "all" ? 2 : 1;
        const amount = parseFloat(args[amountIndex]);

        if (isNaN(amount)) {
          return api.sendMessage(fonts.christus("❌ Montant invalide pour l'action globale (all). Exemple : set money all 1000"), event.threadID);
        }

        if (action === 'money') {
          // Récupère tous les utilisateurs enregistrés dans la base de données
          const allUsers = await usersData.getAll();
          
          for (const user of allUsers) {
            const uid = user.userID;
            let userData = user.data || {};
            await usersData.set(uid, {
              ...userData,
              money: amount
            });
          }

          return api.sendMessage(fonts.christus(`💰 Argent défini à ${amount.toLocaleString()} $ pour TOUS les utilisateurs (${allUsers.length} comptes mis à jour).`), event.threadID);
        } 
        
        if (action === 'exp') {
          const allUsers = await usersData.getAll();
          
          for (const user of allUsers) {
            const uid = user.userID;
            let userData = user.data || {};
            await usersData.set(uid, {
              ...userData,
              exp: amount
            });
          }

          return api.sendMessage(fonts.christus(`🌟 Expérience définie à ${amount.toLocaleString()} pour TOUS les utilisateurs (${allUsers.length} comptes mis à jour).`), event.threadID);
        }

        return api.sendMessage(fonts.christus("❌ Le mode 'all' est uniquement disponible pour 'money' et 'exp'."), event.threadID);
      }

      // --- LOGIQUE DE DÉTECTION DE LA CIBLE CLASSIQUE (Reply > Tag > Soi-même) ---
      let targetID = event.senderID;

      if (event.type === "message_reply" && event.messageReply) {
        targetID = event.messageReply.senderID;
      } else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }

      // Récupération sécurisée des données actuelles pour éviter de les écraser
      let userData = await usersData.get(targetID);
      if (!userData) userData = {};
      if (!userData.data) userData.data = {};
      const name = (await usersData.getName?.(targetID)) || "Utilisateur";

      switch (action) {
        case 'money': {
          const amount = parseFloat(args[1]);
          if (isNaN(amount)) return api.sendMessage(fonts.christus("❌ Montant invalide"), event.threadID);

          await usersData.set(targetID, {
            ...userData,
            money: amount
          });
          return api.sendMessage(fonts.christus(`💰 Argent défini à ${amount.toLocaleString()} $ pour ${name}`), event.threadID);
        }
        case 'exp': {
          const amount = parseInt(args[1]);
          if (isNaN(amount)) return api.sendMessage(fonts.christus("❌ Montant invalide"), event.threadID);

          await usersData.set(targetID, {
            ...userData,
            exp: amount
          });
          return api.sendMessage(fonts.christus(`🌟 Expérience définie à ${amount.toLocaleString()} pour ${name}`), event.threadID);
        }
        case 'custom': {
          const variable = args[1];
          const value = args[2];
          if (!variable || value === undefined) {
            return api.sendMessage(fonts.christus("❌ Utilisation : {p}set custom [variable] [valeur]"), event.threadID);
          }

          userData.data[variable] = value;
          await usersData.set(targetID, {
            ...userData,
            data: userData.data
          });
          return api.sendMessage(fonts.christus(`🔧 Variable "${variable}" définie à "${value}" pour ${name}`), event.threadID);
        }
        default:
          return api.sendMessage(fonts.christus("❌ Action invalide. Options disponibles : money, exp, custom"), event.threadID);
      }
    } catch (error) {
      console.error("Erreur Admin Set :", error);
      return api.sendMessage(fonts.christus("⚠️ Commande échouée : " + error.message), event.threadID);
    }
  }
};
