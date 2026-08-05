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

/**
 * Analyse et convertit les abréviations (1k, 1.5M, 2T) en nombre réel.
 */
function parseAmount(input) {
  if (!input) return null;
  const cleanInput = input.trim().toUpperCase();
  const match = cleanInput.match(/^([0-9.]+)\s*([KMBTQAISG]?)$/);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const suffix = match[2];
  const multipliers = {
    K: 1000,
    M: 1000000,
    B: 1000000000,
    T: 100000000000,
    QA: 100000000000000,
    QI: 100000000000000000
  };

  if (suffix && multipliers[suffix]) {
    return Math.floor(value * multipliers[suffix]);
  }
  return Math.floor(value);
}

/**
 * Formate un montant sous forme lisible avec séparateurs de milliers
 */
function formatMoney(amount) {
  const num = Number(amount) || 0;
  return num.toLocaleString("fr-FR");
}

module.exports = {
  config: {
    name: "give",
    aliases: ["transfer", "send"],
    version: "2.1.0",
    role: 0,
    author: "Shade & AI",
    description: "Transfère de l'argent et génère une carte HUD Quantum sécurisée.",
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
      const filterArgs = args.filter((arg) => !arg.includes("@"));
      rawAmount = filterArgs[0];
    }

    const amountToTransfer = parseAmount(rawAmount);

    // Validation des données d'entrée
    if (!targetID) {
      return api.sendMessage(
        "❌ Veuillez mentionner un destinataire ou répondre à son message.",
        threadID,
        messageID
      );
    }

    if (targetID === senderID) {
      return api.sendMessage(
        "❌ Impossible d'effectuer un transfert vers votre propre compte.",
        threadID,
        messageID
      );
    }

    if (!amountToTransfer || isNaN(amountToTransfer) || amountToTransfer <= 0) {
      return api.sendMessage(
        "❌ Montant invalide.\nExemples : /transfer @nom 5k, /transfer 1.5M ou /transfer 500",
        threadID,
        messageID
      );
    }

    // 2. Récupération des données avant transaction
    const senderData = (await usersData.get(senderID)) || {};
    const targetData = (await usersData.get(targetID)) || {};

    const senderMoneyBefore = Number(senderData.money) || 0;
    const targetMoneyBefore = Number(targetData.money) || 0;

    if (senderMoneyBefore < amountToTransfer) {
      return api.sendMessage(
        `❌ Fonds insuffisants. Solde actuel : ${formatMoney(senderMoneyBefore)} $`,
        threadID,
        messageID
      );
    }

    // 3. Calcul et enregistrement direct en base de données
    const realSenderBalanceAfter = senderMoneyBefore - amountToTransfer;
    const realReceiverBalanceAfter = targetMoneyBefore + amountToTransfer;

    await usersData.set(senderID, {
      ...senderData,
      money: realSenderBalanceAfter
    });

    await usersData.set(targetID, {
      ...targetData,
      money: realReceiverBalanceAfter
    });

    // 4. Récupération des noms et avatars réels
    const senderName = (await usersData.getName(senderID)) || "Expéditeur";
    const receiverName = (await usersData.getName(targetID)) || "Destinataire";

    const fbAccessToken = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
    const senderAvatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=${fbAccessToken}`;
    const receiverAvatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${fbAccessToken}`;

    const formattedDate = new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const transactionId = `TX-${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. Génération de la carte avec les vrais montants réels calculés
    const imageBuffer = await createTransferCard({
      senderName: senderName,
      senderTag: `#${senderID.slice(-4)}`,
      senderRank: "MEMBRE",
      senderBalanceBefore: senderMoneyBefore,
      senderBalanceAfter: realSenderBalanceAfter,
      senderAvatar: senderAvatarUrl,

      receiverName: receiverName,
      receiverTag: `#${targetID.slice(-4)}`,
      receiverRank: "MEMBRE",
      receiverBalanceBefore: targetMoneyBefore,
      receiverBalanceAfter: realReceiverBalanceAfter,
      receiverAvatar: receiverAvatarUrl,

      amount: amountToTransfer,
      date: formattedDate,
      transactionId: transactionId,
      systemName: "QUANTUM BANK"
    });

    // 6. Sauvegarde et envoi du rendu
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const pathSave = path.join(cacheDir, `transfer_${transactionId}.png`);
    fs.writeFileSync(pathSave, imageBuffer);

    return api.sendMessage(
      {
        body: `✅ **Transfert réussi !**\n💸 **${senderName}** a envoyé **${formatMoney(amountToTransfer)} $** à **${receiverName}**.`,
        attachment: fs.createReadStream(pathSave)
      },
      threadID,
      () => {
        try {
          if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
        } catch (err) {
          console.error("Erreur lors de la suppression du fichier temporaire :", err);
        }
      },
      messageID
    );
  }
};
