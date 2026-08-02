const axios = require("axios");
const fonts = require("../func/fonts.js");

module.exports = {  
  config: {    
    name: "cdp",    
    aliases: ["coupledp"],    
    version: "1.2",    
    author: "Saimx69x × Gemini",    
    countDown: 5,    
    role: 0,    
    shortDescription: "Random Couple DP",    
    longDescription: "Envoie une photo de profil assortie pour les couples (Boy & Girl).",    
    category: "image",    
    guide: "{p}cdp"  },  
  
  onStart: async function ({ api, event, message }) {    
    try {      
      const githubRawUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";      
      const apiRes = await axios.get(githubRawUrl);      
      const baseUrl = apiRes.data.apiv1;      
      if (!baseUrl) throw new Error("Impossible de récupérer la base de l'API");      
      
      const res = await axios.get(`${baseUrl}/api/cdp2`);      
      const { garçon, fille, boy, girl } = res.data;      
      
      const urlBoy = boy || garçon;      
      const urlGirl = girl || fille;      
      if (!urlBoy || !urlGirl) {        
        return message.reply(fonts.christus("❌ | Les liens d'images reçus sont invalides ou manquants."));      }      
      
      const [streamBoy, streamGirl] = await Promise.all([        
        axios.get(urlBoy, { responseType: "stream" }),        
        axios.get(urlGirl, { responseType: "stream" })      ]);      
      
      return api.sendMessage(        
        {          
          body: fonts.christus("Voici vos photos de profil de couple assorties !"),          
          attachment: [streamBoy.data, streamGirl.data]        },        
        event.threadID,        
        event.messageID      );    } catch (e) {      
      console.error("[CDP SYSTEM ERROR]", e);      
      return message.reply(        
        fonts.christus("❌ | Une erreur est survenue lors de la récupération des images. Veuillez réessayer plus tard."),         
        event.threadID,         
        event.messageID      );    }  }
};
