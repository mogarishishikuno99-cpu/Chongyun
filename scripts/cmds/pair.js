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
    console.error("Erreur de récupération brute GitHub :", e.message);
    return null;
  }
}

module.exports = {
  config: {
    name: "pair",
    aliases: ["couple", "love", "match"],
    version: "2.1.0",
    author: "Shade",
    role: 0,
    category: "game",
    guide: {
      fr: "{p}{n}"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, messageID, senderID } = event;
    const outputPath = path.join(__dirname, `pair_${Date.now()}.png`);

    try {
      const senderData = await usersData.get(senderID);
      let senderName = senderData.name;

      const threadData = await api.getThreadInfo(threadID);
      const users = threadData.userInfo;
      const myData = users.find(user => user.id === senderID);

      if (!myData || !myData.gender) {
        return api.sendMessage(fonts.christus("⚠️ Impossible de déterminer votre genre. Veuillez réessayer plus tard."), threadID, messageID);
      }

      const myGender = myData.gender.toUpperCase();
      let matchCandidates = [];

      if (myGender === "MALE") {
        matchCandidates = users.filter(user => user.gender === "FEMALE" && user.id !== senderID);
      } else if (myGender === "FEMALE") {
        matchCandidates = users.filter(user => user.gender === "MALE" && user.id !== senderID);
      } else {
        return api.sendMessage(fonts.christus("⚠️ Votre genre n'est pas défini. Impossible de trouver une correspondance."), threadID, messageID);
      }

      if (matchCandidates.length === 0) {
        return api.sendMessage(fonts.christus("❌ Aucun candidat du genre opposé trouvé dans ce groupe."), threadID, messageID);
      }

      const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      let matchName = selectedMatch.name;

      // Stylisation des noms avec le fonts.christus standardisé
      senderName = fonts.christus(senderName);
      matchName = fonts.christus(matchName);

      const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar2 = `https://graph.facebook.com/${selectedMatch.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const apiBase = await getApiBase();
      if (!apiBase) {
        return api.sendMessage(fonts.christus("❌ Échec de la récupération de l'API système."), threadID, messageID);
      }

      const apiUrl = `${apiBase}/api/pair?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}`;

      const imageRes = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(outputPath, Buffer.from(imageRes.data, "binary"));

      const lovePercent = Math.floor(Math.random() * 31) + 70; // Entre 70% et 100%

      const rawText = `💞 MATCHMAKING COMPLETE 💞\n\n🎀 ${senderName} ✨️\n🎀 ${matchName} ✨\n\n🕊️ Destiny has written your names together. May your bond last forever. 🌹\n\n💘 Compatibilité : ${lovePercent}% 💘`;
      const msg = fonts.christus(rawText);

      return api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(outputPath)
      }, threadID, () => {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      }, messageID);

    } catch (error) {
      console.error(error);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      return api.sendMessage(fonts.christus("❌ Une erreur s'est produite lors de la recherche d'une correspondance."), threadID, messageID);
    }
  }
};
