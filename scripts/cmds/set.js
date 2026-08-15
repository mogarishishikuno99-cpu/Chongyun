const fonts = require("../func/fonts.js");
module.exports = {
    config: {
        name: "set",
        version: "2.4.1",
        author: "Shade",
        shortDescription: "Gestion des données admin avec support Reply et mode global (all)",
        longDescription: "Ajouter de l'argent, de l'expérience ou définir des variables personnalisées d'un utilisateur par tag, reply, sur soi-même ou à tous les utilisateurs (all).",
        category: "settings",
        guide: {
            en: "En réponse ou sur soi-même :\n{p}set money [montant]\nPar tag :\n{p}set money [montant] [@utilisateur]\nPour tout le monde :\n{p}set money all [montant]"
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
                const amountIndex = args[1]?.toLowerCase() === "all" ? 2 : 1;
                const amount = parseFloat(args[amountIndex]);
                if (isNaN(amount)) {
                    return api.sendMessage(fonts.christus("❌ Montant invalide pour l'action globale (all). Exemple : set money all 1000"), event.threadID);
                }

                if (action === 'money') {
                    await api.sendMessage(fonts.christus(`⏳ Ajout en cours de ${amount.toLocaleString()} $ pour TOUS les utilisateurs...`), event.threadID);
                    const allUsers = await usersData.getAll();
                    for (const user of allUsers) {
                        const uid = user.userID;
                        const currentMoney = (await usersData.get(uid, "money")) || 0;
                        const newMoney = currentMoney + amount;
                        await usersData.set(uid, newMoney, "money");
                    }
                    return api.sendMessage(fonts.christus(`💰 ${amount.toLocaleString()} $ ajoutés avec succès au solde de TOUS les utilisateurs (${allUsers.length} comptes mis à jour).`), event.threadID);
                }

                if (action === 'exp') {
                    await api.sendMessage(fonts.christus(`⏳ Ajout en cours de ${amount.toLocaleString()} d'expérience pour TOUS les utilisateurs...`), event.threadID);
                    const allUsers = await usersData.getAll();
                    for (const user of allUsers) {
                        const uid = user.userID;
                        const currentExp = (await usersData.get(uid, "exp")) || 0;
                        const newExp = currentExp + amount;
                        await usersData.set(uid, newExp, "exp");
                    }
                    return api.sendMessage(fonts.christus(`🌟 ${amount.toLocaleString()} d'expérience ajoutés avec succès pour TOUS les utilisateurs (${allUsers.length} comptes mis à jour).`), event.threadID);
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

            const name = (await usersData.getName?.(targetID)) || "Utilisateur";

            switch (action) {
                case 'money': {
                    const amount = parseFloat(args[1]);
                    if (isNaN(amount)) return api.sendMessage(fonts.christus("❌ Montant invalide"), event.threadID);

                    const currentMoney = (await usersData.get(targetID, "money")) || 0;
                    const newMoney = currentMoney + amount;
                    await usersData.set(targetID, newMoney, "money");
                    return api.sendMessage(fonts.christus(`💰 ${amount.toLocaleString()} $ ajoutés. Nouveau solde de ${name} : ${newMoney.toLocaleString()} $`), event.threadID);
                }

                case 'exp': {
                    const amount = parseInt(args[1], 10);
                    if (isNaN(amount)) return api.sendMessage(fonts.christus("❌ Montant invalide"), event.threadID);

                    const currentExp = (await usersData.get(targetID, "exp")) || 0;
                    const newExp = currentExp + amount;
                    await usersData.set(targetID, newExp, "exp");
                    return api.sendMessage(fonts.christus(`🌟 ${amount.toLocaleString()} d'expérience ajoutés. Nouveau total de ${name} : ${newExp.toLocaleString()}`), event.threadID);
                }

                case 'custom': {
                    const variable = args[1];
                    const value = args[2];
                    if (!variable || value === undefined) {
                        return api.sendMessage(fonts.christus("❌ Utilisation : {p}set custom [variable] [valeur]"), event.threadID);
                    }

                    let userData = await usersData.get(targetID) || {};
                    if (!userData.data) userData.data = {};
                    userData.data[variable] = value;

                    await usersData.set(targetID, userData.data, "data");
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
