const fonts = require("../func/fonts.js");

module.exports = {  
  config: {    
    name: "kick",    
    version: "1.9",    
    author: "Shade",    
    role: 1,    
    category: "admin",    
    description: {      
      en: "Exclure un membre du groupe par mention, réponse ou UID avec confirmation"    }  
  },  
  langs: {    
    en: {      
      noPermission: "❌ | Désolé, mais vous devez être administrateur pour utiliser cette commande.",      
      needAdmin: "⚠️ | Je dois être administrateur du groupe pour pouvoir effectuer cette action.",      
      noTarget: "👤 | Veuillez mentionner un utilisateur, répondre à son message ou entrer son UID.",      
      confirm: "⚠️ | Voulez-vous vraiment expulser %1 du groupe ?\n\nRépondez par 'oui' ou 'non'.",      
      cancel: "❌ | Action annulée avec succès.",      
      success: "✅ | L'utilisateur (%1) a été expulsé du groupe avec succès."    }  
  },  
  onStart: async function ({ message, event, api, getLang, args }) {    
    const threadInfo = await api.getThreadInfo(event.threadID);    
    const botID = api.getCurrentUserID();        
    
    const isAdmin = threadInfo.adminIDs.some(a => a.id === event.senderID);    
    if (!isAdmin)      
      return message.reply(fonts.christus(getLang("noPermission")));    

    if (!threadInfo.adminIDs.some(a => a.id === botID))      
      return message.reply(fonts.christus(getLang("needAdmin")));    

    let targetID = null;    
    if (event.messageReply?.senderID) {      
      targetID = event.messageReply.senderID;    } else if (event.mentions && Object.keys(event.mentions).length > 0) {      
      targetID = Object.keys(event.mentions)[0];    } else if (args[0] && !isNaN(args[0].replace(/[^0-9]/g, ''))) {      
      targetID = args[0].replace(/[^0-9]/g, '');    }    

    if (!targetID || targetID.length < 5)      
      return message.reply(fonts.christus(getLang("noTarget")));    

    const name = event.mentions?.[targetID] || `l'utilisateur [${targetID}]`;    

    api.setMessageReaction("⏳", event.messageID, () => {}, true);    

    return message.reply(fonts.christus(getLang("confirm", name)), (err, info) => {      
      if (err) return message.reply(fonts.christus("❌ | Une erreur est survenue lors de la tentative."));      
      global.GoatBot.onReply.set(info.messageID, {        
        commandName: "kick",        
        author: event.senderID,        
        targetID      });    });  
  },  
  onReply: async function ({ event, api, message, Reply, getLang }) {    
    if (event.senderID !== Reply.author) return;    
    const answer = event.body.toLowerCase().trim();    
    if (answer !== "oui" && answer !== "non") {      
      return message.reply(fonts.christus("⚠️ | Veuillez répondre par 'oui' ou 'non'."));    }    

    if (answer === "non") {      
      api.setMessageReaction("❌", event.messageID, () => {}, true);      
      return message.reply(fonts.christus(getLang("cancel")));    }    

    try {      
      api.setMessageReaction("⏳", event.messageID, () => {}, true);      
      await api.removeUserFromGroup(        
        Reply.targetID,        
        event.threadID      );      
      api.setMessageReaction("✅", event.messageID, () => {}, true);      
      return message.reply(        
        fonts.christus(getLang("success", Reply.targetID))      );    } catch (e) {      
      return message.reply(fonts.christus("❌ | Une erreur s'est produite lors de l'expulsion de l'utilisateur."));    }  
};
