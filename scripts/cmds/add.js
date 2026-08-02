const sleep = ms => new Promise(r => setTimeout(r, ms));
const fonts = require("../func/fonts.js");

function extractUIDLocal(input) {  
  if (!input) return null;  
  const cleanInput = input.trim();  
  if (/^\d+$/.test(cleanInput)) return cleanInput;  
  const idMatch = cleanInput.match(/[?&]id=(\d+)/);  
  if (idMatch) return idMatch[1];  
  const slashMatch = cleanInput.match(/\/(\d+)(?:\/|\?|$)/);  
  if (slashMatch) return slashMatch[1];  
  return null;
}

module.exports = {  
  config: {    
    name: "add",    
    aliases: ["ajoute", "addmember"],    
    version: "3.2.2",    
    author: "Shade",    
    role: 1,    
    description: "Ajouter des membres via UID ou Lien",    
    category: "system"  },  
  langs: {    
    fr: {      
      notAllowed: "Acces refuse. Seuls les administrateurs du groupe et le Fondateur peuvent utiliser cette commande.",      
      usage: "Syntaxe requise : add [UID ou Lien du profil]",      
      processing: "Connexion a la passerelle Facebook... Tentative d'ajout des utilisateurs.",      
      resultTitle: "RAPPORT D'AJOUT",
      successText: "Membres ajoutes : %1",
      failedText: "Echecs / Rejets : %2"
    },    
    en: {      
      notAllowed: "Access denied. Only group admins and the Founder can use this command.",      
      usage: "Syntax: add [UID or Profile Link]",      
      processing: "Connecting to Facebook gateway...",      
      resultTitle: "ADD REPORT",
      successText: "Members added: %1",
      failedText: "Failed/Rejected: %2"
    }  },  
  onStart: async function ({ message, api, event, args, threadsData, getLang }) {    
    const { threadID, messageID, senderID } = event;    
    const OWNER_ID = "61573867120837";    
    try {      
      const threadInfo = await threadsData.get(threadID) || {};      
      const adminIDs = (threadInfo.adminIDs || []).map(admin => admin.id || admin);      
      
      const isOwner = senderID === OWNER_ID;      
      const isAdmin = adminIDs.includes(senderID);      
      if (!isOwner && !isAdmin) {        
        return message.reply(fonts.christus("❌ | " + getLang("notAllowed")));      
      }      
      if (args.length === 0) {        
        return message.reply(fonts.christus("❌ | " + getLang("usage")));      
      }      
      try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch(e){}      
      await message.reply(fonts.christus(getLang("processing")));      
      
      const members = threadInfo.members || [];      
      let successCount = 0;      
      let failedCount = 0;      
      
      for (const item of args) {        
        let uid = extractUIDLocal(item);        
        if (!uid && global.utils?.findUid && /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb)\.com\/.*/i.test(item)) {          
          try {            
            uid = await global.utils.findUid(item);          
          } catch (err) {            
            uid = null;          
          }        
        }        
        if (!uid) {          
          failedCount++;          
          continue;        }        
        if (members.some(m => m.userID == uid && m.inGroup)) {          
          failedCount++;          
          continue;        }        
        try {          
          await api.addUserToGroup(uid, threadID);          
          successCount++;          
          await sleep(1200);        } catch (addError) {          
          failedCount++;        }      }      
      
      if (successCount > 0) {        
        try { api.setMessageReaction("✅", messageID, () => {}, true); } catch(e){}      
      } else {        
        try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}      }      
      
      const title = fonts.bold(getLang("resultTitle")) + "\n\n";
      const successLine = "✅ | " + getLang("successText", successCount);
      const failLine = "❌ | " + getLang("failedText", failedCount);
      const finalResult = fonts.christus(title + successLine + "\n" + failLine);
      
      return message.reply(finalResult);    } catch (globalError) {      
      console.error(globalError);      
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}      
      return message.reply(fonts.christus("❌ | Une erreur critique est survenue durant l'execution du script."));    }  }
};
