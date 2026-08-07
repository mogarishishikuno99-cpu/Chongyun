const fonts = require("../func/fonts.js");

module.exports = {  
  config: {    
    name: "join",    
    version: "5.0.3",    
    author: "Shade",    
    countDown: 5,    
    role: 4, 
    description: "Rejoindre l'un des groupes où le bot est présent.",    
    category: "utility",    
    guide: {      
      fr: "Tapez la commande, puis répondez au message avec 'page [numéro]' pour changer de page, ou le [numéro du groupe] pour le rejoindre."    }  
  },  
  onStart: async function ({ api, event, args, message, commandName }) {    
    const { threadID, messageID, senderID } = event;    
    try {      
      const groupList = await api.getThreadList(400, null, ["INBOX"]) || [];      
      const filteredList = groupList.filter(g => g.isGroup && g.isSubscribed);      
      if (!filteredList.length) {        
        return message.reply(fonts.christus("❌ Aucun groupe trouvé dans la base de données du bot."));      
      }      
      const requestedPage = parseInt(args[0]) || 1;      
      await sendGroupPage(api, event, filteredList, requestedPage, commandName);    
    } catch (e) {      
      console.error(e);      
      return message.reply(fonts.christus("❌ Erreur lors du chargement des groupes."));    
    }  
  },  
  onReply: async function ({ api, event, Reply, message, commandName }) {    
    const { threadID, messageID, senderID, body } = event;    
    const { author, filteredList, messageID: replyMsgID } = Reply || {};    
    if (senderID !== author) return;    
    const args = (body || "").trim().replace(/ +/g, " ").toLowerCase().split(" ");    
    const action = args[0];    
    
    if (action === "page") {      
      const targetPage = parseInt(args[1], 10);      
      const itemsPerPage = 10;      
      const totalPages = Math.ceil(filteredList.length / itemsPerPage);      
      if (isNaN(targetPage) || targetPage < 1 || targetPage > totalPages) {        
        return message.reply(fonts.christus(`⚠️ Page invalide (choisissez entre 1 et ${totalPages}).`));      
      }      
      try { api.unsendMessage(replyMsgID); } catch (e) {}      
      await sendGroupPage(api, event, filteredList, targetPage, commandName);      
      return;    }    

    const chosenIndex = parseInt(body.trim(), 10);    
    if (!isNaN(chosenIndex) && chosenIndex >= 1 && chosenIndex <= filteredList.length) {      
      const selectedGroup = filteredList[chosenIndex - 1];            
      try {        
        await message.reply(fonts.christus(`⏳ Tentative d'intégration à : "${selectedGroup.threadName || "Ce groupe"}"...`));                
        try { api.unsendMessage(replyMsgID); } catch (e) {}        
        
        await api.addUserToGroup(senderID, selectedGroup.threadID);        
        return message.reply(          
          fonts.christus(`✓ Intégration réussie ! Vous avez été ajouté au groupe "${selectedGroup.threadName || "Groupe"}".`),          
          threadID,          
          messageID        );      
      } catch (directError) {        
        const inviteLink = `https://m.me/j/${selectedGroup.threadID}/`;        
        return message.reply(          
          fonts.christus(`⚠️ L'ajout direct est bloqué par vos paramètres ou ceux du groupe.\n\n🔗 Rejoindre via ce lien :\n${inviteLink}`),          
          threadID,          
          messageID        );      
      }    }  
  }
};

async function sendGroupPage(api, event, filteredList, page, commandName) {  
  const { threadID, messageID, senderID } = event;  
  const itemsPerPage = 10;  
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);  
  if (page < 1) page = 1;  
  if (page > totalPages) page = totalPages;  
  const startIdx = (page - 1) * itemsPerPage;  
  const endIdx = startIdx + itemsPerPage;  
  const paginatedGroups = filteredList.slice(startIdx, endIdx);  
  
  let msg = `🪐 [ Liste des groupes - Page ${page}/${totalPages} ]\n`;  
  msg += `Groupes disponibles : ${filteredList.length}\n\n`;  
  
  paginatedGroups.forEach((g, i) => {    
    const globalIndex = startIdx + i + 1;    
    msg += `${globalIndex}. ${g.threadName || "Groupe sans nom"}\n👥 Membres : ${g.participantIDs?.length || 0}\nID : ${g.threadID}\n\n`;  
  });  
  
  msg += `👉 Répondez à ce message avec :\n`;  
  msg += `• "page [numéro]" (ex: page 2)\n`;  
  msg += `• "[numéro du groupe]" pour y être ajouté (ex: 3)`;  
  
  const sent = await api.sendMessage(fonts.christus(msg), threadID, messageID);  
  global.GoatBot?.onReply?.set(sent.messageID, {    
    commandName,    
    author: senderID,    
    filteredList,    
    messageID: sent.messageID,    
    unsendTimeout: setTimeout(() => {      
      try { api.unsendMessage(sent.messageID); } catch (e) {}    
    }, 120000)  });
}
