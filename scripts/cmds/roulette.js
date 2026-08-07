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

module.exports.config = {
  name: "roulette",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Shade",
  description: "Simple roulette game (wallet only)",
  commandCategory: "economy",
  usages: "{pn} <bet> <red/black/green/number>",
  cooldowns: 5
};

module.exports.onStart = async function ({ api, event, args, usersData }) {
  const uid = event.senderID;
  let userData = await usersData.get(uid);

  if (!userData) userData = {};
  if (!userData.data) userData.data = {};
  if (typeof userData.money !== "number") userData.money = 0;

  const bet = parseInt(args[0]);
  const choice = (args[1] || "").toLowerCase();

  if (!bet || isNaN(bet) || bet <= 0)
    return api.sendMessage(fonts.christus("Bet invalide. Utilisation: roulette <bet> <red/black/green/number>"), event.threadID);
  
  if (userData.money < bet)
    return api.sendMessage(fonts.christus("Tu n'as pas assez d'argent dans ton wallet."), event.threadID);

  const now = Date.now();
  if (!userData.data.roulettePlayCount) userData.data.roulettePlayCount = 0;
  if (!userData.data.rouletteLastTime) userData.data.rouletteLastTime = 0;

  if (userData.data.roulettePlayCount >= MAX_PLAYS) {
    const timeLeft = COOLDOWN_TIME - (now - userData.data.rouletteLastTime);
    if (timeLeft > 0) {
      const minutes = Math.floor(timeLeft / (60 * 1000));
      const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
      return api.sendMessage(
        fonts.christus(`Tu as atteint la limite de ${MAX_PLAYS} parties. Attends encore ${minutes}m ${seconds}s avant de rejouer.`),
        event.threadID
      );
    } else {
      userData.data.roulettePlayCount = 0;
      userData.data.rouletteLastTime = 0;
    }
  }

  userData.data.roulettePlayCount += 1;
  if (userData.data.roulettePlayCount === MAX_PLAYS) {
    userData.data.rouletteLastTime = now;
  }

  const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  const blackNumbers = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
  const result = Math.floor(Math.random() * 37);
  let resultColor = "green";
  
  if (redNumbers.includes(result)) resultColor = "red";
  else if (blackNumbers.includes(result)) resultColor = "black";

  let win = false;
  let reward = 0;

  if (!isNaN(parseInt(choice))) {
    const chosenNumber = parseInt(choice);
    if (chosenNumber === result) {
      win = true;
      reward = bet * 35;
    }
  } else if (choice === "red" || choice === "black" || choice === "green") {
    if (choice === resultColor) {
      win = true;
      reward = bet * (choice === "green" ? 35 : 2);
    }
  } else {
    return api.sendMessage(fonts.christus("Choix invalide. Utilise red / black / green / number"), event.threadID);
  }

  if (win) {
    userData.money += reward;
  } else {
    userData.money -= bet;
  }

  await usersData.set(uid, userData);

  const caption = `╭───────────────✦\n` +
    `│ 🎰 𝗥𝗢𝗨𝗟𝗘𝗧𝗧𝗘 𝗣𝗥𝗢\n` +
    `├────────────────\n` +
    `│ Résultat : ${result} (${resultColor})\n` +
    `│ Ton choix : ${choice}\n` +
    `│ Mise : $${formatMoney(bet)}\n` +
    `├────────────────\n` +
    `│ ${win ? `Gagné : +$${formatMoney(reward)}` : `Perdu : -$${formatMoney(bet)}`}\n` +
    `│ Nouveau solde : $${formatMoney(userData.money)}\n` +
    `│ Parties : ${userData.data.roulettePlayCount}/${MAX_PLAYS}\n` +
    `├────────────────\n` +
    `│ System par Shade\n` +
    `╰───────────────✦`;

  return api.sendMessage(fonts.christus(caption), event.threadID);
};
