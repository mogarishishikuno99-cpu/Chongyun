const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const fonts = require("../func/fonts.js");

const supportedDomains = [  
  "facebook.com", "fb.watch",  
  "youtube.com", "youtu.be",  
  "tiktok.com",  
  "instagram.com", "instagr.am",  
  "likee.com", "likee.video",  
  "capcut.com",  
  "spotify.com",  
  "terabox.com",  
  "twitter.com", "x.com",  
  "drive.google.com",  
  "soundcloud.com",  
  "ndown.app",  
  "pinterest.com", "pin.it",  
  "suno.com"
];

module.exports = {  
  config: {    
    name: "autodl",    
    version: "2.1.1 Hori Edition",    
    author: "Christus × Shade × Gemini",    
    role: 0,    
    shortDescription: "Auto Media Downloader Hori Style",    
    longDescription: "Télécharge automatiquement des médias depuis les plateformes supportées avec une interface stylisée.",    
    category: "download",    
    guide: {      
      fr: "Envoie simplement un lien https:// et le bot le téléchargera automatiquement."    }  },  
  onStart: async function ({ api, event }) {    
    const text = "AUTOMATIC DOWNLOADER\n\nEnvoie un lien valide (YouTube, TikTok, Facebook, Instagram...) et je m'occupe de le récupérer instantanément !";
    api.sendMessage(fonts.christus(text), event.threadID, event.messageID);  },  
  onChat: async function ({ api, event }) {    
    const content = event.body ? event.body.trim() : "";    
    if (content.toLowerCase().startsWith("auto")) return;    
    if (!content.startsWith("https://")) return;    
    if (!supportedDomains.some(domain => content.includes(domain))) return;    
    
    try { api.setMessageReaction("📥", event.messageID, () => {}, true); } catch(e){}    
    
    try {      
      const API = `https://xsaim8x-xxx-api.onrender.com/api/auto?url=${encodeURIComponent(content)}`;      
      const res = await axios.get(API);      
      if (!res.data) throw new Error("No response from server API");      
      const mediaURL = res.data.high_quality || res.data.low_quality;      
      const mediaTitle = res.data.title || "Média Sans Titre";      
      if (!mediaURL) throw new Error("No download link found");      
      
      const extension = mediaURL.includes(".mp3") ? "mp3" : "mp4";      
      const buffer = (await axios.get(mediaURL, { responseType: "arraybuffer" })).data;      
      const filePath = path.join(__dirname, "cache", `hori_dl_${Date.now()}.${extension}`);      
      await fs.ensureDir(path.dirname(filePath));      
      fs.writeFileSync(filePath, Buffer.from(buffer));      
      
      try { api.setMessageReaction("✅", event.messageID, () => {}, true); } catch(e){}      
      
      const domain = supportedDomains.find(d => content.includes(d)) || "Unknown";      
      const platformName = domain.replace(/(\.com|\.app|\.video|\.net|\.it)/, "").toUpperCase();      
      
      const titleBox = fonts.bold("EXTRACTION REUSSIE") + "\n\n";
      const infoMsg = titleBox + 
        `Titre : ${mediaTitle}\n` + 
        `Plateforme : ${platformName}\n` + 
        `Statut : Operationnel [ 100% ]\n\n` + 
        `💡 | Fichier converti et traite par le systeme.`;      
      
      api.sendMessage(        
        {          
          body: fonts.christus(infoMsg),          
          attachment: fs.createReadStream(filePath)        },        
        event.threadID,        
        () => {          
          try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}        },        
        event.messageID      );    } catch (e) {      
      console.error(e);      
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch(e){}      
      const errorMsg = fonts.bold("SYNC FLOP / INTERRUMPUR") + "\n\n" + 
        "❌ | Impossible de recuperer le contenu de ce terminal.\n\n" + 
        "💡 | Verifie la validite de ton URL or reessaie ulterieurement.";      
      api.sendMessage(        
        fonts.christus(errorMsg),        
        event.threadID,        
        event.messageID      );    }  } 
};
