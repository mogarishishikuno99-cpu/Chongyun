const fonts = require("../func/fonts.js");

function formatMoney(amount) {
  if (amount >= 1e12) return (amount / 1e12).toFixed(2) + "T";
  if (amount >= 1e9) return (amount / 1e9).toFixed(2) + "B";
  if (amount >= 1e6) return (amount / 1e6).toFixed(2) + "M";
  if (amount >= 1e3) return (amount / 1e3).toFixed(2) + "K";
  return amount.toString();
}

module.exports = {
  config: {
    name: "interest",
    version: "2.1.1",
    author: "Shade",
    countDown: 10,
    role: 0,
    description: "💎 Collect or view bank interest with dynamic market changes",
    category: "economy"
  },
  onStart: async function ({ message, event, usersData }) {
    const { senderID } = event;
    let user = await usersData.get(senderID);
    if (!user) user = {};
    if (!user.data) user.data = {};
    if (user.money === undefined) user.money = 0;

    if (!user.data.bank) {
      return message.reply(fonts.christus("❌ Tu n'as pas encore de compte bancaire enregistré. Utilise d'abord les fonctions de la banque centrale !"));
    }
    if (!user.data.bank.lastInterest) {
      user.data.bank.lastInterest = 0;
    }

    const now = Date.now();
    const lastClaim = user.data.bank.lastInterest;
    const oneDay = 24 * 60 * 60 * 1000;

    if (now - lastClaim < oneDay) {
      const timeLeft = oneDay - (now - lastClaim);
      const hours = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      return message.reply(fonts.christus(`⏳ Calme-toi, l'argent ne pousse pas si vite ! Reviens dans ${hours}h et ${minutes}m pour le prochain relevé. 💎`));
    }

    const balance = user.data.bank.balance || 0;
    if (balance <= 0) {
      return message.reply(fonts.christus("🏦 Ta crypto-valise et ton compte en banque sont à sec ! Dépose un peu d'argent pour générer des intérêts passifs."));
    }

    const marketShift = (Math.random() * 4 - 1.5) / 100;
    const currentRate = Math.max(0.01, 0.03 + marketShift);
    let interest = Math.floor(balance * currentRate);

    let eventText = "Rien à signaler, l'économie mondiale est stable. 📉";
    const randEvent = Math.random();
    if (randEvent < 0.12) {
      const bonusCrypto = Math.floor(interest * 0.3);
      interest += bonusCrypto;
      eventText = `🔥 Le Directeur régale ! La banque a fait des profits records sur le Bitcoin, tu prends un bonus de +$${formatMoney(bonusCrypto)} !`;
    } else if (randEvent < 0.22) {
      const tax = 25;
      interest = Math.max(0, interest - tax);
      eventText = `💣 Frais de dossier ! La banque te retient -$${formatMoney(tax)} pour l'abonnement mensuel aux capsules de café du personnel...`;
    } else if (balance > 100000 && randEvent < 0.40) {
      const vipBonus = 500;
      interest += vipBonus;
      eventText = `👑 Avantage Fortune VIP ! Grâce à tes gros dépôts, le courtier t'accorde une prime d'investisseur d'élite de +$${formatMoney(vipBonus)} !`;
    }

    user.data.bank.balance += interest;
    user.data.bank.lastInterest = now;

    await usersData.set(senderID, {
      money: user.money,
      exp: user.exp || 0,
      data: user.data
    });

    const caption = `╭───────────────✦\n` +
      `│ 💎 𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗖𝗢𝗟𝗟𝗘𝗖𝗧𝗘𝗗 💎\n` +
      `├────────────────\n` +
      `│ 🏛️ Capital placé : $${formatMoney(balance)}\n` +
      `│ 📈 Taux du jour : ${(currentRate * 100).toFixed(2)}%\n` +
      `│ 💰 Gain d'intérêt : +$${formatMoney(interest)}\n` +
      `├────────────────\n` +
      `│ 📢 Marché : ${eventText}\n\n` +
      `│ 🏦 Nouveau solde en banque : $${formatMoney(user.data.bank.balance)}\n` +
      `╰───────────────✦`;

    return message.reply(fonts.christus(caption));
  }
};
