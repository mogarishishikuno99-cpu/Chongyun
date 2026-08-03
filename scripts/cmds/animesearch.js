const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "animesearch",
    aliases: ["anisar", "anisearch", "animeedit"],
    version: "1.1",
    author: "Saimx69x × Shade",
    description: "Search an anime edits video (Format Texte/Message avec Fonts)",
    category: "anime",
    role: 0,
    usage: "animesearch sakura haruka",
  },
  onStart: async function({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      const errQuery = fonts.christus("🔍 | Please provide an anime name!");
      return api.sendMessage(errQuery, event.threadID, event.messageID);
    }

    try {
      api.setMessageReaction("⌛️", event.messageID, () => {}, true);
    } catch(e) {}

    try {
      const githubRawUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const apiRes = await axios.get(githubRawUrl);
      const baseUrl = apiRes.data.apiv1;
      const res = await axios.get(`${baseUrl}/api/animesearch?query=${encodeURIComponent(query)}`);

      if (!res.data?.status || !res.data.random?.noWatermark) {
        try { api.setMessageReaction("❌️", event.messageID, () => {}, true); } catch(e) {}
        const notFoundMsg = fonts.christus(`❌ | No results found for "${query}"`);
        return api.sendMessage(notFoundMsg, event.threadID, event.messageID);
      }

      const videoUrl = res.data.random.noWatermark;
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, `${Date.now()}.mp4`);
      const writer = fs.createWriteStream(filePath);
      const response = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream",
      });

      response.data.pipe(writer);

      writer.on("finish", async () => {
        try { api.setMessageReaction("✅️", event.messageID, () => {}, true); } catch(e) {}
        const successMsg = fonts.christus(`🎥 | Here's a random anime video for "${query}"`);
        await api.sendMessage({
          body: successMsg,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, event.messageID);
      });

      writer.on("error", err => {
        console.error(err);
        try { api.setMessageReaction("❌️", event.messageID, () => {}, true); } catch(e) {}
        const errSend = fonts.christus("❌ | Failed to send video!");
        api.sendMessage(errSend, event.threadID, event.messageID);
      });

    } catch (err) {
      console.error("❌ animesearch error:", err.message);
      try { api.setMessageReaction("❌️", event.messageID, () => {}, true); } catch(e) {}
      const errCrit = fonts.christus("⚠️ | Something went wrong, please try again later.");
      api.sendMessage(errCrit, event.threadID, event.messageID);
    }
  }
};
