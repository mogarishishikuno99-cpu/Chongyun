const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const fonts = require("../func/fonts.js");

module.exports = {  
  config: {    
    name: "kiss",    
    version: "1.2",    
    author: "Shade",    
    countDown: 5,    
    role: 0,    
    description: "Créer une image de baiser romantique entre vous et votre partenaire !",    
    category: "game",    
    guide: {      
      en: "{pn} @tag ou réponse — Générer une image de baiser"    }  
  },  
  langs: {    
    en: {      
      noTag: "Veuillez identifier quelqu’un ou répondre à son message pour utiliser cette commande.",      
      fail: "Impossible de générer l'image du baiser, veuillez réessayer plus tard."    }  
  },  
  onStart: async function ({ event, message, usersData, getLang }) {    
    const uid1 = event.senderID;    
    let uid2 = Object.keys(event.mentions || {})[0];        
    
    if (!uid2 && event.messageReply?.senderID) uid2 = event.messageReply.senderID;    
    if (!uid2) return message.reply(fonts.christus(getLang("noTag")));    
    
    try {      
      const [name1, name2] = await Promise.all([        
        usersData.getName(uid1).catch(() => "Inconnu"),        
        usersData.getName(uid2).catch(() => "Inconnu")      ]);      
      
      const [avatar1, avatar2] = await Promise.all([        
        usersData.getAvatarUrl(uid1),        
        usersData.getAvatarUrl(uid2)      ]);      
      
      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";      
      const rawRes = await axios.get(GITHUB_RAW);      
      const apiBase = rawRes.data.apiv1;      
      const apiURL = `${apiBase}/api/kiss?boy=${encodeURIComponent(avatar1)}&girl=${encodeURIComponent(avatar2)}`;      
      
      const response = await axios.get(apiURL, { responseType: "arraybuffer" });      
      const savePath = path.join(__dirname, "tmp");            
      
      await fs.ensureDir(savePath);      
      const imgPath = path.join(savePath, `${uid1}_${uid2}_kiss.jpg`);      
      await fs.writeFile(imgPath, response.data);      
      
      const text = `💋 ${name1} vient d'embrasser ${name2} ! ❤️`;      
      await message.reply({        
        body: fonts.christus(text),        
        attachment: fs.createReadStream(imgPath)      });      
      
      setTimeout(() => {        
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);      }, 5000);    
    } catch (error) {      
      console.error("Erreur de commande Kiss :", error);      
      return message.reply(fonts.christus(getLang("fail")));    }  
};
