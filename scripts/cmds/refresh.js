const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "refresh",
    version: "1.6",
    author: "NTKhang",
    countDown: 60,
    role: 2,
    description: {
      vi: "làm mới thông tin nhóm chat hoặc người dùng",
      en: "refresh information of group chat or user"
    },
    category: "owner",
    guide: {
      vi: "   {pn} [thread | group]: làm mới thông tin nhóm chat của bạn"
        + "\n   {pn} group <threadID>: làm mới thông tin nhóm chat theo ID"
        + "\n\n   {pn} user: làm mới thông tin người dùng của bạn"
        + "\n   {pn} user [<userID> | @tag]: làm mới thông tin người dùng theo ID",
      en: "   {pn} [thread | group]: refresh information of your group chat"
        + "\n   {pn} group <threadID>: refresh information of group chat by ID"
        + "\n\n   {pn} user: refresh information of your user"
        + "\n   {pn} user [<userID> | @tag]: refresh information of user by ID"
    }
  },

  onStart: async function ({ args, threadsData, message, event, usersData, getLang }) {
    // Fonction de repli sécurisée pour getLang si appelé depuis noprefix.js
    const getText = (key, ...val) => {
      try {
        const res = typeof getLang === "function" ? getLang(key, ...val) : key;
        // Si getLang renvoie juste la clé (car noprefix l'a simplifié), on met des textes par défaut en anglais
        if (!res || res === key) {
          const fallbacks = {
            refreshMyThreadSuccess: "✅ | Refresh information of your group chat successfully!",
            refreshThreadTargetSuccess: `✅ | Refresh information of group chat ${val[0]} successfully!`,
            errorRefreshMyThread: "❌ | Error when refresh information of your group chat",
            errorRefreshThreadTarget: `❌ | Error when refresh information of group chat ${val[0]}`,
            refreshMyUserSuccess: "✅ | Refresh information of your user successfully!",
            refreshUserTargetSuccess: `✅ | Refresh information of user ${val[0]} successfully!`,
            errorRefreshMyUser: "❌ | Error when refresh information of your user",
            errorRefreshUserTarget: `❌ | Error when refresh information of user ${val[0]}`
          };
          return fallbacks[key] || key;
        }
        return res;
      } catch {
        return key;
      }
    };

    if (args[0] == "group" || args[0] == "thread") {
      const targetID = args[1] || event.threadID;
      try {
        await threadsData.refreshInfo(targetID);
        const msg = targetID == event.threadID ? getText("refreshMyThreadSuccess") : getText("refreshThreadTargetSuccess", targetID);
        return message.reply(fonts.christus(msg));
      }
      catch (error) {
        const errMsg = targetID == event.threadID ? getText("errorRefreshMyThread") : getText("errorRefreshThreadTarget", targetID);
        return message.reply(fonts.christus(errMsg));
      }
    }
    else if (args[0] == "user") {
      let targetID = event.senderID;
      if (args[1]) {
        if (Object.keys(event.mentions).length)
          targetID = Object.keys(event.mentions)[0];
        else
          targetID = args[1];
      }
      try {
        await usersData.refreshInfo(targetID);
        const msg = targetID == event.senderID ? getText("refreshMyUserSuccess") : getText("refreshUserTargetSuccess", targetID);
        return message.reply(fonts.christus(msg));
      }
      catch (error) {
        const errMsg = targetID == event.senderID ? getText("errorRefreshMyUser") : getText("errorRefreshUserTarget", targetID);
        return message.reply(fonts.christus(errMsg));
      }
    }
    else {
      return message.SyntaxError();
    }
  }
};
