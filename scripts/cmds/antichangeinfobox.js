const { getStreamFromURL, uploadImgbb } = global.utils;
const fonts = require("../func/fonts.js");

module.exports = {  
  config: {    
    name: "antichangeinfobox",    
    aliases: ["anti", "antichange"],    
    version: "4.1.2",    
    author: "Shade × Gemini",    
    countDown: 5,    
    role: 0,    
    description: "Protection et verrouillage complet des données de la box (Owner Only)",    
    category: "security"  },  
  langs: {    
    fr: {      
      noPermission: "Accès refusé. Protocole de sécurité inviolable. Seul le Fondateur Suprême possède ces privilèges.",      
      saved: "Option %1 verrouillée avec succès.",      
      disabled: "Sécurité levée. Option %1 déverrouillée.",      
      missing: "Impossible de trouver la configuration initiale pour cette option.",      
      usage: "Syntaxe : anti [avatar / name / nickname / theme / emoji] [on / off]"    },    
    en: {      
      noPermission: "Access denied. Security protocol violation. Only the Supreme Founder has these privileges.",      
      saved: "Option %1 successfully locked.",      
      disabled: "Security disabled. Option %1 unlocked.",      
      missing: "Unable to find the initial configuration for this option.",      
      usage: "Syntax: anti [avatar / name / nickname / theme / emoji] [on / off]"    }  },  
  onStart: async function ({ message, event, args, threadsData, getLang, api }) {    
    const { threadID, messageID, senderID } = event;    
    const OWNER_ID = "61573867120837";    
    
    if (senderID !== OWNER_ID) {      
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}      
      return message.reply(fonts.christus("⛔ | " + getLang("noPermission")));    }    
    
    const option = args[0]?.toLowerCase();    
    const status = args[1]?.toLowerCase();    
    const validOptions = ["avt", "avatar", "image", "name", "nickname", "theme", "emoji"];    
    
    if (!option || !status || !["on", "off"].includes(status) || !validOptions.includes(option)) {      
      return message.reply(fonts.christus("💡 | " + getLang("usage")));    }    
    
    try {      
      try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch(e){}            
      const threadData = await threadsData.get(threadID) || {};      
      const antiConfig = threadData.data?.antiChangeInfoBox || {};      
      
      const save = async (key, value) => {        
        if (status === "off") {          
          delete antiConfig[key];        } else {          
          antiConfig[key] = value;        }        
        await threadsData.set(threadID, antiConfig, "data.antiChangeInfoBox");      };      
      
      switch (option) {        
        case "avt":        
        case "avatar":        
        case "image": {          
          if (status === "off") {            
            await save("avatar", null);            
            break;          }          
          const { imageSrc } = await threadsData.get(threadID);          
          if (!imageSrc) return message.reply(fonts.christus("⚠️ | " + getLang("missing")));          
          const img = await uploadImgbb(imageSrc);          
          await save("avatar", img.image.url);          
          break;        }        
        case "name": {          
          const { threadName } = await threadsData.get(threadID);          
          await save("name", threadName || "");          
          break;        }        
        case "nickname": {          
          const { members } = await threadsData.get(threadID);          
          const nick = {};          
          for (const m of members) {            
            if (m.userID) nick[m.userID] = m.nickname || "";          }          
          await save("nickname", nick);          
          break;        }        
        case "theme": {          
          const { threadThemeID } = await threadsData.get(threadID);          
          await save("theme", threadThemeID || "");          
          break;        }        
        case "emoji": {          
          const { emoji } = await threadsData.get(threadID);          
          await save("emoji", emoji || "");          
          break;        }      }      
      
      try { api.setMessageReaction("✅", messageID, () => {}, true); } catch(e){}      
      
      const responseText = status === "on" 
        ? "🟩 | " + getLang("saved", option.toUpperCase()) 
        : "🟥 | " + getLang("disabled", option.toUpperCase());
        
      return message.reply(fonts.christus(responseText));    } catch (err) {      
      console.error(err);      
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}      
      return message.reply(fonts.christus("❌ | Une erreur critique est survenue lors de l'enregistrement de la sécurité."));    }  },  
  onEvent: async function ({ message, event, threadsData, api, role }) {    
    const { threadID, logMessageType, logMessageData, author } = event;    
    const botID = api.getCurrentUserID();    
    
    if (role >= 1 || author === botID) return;    
    
    const threadData = await threadsData.get(threadID) || {};    
    const antiConfig = threadData.data?.antiChangeInfoBox || {};    
    
    try {      
      switch (logMessageType) {        
        case "log:thread-image": {          
          if (!antiConfig.avatar) return;          
          message.reply(fonts.christus("🛡️ | Modification non autorisée de l'image détectée. Restauration en cours..."));          
          await api.changeGroupImage(await getStreamFromURL(antiConfig.avatar), threadID);          
          break;        }        
        case "log:thread-name": {          
          if (!antiConfig.name) return;          
          message.reply(fonts.christus("🛡️ | Modification du nom du groupe interceptée. Restauration du canal..."));          
          await api.setTitle(antiConfig.name, threadID);          
          break;        }        
        case "log:user-nickname": {          
          if (!antiConfig.nickname) return;          
          const { participant_id } = logMessageData;          
          const oldNickname = antiConfig.nickname[participant_id] || "";          
          await api.changeNickname(oldNickname, threadID, participant_id);          
          break;        }        
        case "log:thread-color": {          
          if (!antiConfig.theme) return;          
          await api.changeThreadColor(antiConfig.theme, threadID);          
          break;        }        
        case "log:thread-icon": {          
          if (!antiConfig.emoji) return;          
          await api.changeThreadEmoji(antiConfig.emoji, threadID);          
          break;        }      }    } catch (err) {      
      console.error("Erreur Restauration AntiChange :", err);    }  }
};
