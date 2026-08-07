const fonts = require("../func/fonts.js");

module.exports = {  
  config: {    
    name: "levelup",    
    version: "1.4",    
    author: "Shade",    
    countDown: 5,    
    role: 3,    
    shortDescription: {      
      en: "Définir le niveau d'un utilisateur (avec synchronisation de l'XP)"    },    
    description: {      
      en: "Augmente ou réduit le niveau d'un utilisateur et synchronise l'XP avec le système de classement"    },    
    category: "economy",    
    guide: {      
      en: "{pn} @tag 10/20\n{pn} 25\n{pn} 100081330372098 -5 (par UID)"    }  
  },  
  onStart: async function ({ message, event, args, usersData, envCommands }) {    
    const deltaNext = envCommands["rank"]?.deltaNext || 5;    
    
    let targetID;    
    if (event.type === "message_reply") {      
      targetID = event.messageReply.senderID;      
      args.shift();    } else if (Object.keys(event.mentions || {}).length > 0) {      
      targetID = Object.keys(event.mentions)[0];      
      args.shift();    } else if (/^\d{6,}$/.test(args[0])) {      
      targetID = args.shift();    }    
    
    if (!targetID)      
      return message.reply(fonts.christus("Veuillez taguer, répondre ou fournir un UID de l'utilisateur."));    
    
    const input = args.find(arg => !isNaN(arg) || arg.includes("/"));    
    if (!input)      
      return message.reply(fonts.christus("Fournissez un nombre de niveau ou une plage (ex: 10/20 ou -5)"));    
    
    let levelChange;    
    if (input.includes("/")) {      
      const [min, max] = input.split("/").map(Number);      
      if (isNaN(min) || isNaN(max) || min > max)        
        return message.reply(fonts.christus("Plage invalide."));      
      levelChange = Math.floor(Math.random() * (max - min + 1)) + min;    } else {      
      levelChange = parseInt(input);    }    
    
    const userData = await usersData.get(targetID);    
    if (!userData)      
      return message.reply(fonts.christus("Utilisateur non trouvé dans la base de données."));    
    
    const oldExp = userData.exp || 0;    
    const oldLevel = Math.floor((1 + Math.sqrt(1 + 8 * oldExp / deltaNext)) / 2);    
    const newLevel = oldLevel + levelChange;    
    const newExp = Math.floor(((newLevel ** 2 - newLevel) * deltaNext) / 2);    
    
    await usersData.set(targetID, { exp: newExp });    
    
    const msg = `MISE À JOUR DU NIVEAU\n` +
                `━━━━━━━━━━━━━━\n` +
                `Utilisateur : ${userData.name} (${targetID})\n` +
                `Niveau : ${oldLevel} → ${newLevel}\n` +
                `XP : ${oldExp} → ${newExp}`;
                
    return message.reply(fonts.christus(msg));  
};
