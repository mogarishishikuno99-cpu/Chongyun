const axios = require("axios");
const fs = require("fs");
const path = require("path");
const fonts = require("../func/fonts.js");

module.exports = {  
  config: {    
    name: "box",    
    version: "2.1.1",    
    role: 0,    
    author: "Shade & AI",    
    description: "Gestion du groupe interactive par réponses successives (Reply)",    
    category: "utility",    
    guide: {      
      fr: "{p}{n} (Envoyez la commande seule, puis répondez aux messages du bot)"    },    
    countDown: 2  },  
  
  onStart: async function ({ api, event }) {    
    const { threadID, messageID } = event;    
    try {      
      const info = await api.getThreadInfo(threadID);      
      const name = info.threadName || "Sans nom";      
      const emoji = info.emoji || "💬";      
      const members = info.participantIDs.length;      
      const admins = info.adminIDs ? info.adminIDs.map(a => a.id || a) : [];      
      const botID = api.getCurrentUserID();      
      const botIsAdmin = admins.includes(botID);      
      
      const rawMenu = `╭─────── BOX ───────` +
        `\n│ 📦 Groupe : ${name}` +
        `\n│ 😀 | Emoji : ${emoji}` +
        `\n│ 👥 | Membres : ${members}` +
        `\n│ 👑 | Admins : ${admins.length}` +
        `\n│ 🤖 | Bot admin : ${botIsAdmin ? "Oui" : "Non"}` +
        `\n├──────────────` +
        `\n│ ⚙️ | Répondez (reply) à ce message avec un chiffre :` +
        `\n│` +
        `\n│ 1️⃣ ➔ Changer le nom du groupe` +
        `\n│ 2️⃣ ➔ Changer la photo du groupe` +
        `\n│ 3️⃣ ➔ Changer l'emoji` +
        `\n│ 4️⃣ ➔ Changer votre pseudo` +
        `\n│ 5️⃣ ➔ Activer/Désactiver l'approbation` +
        `\n│ 6️⃣ ➔ Afficher l'UID du groupe` +
        `\n│ 7️⃣ ➔ Liste des membres (Tags & UIDs)` +
        `\n│ 8️⃣ ➔ Infos détaillées` +
        `\n╰────────────────`;    
      
      return api.sendMessage(fonts.christus(rawMenu), threadID, (err, infoMessage) => {        
        if (err) return;                
        global.GoatBot.onReply.set(infoMessage.messageID, {          
          commandName: this.config.name,          
          messageID: infoMessage.messageID,          
          author: event.senderID,          
          step: 1        });      }, messageID);    } catch (e) {      
      console.error(e);      
      return api.sendMessage(fonts.christus("❌ | Une erreur est survenue lors de l'ouverture du panel."), threadID, messageID);    }  },  
  
  onReply: async function ({ api, event, Reply }) {    
    const { threadID, messageID, senderID, body, messageReply } = event;        
    if (senderID !== Reply.author) return;    
    
    try {      
      const info = await api.getThreadInfo(threadID);      
      const admins = info.adminIDs ? info.adminIDs.map(a => a.id || a) : [];      
      const botID = api.getCurrentUserID();      
      const botIsAdmin = admins.includes(botID);      
      
      if (Reply.step === 1) {        
        const choice = body.trim();        
        switch (choice) {          
          case "1":            
            return api.sendMessage(fonts.christus("✍️ | Répondez à ce message avec le **nouveau nom** du groupe :"), threadID, (err, infoMsg) => {              
              global.GoatBot.onReply.set(infoMsg.messageID, { commandName: this.config.name, author: senderID, step: 2, action: "name" });            }, messageID);          
          case "2":            
            return api.sendMessage(fonts.christus("🖼️ | Répondez à ce message en y **joignant une image** pour changer la photo :"), threadID, (err, infoMsg) => {              
              global.GoatBot.onReply.set(infoMsg.messageID, { commandName: this.config.name, author: senderID, step: 2, action: "photo" });            }, messageID);          
          case "3":            
            return api.sendMessage(fonts.christus("🔥 | Répondez à ce message avec l'**unique emoji** que vous voulez définir :"), threadID, (err, infoMsg) => {              
              global.GoatBot.onReply.set(infoMsg.messageID, { commandName: this.config.name, author: senderID, step: 2, action: "emoji" });            }, messageID);          
          case "4":            
            return api.sendMessage(fonts.christus("👤 | Répondez à ce message avec votre **nouveau pseudo** pour ce groupe :"), threadID, (err, infoMsg) => {              
              global.GoatBot.onReply.set(infoMsg.messageID, { commandName: this.config.name, author: senderID, step: 2, action: "nickname" });            }, messageID);          
          case "5":            
            if (!botIsAdmin) return api.sendMessage(fonts.christus("❌ | Opération refusée : Nommez d'abord le bot administrateur du groupe."), threadID, messageID);            
            const newMode = !info.approvalMode;            
            await api.setApprovalMode(newMode, threadID);            
            try { api.unsendMessage(Reply.messageID); } catch(e){}            
            return api.sendMessage(fonts.christus(`🔒 | Mode Approbation : ${newMode ? "ACTIVÉ (Fermé)" : "DÉSACTIVÉ (Ouvert)"}`), threadID, messageID);          
          case "6":            
            try { api.unsendMessage(Reply.messageID); } catch(e){}            
            return api.sendMessage(fonts.christus(`🆔 | UID de ce groupe : ${threadID}`), threadID, messageID);          
          case "7": {            
            try { api.unsendMessage(Reply.messageID); } catch(e){}            
            
            const participants = info.userInfo || [];            
            let listText = "LISTE DES MEMBRES\n\n";            
            let mentionsList = [];            
            let cursor = 0;            
            
            for (const participant of participants) {              
              const uid = participant.id;              
              const name = participant.name || "Membre";              
              const line = `${name} ➔ ${uid}\n`;              
              
              mentionsList.push({                
                tag: name,                
                id: uid,                
                fromDate: cursor,                
                length: name.length              });              
              
              cursor += line.length;              
              listText += line;            }            
            
            return api.sendMessage({              
              body: fonts.christus(listText),              
              mentions: mentionsList            }, threadID, messageID);          }          
          case "8":            
            try { api.unsendMessage(Reply.messageID); } catch(e){}            
            return api.sendMessage(fonts.christus(`INFOS\n\nNom : ${info.threadName || "Sans nom"}\nID : ${threadID}\nMembres : ${info.participantIDs.length}`), threadID, messageID);          
          default:            
            return api.sendMessage(fonts.christus("⚠️ | Chiffre invalide. Veuillez répondre avec un nombre entre 1 et 8."), threadID, messageID);        }      }      
      
      if (Reply.step === 2) {        
        const input = body.trim();        
        if (Reply.action === "name") {          
          if (!input) return api.sendMessage(fonts.christus("❌ | Nom invalide."), threadID, messageID);          
          if (!botIsAdmin) return api.sendMessage(fonts.christus("❌ | Impossible de changer le nom : Le bot doit être Administrateur du groupe."), threadID, messageID);                    
          await api.setTitle(input, threadID);          
          try { api.unsendMessage(Reply.messageID); } catch(e){}          
          return api.sendMessage(fonts.christus(`✅ | Le nom du groupe a été modifié en : "${input}"`), threadID, messageID);        }        
        
        if (Reply.action === "photo") {          
          const imgUrl = event.attachments?.[0]?.url || messageReply?.attachments?.[0]?.url;          
          if (!imgUrl) return api.sendMessage(fonts.christus("❌ | Vous devez ajouter ou répondre à une image pour effectuer ce changement !"), threadID, messageID);          
          if (!botIsAdmin) return api.sendMessage(fonts.christus("❌ | Impossible de changer la photo : Le bot doit être Administrateur du groupe."), threadID, messageID);          
          try { api.unsendMessage(Reply.messageID); } catch(e){}          
          const tempPath = path.join(__dirname, "cache", `box_avatar_${threadID}.png`);                    
          
          if (!fs.existsSync(path.join(__dirname, "cache"))) {            
            fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });          }          
          
          const response = await axios({ url: imgUrl, responseType: "stream" });          
          const writer = fs.createWriteStream(tempPath);          
          response.data.pipe(writer);          
          writer.on("finish", async () => {            
            try {              
              await api.changeGroupImage(fs.createReadStream(tempPath), threadID);              
              if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);              
              return api.sendMessage(fonts.christus("✅ | La photo du groupe a été mise à jour avec succès !"), threadID, messageID);            } catch (err) {              
              if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);              
              return api.sendMessage(fonts.christus("❌ | Échec du changement de photo. Assurez-vous que je sois bien Admin."), threadID, messageID);            }          });          
          return;        }        
        
        if (Reply.action === "emoji") {          
          if (!input) return api.sendMessage(fonts.christus("❌ | Emoji invalide."), threadID, messageID);          
          await api.changeThreadEmoji(input, threadID);          
          try { api.unsendMessage(Reply.messageID); } catch(e){}          
          return api.sendMessage(fonts.christus(`✅ | L'emoji du groupe a été changé pour : ${input}`), threadID, messageID);        }        
        
        if (Reply.action === "nickname") {          
          if (!input) return api.sendMessage(fonts.christus("❌ | Pseudo invalide."), threadID, messageID);          
          await api.changeNickname(input, senderID, threadID);          
          try { api.unsendMessage(Reply.messageID); } catch(e){}          
          return api.sendMessage(fonts.christus(`✅ | Votre pseudo a été configuré sur : "${input}"`), threadID, messageID);        }      }    } catch (err) {      
      console.error(err);      
      return api.sendMessage(fonts.christus("❌ | Échec de l'opération. Veuillez vérifier mes permissions (Avez-vous nommé le bot Administrateur ?)."), threadID, messageID);    }  }
};
