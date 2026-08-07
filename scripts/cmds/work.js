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
    name: "work",
    version: "2.1.0",
    author: "Shade",
    countDown: 10,
    role: 0,
    description: "Gagne de l'argent avec des jobs insolites et des événements aléatoires !",
    category: "economy"
  },
  onStart: async function ({ message, event, usersData }) {
    const { senderID } = event;
    
    let user = await usersData.get(senderID);
    if (!user) user = {};
    if (!user.data) user.data = {};
    if (user.money === undefined) user.money = 0;
    if (!user.data.lastWork) {
      user.data.lastWork = 0;
    }

    const now = Date.now();
    const lastClaim = user.data.lastWork;
    const oneDay = 24 * 60 * 60 * 1000;

    if (now - lastClaim < oneDay) {
      const timeLeft = oneDay - (now - lastClaim);
      const hours = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      return message.reply(fonts.christus(`Calme-toi, tu as déjà travaillé aujourd'hui ! Reviens dans ${hours}h et ${minutes}m pour reprendre ton service.`));
    }

    const jobs = [
      { text: "tu as hacké le frigo connecté d'un milliardaire 💻🤖", min: 200, max: 800 },
      { text: "tu as vendu des captures d'écran de tes victoires sur Valorant en NFT 🎨🎮", min: 150, max: 600 },
      { text: "tu as servi de garde du corps à un canard influenceur ultra riche 🦆💰", min: 500, max: 1300 },
      { text: "tu as livré des pizzas en urgence pendant une apocalypse zombie virtuelle 📦🦁", min: 100, max: 450 },
      { text: "tu as streamé pendant 24h en faisant semblant d'être un PNJ de GTA 📺🤡", min: 120, max: 750 },
      { text: "tu as retrouvé les clés de la clé USB Crypto perdue d'un pote 💎🔑", min: 300, max: 1600 },
      { text: "tu as été payé pour tester des lits de luxe toute la journée 🛌✨", min: 250, max: 900 },
      { text: "tu as vendu l'eau de ton bain à des fans chelous sur internet 🧼💦", min: 400, max: 1100 }
    ];

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    let reward = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

    let eventText = "Travail standard accompli avec succès. 👍";
    const randEvent = Math.random();
    if (randEvent < 0.10) {
      reward *= 2;
      eventText = "RÉUSSITE CRITIQUE ! Ton patron t'adore, tu as reçu une prime de 100% ! 🚀";
    } else if (randEvent < 0.20) {
      reward = Math.floor(reward * 0.15);
      eventText = "ÉCHEC CUISANT... Tu as fait une gaffe monumentale, tu as été payé des miettes ! 😭";
    } else if (randEvent < 0.30) {
      const tip = 150;
      reward += tip;
      eventText = `Pourboire ! Un client généreux t'a laissé +$${formatMoney(tip)} en cachette ! 👀`;
    }

    user.money += reward;
    user.data.lastWork = now;

    await usersData.set(senderID, {
      ...user,
      money: user.money,
      data: user.data
    });

    const caption = `╭───────────────✦\n` +
      `│ 💼 𝗪𝗢𝗥𝗞 𝗥𝗘𝗦𝗨𝗟𝗧 💼\n` +
      `├────────────────\n` +
      `│ ✨ En faisant ton job :\n` +
      `│ ${job.text}\n\n` +
      `│ 📢 Événement : ${eventText}\n` +
      `│ 💰 Salaire reçu : +$${formatMoney(reward)}\n` +
      `├────────────────\n` +
      `│ 🏦 Portefeuille : $${formatMoney(user.money)}\n` +
      `╰───────────────✦`;

    return message.reply(fonts.christus(caption));
  }
};
