const fonts = require("../func/fonts.js");

const MAX_PLAYS = 20;
const COOLDOWN_TIME = 10 * 60 * 1000; // 10 minutes en millisecondes

function formatMoney(amount) {
  if (amount >= 1e12) return (amount / 1e12).toFixed(2) + "T";
  if (amount >= 1e9) return (amount / 1e9).toFixed(2) + "B";
  if (amount >= 1e6) return (amount / 1e6).toFixed(2) + "M";
  if (amount >= 1e3) return (amount / 1e3).toFixed(2) + "K";
  return amount.toString();
}

module.exports = {
  config: {
    name: "dice",
    version: "2.0.0",
    author: "Shade",
    countDown: 5,
    role: 0,
    description: "Joue tes pièces virtuelles sur un lancer de dé contre le bot.",
    category: "economy",
    guide: "{p}dice <amount>"
  },
  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;

    const betAmount = args[0];
    if (!betAmount) {
      return api.sendMessage(fonts.christus("Veuillez spécifier un montant de pièces à parier."), threadID, messageID);
    }

    let userData = await usersData.get(senderID);
    if (!userData) userData = {};
    if (!userData.data) userData.data = {};
    if (userData.money === undefined) userData.money = 0;

    let currentBalance = userData.money;
    let bet = 0;

    if (betAmount.toLowerCase() === 'all') {
      bet = currentBalance;
    } else {
      bet = parseInt(betAmount);
    }

    if (isNaN(bet) || bet <= 0) {
      return api.sendMessage(fonts.christus("Veuillez entrer un nombre positif valide pour votre mise."), threadID, messageID);
    }

    if (bet > currentBalance) {
      return api.sendMessage(fonts.christus(`Vous n'avez pas assez de pièces. Solde actuel : ${formatMoney(currentBalance)} pièces.`), threadID, messageID);
    }

    const now = Date.now();
    if (!userData.data.dicePlayCount) userData.data.dicePlayCount = 0;
    if (!userData.data.diceLastTime) userData.data.diceLastTime = 0;

    if (userData.data.dicePlayCount >= MAX_PLAYS) {
      const timeLeft = COOLDOWN_TIME - (now - userData.data.diceLastTime);
      if (timeLeft > 0) {
        const minutes = Math.floor(timeLeft / (60 * 1000));
        const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
        return api.sendMessage(
          fonts.christus(`Tu as atteint la limite de ${MAX_PLAYS} parties. Attends encore ${minutes}m ${seconds}s avant de rejouer.`),
          threadID,
          messageID
        );
      } else {
        userData.data.dicePlayCount = 0;
        userData.data.diceLastTime = 0;
      }
    }

    userData.data.dicePlayCount += 1;
    if (userData.data.dicePlayCount === MAX_PLAYS) {
      userData.data.diceLastTime = now;
    }

    const userRoll = Math.floor(Math.random() * 6) + 1;
    const botRoll = Math.floor(Math.random() * 6) + 1;

    let isWin = userRoll > botRoll;
    let isTie = userRoll === botRoll;
    let newBalance = currentBalance;
    let statusText = "";
    let rewardText = "";

    if (isTie) {
      statusText = "MATCH NUL";
      rewardText = "Mise remboursée";
    } else if (isWin) {
      newBalance += bet;
      statusText = "VICTOIRE";
      rewardText = `+$${formatMoney(bet)}`;
    } else {
      newBalance -= bet;
      statusText = "DÉFAITE";
      rewardText = `-$${formatMoney(bet)}`;
    }

    userData.money = newBalance;
    await usersData.set(senderID, userData);

    const caption = `╭───────────────✦\n` +
      `│ 🎲 𝗗𝗜𝗖𝗘 𝗥𝗘𝗦𝗨𝗟𝗧 𝗣𝗥𝗢\n` +
      `├────────────────\n` +
      `│ 👤 Ton lancer : ${userRoll}\n` +
      `│ 🤖 Lancer du bot : ${botRoll}\n` +
      `├────────────────\n` +
      `│ 📌 Statut : ${statusText}\n` +
      `│ 💰 Gain/Perte : ${rewardText}\n` +
      `│ 🏦 Nouveau solde : $${formatMoney(newBalance)}\n` +
      `│ 🕹️ Parties : ${userData.data.dicePlayCount}/${MAX_PLAYS}\n` +
      `├────────────────\n` +
      `│ System par Shade\n` +
      `╰───────────────✦`;

    return api.sendMessage(fonts.christus(caption), threadID, messageID);
  }
};
