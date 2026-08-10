const path = require("path");
const fs = require("fs-extra");
const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "wl",
    version: "2.1",
    author: "Shade",
    countDown: 5,
    role: 2,
    description: "Add, remove, or list whiteListIds",
    category: "ADMIN",
    guide: {
      en: "{p}{n} list (-l)\n{p}{n} add (-a) [@tag / reply / uid]\n{p}{n} remove (-r) [uid / @tag / reply]\n{p}{n} on\n{p}{n} off"
    }
  },
  
  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, type, messageReply, mentions } = event;
    const subAction = args[0]?.toLowerCase();

    // Dictionnaire local pour contourner le bug du noprefix
    const localLangs = {
      added: "✅ | Added whiteList role for %1 users:\n%2",
      alreadyAdmin: "⚠ | %1 users already have whiteList role:\n%2",
      missingIdAdd: "⚠ | Please enter ID or tag user to add in whiteListIds",
      removed: "✅ | Removed whiteList role of %1 users:\n%2",
      notAdmin: "⚠ | %1 users don't have whiteListIds role:\n%2",
      missingIdRemove: "⚠ | Please enter ID or tag user to remove whiteListIds",
      listAdmin: "👑 | List of whiteListIds:\n%1",
      enable: "✅ | Turned on",
      disable: "✅ | Turned off"
    };

    // Fonction de remplacement locale
    const getText = (key, ...replacements) => {
      let text = localLangs[key] || key;
      replacements.forEach((rep, index) => {
        text = text.replace(`%${index + 1}`, rep);
      });
      return text;
    };

    let action = subAction;
    if (subAction === "l" || subAction === "-l") action = "list";
    if (subAction === "a" || subAction === "-a") action = "add";
    if (subAction === "r" || subAction === "-r") action = "remove";

    const configPath = path.join(process.cwd(), "config.json");
    let botConfig = {};
    if (fs.existsSync(configPath)) {
      botConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    if (!botConfig.whiteListMode) {
      botConfig.whiteListMode = { enable: false, whiteListIds: [] };
    }
    if (!botConfig.whiteListMode.whiteListIds) {
      botConfig.whiteListMode.whiteListIds = [];
    }

    // --- CASE : ON ---
    if (action === "on") {
      botConfig.whiteListMode.enable = true;
      fs.writeFileSync(configPath, JSON.stringify(botConfig, null, 2), "utf-8");
      return api.sendMessage(fonts.christus(getText("enable")), threadID, messageID);
    }

    // --- CASE : OFF ---
    if (action === "off") {
      botConfig.whiteListMode.enable = false;
      fs.writeFileSync(configPath, JSON.stringify(botConfig, null, 2), "utf-8");
      return api.sendMessage(fonts.christus(getText("disable")), threadID, messageID);
    }

    // --- CASE : LIST ---
    if (action === "list") {
      const ids = botConfig.whiteListMode.whiteListIds;
      if (ids.length === 0) {
        return api.sendMessage(fonts.christus("⚠ | No whitelist IDs recorded yet."), threadID, messageID);
      }
      const getNames = await Promise.all(ids.map(async uid => {
        const name = await usersData.getName(uid) || "Unknown User";
        return { uid, name: name.replace(/@/g, "") };
      }));
      const listText = getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n");
      return api.sendMessage(fonts.christus(getText("listAdmin", listText)), threadID, messageID);
    }

    // --- CASE : ADD ---
    if (action === "add") {
      let uids = [];
      if (mentions && Object.keys(mentions).length > 0) {
        uids = Object.keys(mentions);
      } else if (type === "message_reply" && messageReply) {
        uids.push(messageReply.senderID);
      } else {
        uids = args.slice(1).filter(arg => !isNaN(arg));
      }

      if (uids.length === 0) {
        return api.sendMessage(fonts.christus(getText("missingIdAdd")), threadID, messageID);
      }

      const notAdminIds = [];
      const adminIds = [];
      for (const uid of uids) {
        if (botConfig.whiteListMode.whiteListIds.includes(uid)) {
          adminIds.push(uid);
        } else {
          notAdminIds.push(uid);
        }
      }

      botConfig.whiteListMode.whiteListIds.push(...notAdminIds);
      fs.writeFileSync(configPath, JSON.stringify(botConfig, null, 2), "utf-8");

      const getNames = await Promise.all(notAdminIds.map(async uid => {
        const name = await usersData.getName(uid) || "User";
        return { uid, name: name.replace(/@/g, "") };
      }));

      let text = "";
      if (notAdminIds.length > 0) {
        text += getText("added", notAdminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n"));
      }
      if (adminIds.length > 0) {
        text += (text ? "\n" : "") + getText("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n"));
      }
      return api.sendMessage(fonts.christus(text), threadID, messageID);
    }

    // --- CASE : REMOVE ---
    if (action === "remove") {
      let uids = [];
      if (mentions && Object.keys(mentions).length > 0) {
        uids = Object.keys(mentions);
      } else if (type === "message_reply" && messageReply) {
        uids.push(messageReply.senderID);
      } else {
        uids = args.slice(1).filter(arg => !isNaN(arg));
      }

      if (uids.length === 0) {
        return api.sendMessage(fonts.christus(getText("missingIdRemove")), threadID, messageID);
      }

      const notAdminIds = [];
      const adminIds = [];
      for (const uid of uids) {
        if (botConfig.whiteListMode.whiteListIds.includes(uid)) {
          adminIds.push(uid);
        } else {
          notAdminIds.push(uid);
        }
      }

      for (const uid of adminIds) {
        const index = botConfig.whiteListMode.whiteListIds.indexOf(uid);
        if (index > -1) botConfig.whiteListMode.whiteListIds.splice(index, 1);
      }
      fs.writeFileSync(configPath, JSON.stringify(botConfig, null, 2), "utf-8");

      const getNames = await Promise.all(adminIds.map(async uid => {
        const name = await usersData.getName(uid) || "User";
        return { uid, name: name.replace(/@/g, "") };
      }));

      let text = "";
      if (adminIds.length > 0) {
        text += getText("removed", adminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n"));
      }
      if (notAdminIds.length > 0) {
        text += (text ? "\n" : "") + getText("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n"));
      }
      return api.sendMessage(fonts.christus(text), threadID, messageID);
    }

    // Default syntax error
    return api.sendMessage(fonts.christus("⚠ | Invalid syntax. Use: wl list, add, remove, on, or off"), threadID, messageID);
  }
};
