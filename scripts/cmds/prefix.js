const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "prefix",
    version: "1.2.0",
    author: "Shade × Gemini",
    countDown: 3,
    role: 0,
    shortDescription: { fr: "Affiche le préfixe du bot" },
    category: "settings",
    guide: { fr: "prefix" }
  },
  onStart: async function ({ api, event, usersData }) {
    const { threadID, messageID, senderID } = event;
    const currentPrefix = global.GoatBot?.config?.prefix || ".";
    const botName = global.GoatBot?.config?.nickNameBot || global.GoatBot?.config?.name || "GoatBot";
    
    let userName = "Utilisateur";
    try {
      userName = await usersData.getName(senderID) || "Utilisateur";
    } catch (e) {}
    
    const rawText = 
      `👋 Hey ${userName}, did you ask for my prefix?\n` +
      `╭‣ 🌐 Global: ${currentPrefix}\n` +
      `╰‣ 💬 This Chat: ${currentPrefix}\n` +
      `🤖 I'm ${botName}\n` +
      `📂 try "${currentPrefix}help" to see all commands.`;
    
    const formattedText = fonts.christus(rawText);
    
    return api.sendMessage(
      {
        body: formattedText,
        mentions: [{
          tag: userName,
          id: senderID
        }]
      },
      threadID,
      messageID
    );
  }
};
