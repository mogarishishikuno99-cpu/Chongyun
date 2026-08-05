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
const fonts = require("../func/fonts.js");
const { createTransferCard } = require("../canvas/transferCard");

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

function formatMoney(amount) {
  const num = Number(amount) || 0;
  return num.toLocaleString("fr-FR");
}

module.exports = {
  config: {
    name: "give",
    aliases: ["transfer", "send"],
    version: "2.1.3",
    role: 0,
    author: "Shade & AI",
    description: "Transfère de l'argent et génère une carte HUD Quantum sécurisée.",
    category: "economy",
    guide: {
      en: "{p}{n} [@tag] [montant] ou en répondant à un message : {p}{n} [montant]"
    },
    countDown: 3
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;
    let targetID = null;
    let rawAmount = null;

    if (type === "message_reply" && messageReply) {
      targetID = messageReply.senderID;
      rawAmount = args[0];
    } else if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      const filterArgs = args.filter((arg) => !arg.includes("@"));
      rawAmount = filterArgs[0];
    }

    const amountToTransfer = parseAmount(rawAmount);

    if (!targetID) {
      return api.sendMessage(
        fonts.christus("❌ Veuillez mentionner un destinataire ou répondre à son message."),
        threadID,
        messageID
      );
    }

    if (targetID === senderID) {
      return api.sendMessage(
        fonts.christus("❌ Impossible d'effectuer un transfert vers votre propre compte."),
        threadID,
        messageID
      );
    }

    if (!amountToTransfer || isNaN(amountToTransfer) || amountToTransfer <= 0) {
      return api.sendMessage(
        fonts.christus("MONTANT INVALIDE\n──────────────────\nUtilisez : 500  1k  2.5m  1b"),
        threadID,
        messageID
      );
    }

    const senderData = (await usersData.get(senderID)) || {};
    const targetData = (await usersData.get(targetID)) || {};
    const senderMoneyBefore = Number(senderData.money) || 0;
    const targetMoneyBefore = Number(targetData.money) || 0;

    if (senderMoneyBefore < amountToTransfer) {
      const missingAmount = amountToTransfer - senderMoneyBefore;
      return api.sendMessage(
        fonts.christus(`FONDS INSUFFISANTS\n────────────────────\nVotre solde   : $${formatMoney(senderMoneyBefore)}\nMontant voulu : $${formatMoney(amountToTransfer)}\nManque        : $${formatMoney(missingAmount)}`),
        threadID,
        messageID
      );
    }

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

    const senderName = (await usersData.getName(senderID)) || "Expéditeur";
    const receiverName = (await usersData.getName(targetID)) || "Destinataire";

    // Récupération des avatars via la méthode sécurisée usersData.getAvatarUrl()
    let senderAvatarUrl, receiverAvatarUrl;
    try {
      senderAvatarUrl = await usersData.getAvatarUrl(senderID);
    } catch (e) {
      senderAvatarUrl = "https://i.imgur.com/I3VsBEt.png";
    }

    try {
      receiverAvatarUrl = await usersData.getAvatarUrl(targetID);
    } catch (e) {
      receiverAvatarUrl = "https://i.imgur.com/I3VsBEt.png";
    }

    const formattedDate = new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const transactionId = `TX-${Math.floor(100000 + Math.random() * 900000)}`;

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

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const pathSave = path.join(cacheDir, `transfer_${transactionId}.png`);
    fs.writeFileSync(pathSave, imageBuffer);

    return api.sendMessage(
      {
        body: fonts.christus(`TRANSFERT QUANTIQUE REUSSI\n──────────────────────────\nDe      : ${senderName}\nVers    : ${receiverName}\nMontant : $${formatMoney(amountToTransfer)}\n──────────────────────────\n${senderName} : $${formatMoney(realSenderBalanceAfter)}\n${receiverName}: $${formatMoney(realReceiverBalanceAfter)}\nStatut  : // Sécurisé & Chiffré`),
        attachment: fs.createReadStream(pathSave)
      },
      threadID,
      () => {
        try {          if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
        } catch (err) {
          console.error("Erreur lors de la suppression du fichier temporaire :", err);
        }
      },
      messageID
    );
  }
};
