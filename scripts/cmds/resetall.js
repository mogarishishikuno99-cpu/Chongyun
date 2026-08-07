const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "resetall",
    version: "1.2",
    author: "Shade",
    countDown: 10,
    role: 4,
    shortDescription: {
      en: "Reset money and experience for all users",
      fr: "Remettre à zéro l'argent et l'expérience de tous les utilisateurs"
    },
    category: "admin",
    guide: {
      en: "{pn} confirm",
      fr: "{pn} confirm"
    }
  },
  
  onStart: async function ({ message, event, args, usersData }) {
    const allowedUID = "61573867120837";

    if (event.senderID !== allowedUID) {
      return message.reply(fonts.christus("❌ Access denied. You do not have permission to use this command."));
    }

    const senderName = (typeof usersData.getName === "function" ? await usersData.getName(event.senderID) : null) || event.name || "Admin";

    if (args[0]?.toLowerCase() !== "confirm") {
      const warningMsg = `⚠️ ${fonts.developed("WARNING")} ⚠️` +
        `\n\n${fonts.christus("This action will reset all money and experience to 0 for every user in the database.")}` +
        `\n\n${fonts.christus("Type:")} +resetall confirm`;
      return message.reply(fonts.christus(warningMsg));
    }

    // Message envoyé immédiatement pour indiquer que l'opération commence
    const startMsg = await message.reply(fonts.christus(`⏳ ${fonts.developed("Operation in progress...")}\n\n${fonts.christus("Resetting database, please wait.")}`));

    try {
      let allUsers = [];
      if (global.db && typeof global.db.allUserData === "object" && Array.isArray(global.db.allUserData)) {
        allUsers = global.db.allUserData;
      } else if (typeof usersData.getAll === "function") {
        allUsers = await usersData.getAll();
      }

      let count = 0;
      for (const user of allUsers) {
        const uid = user.userID || user.id;
        if (uid) {
          if (typeof usersData.set === "function") {
            await usersData.set(uid, { money: 0, exp: 0 });
          }
          count++;
        }
      }

      const successMsg = `🔄 ${fonts.developed("Database Reset Successful")}` +
        `\n\n👤 ${senderName}` +
        `\n\n✅ ${fonts.christus(`Money and experience have been reset to 0 for ${count} users.`)}`;
      
      // Modification du message initial pour afficher le résultat final
      return message.edit(fonts.christus(successMsg), startMsg.messageID);
    } catch (e) {
      console.error(e);
      return message.edit(fonts.christus("❌ An error occurred while resetting user data."), startMsg.messageID);
    }
  }
};
