const fonts = require("../func/fonts.js");

module.exports = {  
  config: {    
    name: "badwords",    
    aliases: ["badword", "filter"],    
    version: "7.1.0",    
    author: "Shade × Gemini",    
    countDown: 5,    
    role: 2,    
    description: "Système de sécurité contre les termes interdits et la modération automatique",    
    category: "security"  },  
  langs: {    
    en: {      
      noPermission: "Access denied. Only the main administrator can configure this module.",      
      added: "Term added to the filter list: \"%1\"",      
      deleted: "Term removed from the filter list: \"%1\"",      
      listEmpty: "No forbidden words are currently registered for this group.",      
      list: "FILTER LIST\n\n%1",      
      on: "Security system [BadWords] successfully enabled.",      
      off: "Security system [BadWords] disabled.",      
      warn1: "Security Warning.\n• Member : %1\n• Reason : Restricted term detected (\"%2\").\n• Status : Next infraction will result in a kick.",      
      kicked: "User %1 has been kicked from the group for recidivism.",      
      emojiSpam: "Moderation Alert : Emoji spam detected (%1x identical). Please stabilize the chat flow.",      
      needAdmin: "Action impossible. The bot requires administrator privileges to execute the kick.",
      noWordAdd: "Please specify the term to forbid / Veuillez spécifier le terme à interdire.",
      noWordDel: "Please specify the term to remove / Veuillez spécifier le terme à retirer.",
      notInList: "This word is not in the list.",
      usageOpts: "Options : `add [word]`, `del [word]`, `list`, `on`, `off`."
    },    
    fr: {      
      noPermission: "Accès refusé. Seul l'administrateur principal peut configurer ce module.",      
      added: "Terme ajouté à la liste de filtrage : \"%1\"",      
      deleted: "Terme supprimé de la liste de filtrage : \"%1\"",      
      listEmpty: "Aucun mot interdit n'est actuellement enregistré pour ce groupe.",      
      list: "LISTE DE FILTRAGE\n\n%1",      
      on: "Système de sécurité [BadWords] activé avec succès.",      
      off: "Système de sécurité [BadWords] désactivé.",      
      warn1: "Avertissement de sécurité.\n• Membre : %1\n• Motif : Terme restreint détecté (\"%2\").\n• Statut : Prochaine infraction entraînera une exclusion.",      
      kicked: "L'utilisateur %1 a été exclu du groupe pour récidive.",      
      emojiSpam: "Alerte de modération : Spam d'émojis détecté (%1x identiques). Veuillez stabiliser le flux de discussion.",      
      needAdmin: "Action impossible. Le bot nécessite des privilèges d'administrateur pour exécuter l'exclusion.",
      noWordAdd: "Veuillez spécifier le terme à interdire.",
      noWordDel: "Veuillez spécifier le terme à retirer.",
      notInList: "Ce mot ne figure pas dans la liste.",
      usageOpts: "Options : `add [word]`, `del [word]`, `list`, `on`, `off`."
    }  },  
  onStart: async function ({ message, event, args, threadsData, getLang }) {    
    const OWNER_ID = "61573867120837";        
    if (event.senderID !== OWNER_ID) {      
      return message.reply(fonts.christus("❌ | " + getLang("noPermission")));    }    
    
    let data = await threadsData.get(event.threadID, "data.badWords") || {};    
    if (!data.words) data.words = [];    
    if (!data.warns) data.warns = {};    
    
    const action = args[0]?.toLowerCase();    
    switch (action) {      
      case "add": {        
        const word = args.slice(1).join(" ").toLowerCase().trim();        
        if (!word) return message.reply(fonts.christus("❌ | " + getLang("noWordAdd")));                
        if (!data.words.includes(word)) {          
          data.words.push(word);        }                
        await threadsData.set(event.threadID, data, "data.badWords");        
        return message.reply(fonts.christus("✅ | " + getLang("added", word)));      }      
      case "del":      
      case "delete": {        
        const word = args.slice(1).join(" ").toLowerCase().trim();        
        if (!word) return message.reply(fonts.christus("❌ | " + getLang("noWordDel")));                
        if (!data.words.includes(word)) {          
          return message.reply(fonts.christus("❌ | " + getLang("notInList")));        }        
        data.words = data.words.filter(w => w !== word);        
        await threadsData.set(event.threadID, data, "data.badWords");        
        return message.reply(fonts.christus("✅ | " + getLang("deleted", word)));      }      
      case "list": {        
        if (!data.words.length) return message.reply(fonts.christus("📦 | " + getLang("listEmpty")));        
        const title = fonts.bold(getLang("list", "")) + "\n\n";
        const contentList = data.words.map(w => `• ${w}`).join("\n");
        return message.reply(fonts.christus(title + contentList));      }      
      case "on": {        
        await threadsData.set(event.threadID, true, "settings.badWords");        
        return message.reply(fonts.christus("✅ | " + getLang("on")));      }      
      case "off": {        
        await threadsData.set(event.threadID, false, "settings.badWords");        
        return message.reply(fonts.christus("❌ | " + getLang("off")));      }      
      default:        
        return message.reply(fonts.christus("💡 | " + getLang("usageOpts")));    }  },  
  onChat: async function ({ event, message, api, threadsData, getLang }) {    
    if (!event.body || event.senderID === api.getCurrentUserID()) return;    
    const enabled = await threadsData.get(event.threadID, "settings.badWords");    
    if (!enabled) return;    
    
    const data = await threadsData.get(event.threadID, "data.badWords") || {};    
    const words = data.words || [];    
    const warns = data.warns || {};    
    const body = event.body.toLowerCase();    
    
    for (const word of words) {      
      if (body.includes(word)) {        
        if (!warns[event.senderID]) {          
          warns[event.senderID] = 1;          
          data.warns = warns;                    
          await threadsData.set(event.threadID, data, "data.badWords");          
          return message.reply(fonts.christus("⚠️ | " + getLang("warn1", `@${event.senderID}`, word)));        } else {          
          try {            
            await api.removeUserFromGroup(event.senderID, event.threadID);                        
            delete warns[event.senderID];            
            data.warns = warns;            
            await threadsData.set(event.threadID, data, "data.badWords");            
            return message.reply(fonts.christus("✅ | " + getLang("kicked", `@${event.senderID}`)));          } catch (err) {            
            return message.reply(fonts.christus("⚠️ | " + getLang("needAdmin")));          }        }      }    }    
    
    const emojiRegex = /([\p{Emoji_Presentation}\p{Extended_Pictographic}])/gu;    
    const emojis = body.match(emojiRegex);        
    if (emojis && emojis.length >= 10) {      
      const firstEmoji = emojis[0];      
      const isSameSpam = emojis.every(e => e === firstEmoji);            
      if (isSameSpam) {        
        return message.reply(fonts.christus("🚫 | " + getLang("emojiSpam", emojis.length)));      }    }  }
};
