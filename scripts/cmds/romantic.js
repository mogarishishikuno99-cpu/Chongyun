const fonts = require("../func/fonts.js");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function getApiBase() {
  try {
    const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
    const res = await axios.get(GITHUB_RAW);
    return res.data.apiv1;
  } catch (e) {
    console.error("Erreur de récupération GitHub raw :", e.message);
    return null;
  }
}

module.exports = {
  config: {
    name: "romantic",
    aliases: ["lovepair", "matchromantic"],
    author: "Shade",
    version: "2.1",
    role: 0,
    category: "game",
    shortDescription: {
      en: "💘 Génère un match romantique entre toi et un autre membre du groupe"
    },
    longDescription: {
      en: "Cette commande calcule un lien romantique basé sur le genre. Affiche les avatars, le fond personnalisé et le pourcentage d'amour."
    },
    guide: {
      en: "{p}{n} — Utilise cette commande dans un groupe pour trouver ton âme sœur"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    const outputPath = path.join(__dirname, `romantic_${Date.now()}.png`);

    try {
      const senderData = await usersData.get(event.senderID);
      let senderName = senderData.name;

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;
      const myData = users.find(user => user.id === event.senderID);

      if (!myData || !myData.gender) {
        return api.sendMessage(fonts.christus("⚠️ Impossible de déterminer ton genre. Réessaie plus tard."), event.threadID, event.messageID);
      }

      const myGender = myData.gender.toUpperCase();
      let matchCandidates = [];

      if (myGender === "MALE") {
        matchCandidates = users.filter(user => user.gender === "FEMALE" && user.id !== event.senderID);
      } else if (myGender === "FEMALE") {
        matchCandidates = users.filter(user => user.gender === "MALE" && user.id !== event.senderID);
      } else {
        return api.sendMessage(fonts.christus("⚠️ Ton genre est indéfini. Impossible de trouver un match romantique."), event.threadID, event.messageID);
      }

      if (matchCandidates.length === 0) {
        return api.sendMessage(fonts.christus("❌ Aucun match compatible trouvé dans ce groupe."), event.threadID, event.messageID);
      }

      const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      let matchName = selectedMatch.name;

      // Stylisation des noms avec fonts.christus
      senderName = fonts.christus(senderName);
      matchName = fonts.christus(matchName);

      const avatar1 = `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar2 = `https://graph.facebook.com/${selectedMatch.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const apiBase = await getApiBase();
      if (!apiBase) {
        return api.sendMessage(fonts.christus("❌ Impossible d’accéder à l’API. Réessaie plus tard."), event.threadID, event.messageID);
      }

      const apiUrl = `${apiBase}/api/pair4?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}`;

      const imageRes = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(outputPath, Buffer.from(imageRes.data, "binary"));

      const lovePercent = Math.floor(Math.random() * 31) + 70;

      // Message adapté au thème "romantic"
      const rawText = `🌹 𝗥𝗢𝗠𝗔𝗡𝗧𝗜𝗖 𝗠𝗔𝗧𝗖𝗛 🌹\n\n🎀 ${senderName} ✨️\n🎀 ${matchName} ✨️\n\n🕊️ Une histoire d'amour écrite dans les étoiles. Que ce lien dure éternellement 💫\n\n💘 Compatibilité romantique : ${lovePercent}% 💘`;
      const message = fonts.christus(rawText);

      return api.sendMessage(
        { body: message, attachment: fs.createReadStream(outputPath) },
        event.threadID,
        () => {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        },
        event.messageID
      );

    } catch (error) {
      console.error(error);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      return api.sendMessage(fonts.christus("❌ Une erreur s’est produite lors de la recherche d’un match. Réessaie plus tard."), event.threadID, event.messageID);
    }
  }
};
