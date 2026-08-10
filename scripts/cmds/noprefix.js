const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "noprefix",
    aliases: ["nopref"],
    version: "2.3",
    author: "Shade",
    countDown: 0,
    role: 4,
    description: "Active or disables the no-prefix mode for role 4 users.",
    category: "system",
    guide: "{p}noprefix [on/off]"
  },
  onStart: async function ({ api, event, args, usersData, role }) {
    const { senderID, threadID, messageID } = event;
    
    if (role < 4) {
      return api.sendMessage(fonts.christus("⚠ | You do not have permission to use this command."), threadID, messageID);
    }
    
    const state = args[0]?.toLowerCase();
    if (state === "on") {
      await usersData.set(senderID, true, "data.noPrefixMode");
      return api.sendMessage(fonts.christus("⚠ | No prefix mode enabled for you only!"), threadID, messageID);
    } 
    else if (state === "off") {
      await usersData.set(senderID, false, "data.noPrefixMode");
      return api.sendMessage(fonts.christus("⚠ | No prefix mode disabled."), threadID, messageID);
    } 
    else {
      const currentMode = await usersData.get(senderID, "data.noPrefixMode", false);
      return api.sendMessage(fonts.christus(`⚠ | No prefix mode: ${currentMode ? "ENABLED" : "DISABLED"}\nUsage: noprefix on | noprefix off`), threadID, messageID);
    }
  },
  onChat: async function ({ api, event, usersData, threadsData, message, role }) {
    const { senderID, body } = event;
    
    if (!body || role < 4) return;
    
    const isNoPrefixActive = await usersData.get(senderID, "data.noPrefixMode", false);
    if (!isNoPrefixActive) return;
    
    const prefix = global.GoatBot.config.prefix || "/";
    if (body.startsWith(prefix)) return;
    
    const splitArgs = body.trim().split(/\s+/);
    const commandName = splitArgs[0].toLowerCase();
    const args = splitArgs.slice(1);
    
    const command = global.GoatBot.commands.get(commandName) ||                     
                    global.GoatBot.commands.get(global.GoatBot.aliases.get(commandName));
    
    if (command && command.onStart) {
      try {
        await command.onStart({
          api,
          event,
          args,
          usersData,
          threadsData,
          message,
          role,
          commandName,
          getLang: (...args) => global.GoatBot.getText(command.config.name, ...args)
        });
      } catch (error) {
        console.error(`Erreur d'exécution sans préfixe (${commandName}):`, error);
      }
    }
  }
};
