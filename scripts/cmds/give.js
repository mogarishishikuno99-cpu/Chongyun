/** * @author Shade & AI 
 * @title Transfert d'argent Canvas Premium (Sci-Fi / Quantum) 
 * @name give 
 * @class give 
 * @version 2.0.0 
 * @description Donne de l'argent de portefeuille à un autre utilisateur avec le design futuriste Quantum. 
 * @usage give [@tag/reply] [montant] 
 */

const path = require("path");
const fs = require("fs");
const { createTransferCard } = require("../canvas/transferCard");

// Convertit les abréviations (1k, 1.5M, 2T) en nombres réels
function parseAmount(input) {
    if (!input) return null;
    const cleanInput = input.trim().toUpperCase();
    const match = cleanInput.match(/^([0-9.]+)\s*([KMBTQAISG]?)$/);
    if (!match) return null;
    const value = parseFloat(match[1]);
    const suffix = match[2];
    const multipliers = {
        'K': 1000,
        'M': 1000000,
        'B': 1000000000,
        'T': 100000000000,
        'QA': 100000000000000,
        'QI': 100000000000000000
    };
    if (suffix && multipliers[suffix]) {
        return Math.floor(value * multipliers[suffix]);
    }
    return Math.floor(value);
}

// Même système d'abréviation intelligent que la Balance Card
function formatMoney(amount) {
    const absoluteNum = Number(amount);
    if (isNaN(absoluteNum) || absoluteNum === 0) return "0";
    if (absoluteNum < 1000) return `${absoluteNum}`;
            
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi"];
    let i = Math.floor(Math.log10(absoluteNum) / 3);
            
    if (i >= suffixes.length) {
        i = suffixes.length - 1;
    }
            
    const formatted = (absoluteNum / Math.pow(1000, i)).toFixed(1);
    return `${formatted.replace(/\.0$/, "")} ${suffixes[i]}`;
}

module.exports = {
  config: {
      name: "give",
      version: "2.0.0",
      role: 0,           
      author: "Shade & AI",            
      description: "Donne de l'argent via tag ou réponse avec gestion des abréviations (k, M, B, T) et interface Quantum Premium",            
      category: "economy",            
      guide: {
        fr: "{p}{n} [@tag] [montant] ou en répondant à un message : {p}{n} [montant]"
      },            
      countDown: 3    
  },
  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;
              
    let targetID = null;
    let rawAmount = null;

    // 1. Détection de la cible et extraction de l'argument du montant
    if (type === "message_reply" && messageReply) {
      targetID = messageReply.senderID;
      rawAmount = args[0];
    } else if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      const filterArgs = args.filter(arg => !arg.includes("@"));
      rawAmount = filterArgs[0];
    }

    // Conversion de la chaîne (ex: "1k") en nombre (ex: 1000)
    let amount = parseAmount(rawAmount);

    // Validation des données d'entrée
    if (!targetID) {
      return api.sendMessage("❌ Tag la personne ou réponds à son message pour lui donner de l'argent 🫶", threadID, messageID);
    }
    if (targetID === senderID) {
      return api.sendMessage("❌ L'auto-donation est bloquée par la banque centrale.", threadID, messageID);
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      return api.sendMessage("❌ Montant invalide.\nExemples : /give @nom 5k ou /give 1.5M\nEn réponse : /give 500", threadID, messageID);
    }
            
    // 2. Récupération des données initiales avant modification (pour les états "BEFORE")
    let senderData = await usersData.get(senderID) || {};
    let targetData = await usersData.get(targetID) || {};

    const senderMoneyBefore = senderData.money !== undefined ? senderData.money : 0;
    const targetMoneyBefore = targetData.money !== undefined ? targetData.money : 0;

    if (senderMoneyBefore < amount) {
      return api.sendMessage(`❌ Fonds insuffisants dans ton portefeuille. (Solde actuel : ${formatMoney(senderMoneyBefore)} $)`, threadID, messageID);
    }
            
    // 3. Débit / Crédit et calcul des états "AFTER"
    const senderMoneyAfter = senderMoneyBefore - amount;
    const targetMoneyAfter = targetMoneyBefore + amount;

    senderData.money = senderMoneyAfter;
    targetData.money = targetMoneyAfter;
            
    await usersData.set(senderID, { money: senderData.money, data: senderData.data || {}, exp: senderData.exp || 0 });
    await usersData.set(targetID, { money: targetData.money, data: targetData.data || {}, exp: targetData.exp || 0 });
            
    // Récupération des pseudos
    const senderName = (await usersData.getName(senderID)) || "Donateur Anonyme";
    const targetName = (await usersData.getName(targetID)) || "Bénéficiaire";
            
    // Initialisation sécurisée du dossier cache
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    // Génération des URLs des avatars Facebook via Graph API
    const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
    const senderAvatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=${token}`;
    const targetAvatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${token}`;

    // Date formatée pour le HUD
    const formattedDate = new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    // === GÉNÉRATION DU CANVAS NÉON ULTRA PREMIUM ===
    const imageBuffer = await createTransferCard({
      senderName: senderName,
      senderAvatar: senderAvatarUrl,
      receiverName: targetName,
      receiverAvatar: targetAvatarUrl,
      amount: amount,
      senderBalance: {
        before: senderMoneyBefore,
        after: senderMoneyAfter
      },
      receiverBalance: {
        before: targetMoneyBefore,
        after: targetMoneyAfter
      },
      senderRank: `#${senderID.slice(-3)}`,
      receiverRank: `#${targetID.slice(-3)}`,
      date: formattedDate
    });

    // Sauvegarde temporaire du fichier
    const pathSave = path.join(cacheDir, `give_quantum_${senderID}_${targetID}.png`);
    fs.writeFileSync(pathSave, imageBuffer);

    // Envoi du message avec la pièce jointe
    return api.sendMessage({
      body: `💸 **${senderName}** a transféré **$${formatMoney(amount)}** sur le compte de **${targetName}** !`,
      attachment: fs.createReadStream(pathSave)
    }, threadID, () => {
      try { 
        if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave); 
      } catch (err) {}
    }, messageID);
  }
};
