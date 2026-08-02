const axios = require("axios");
const fonts = require("../func/fonts.js");

module.exports = {  
  config: {    
    name: "anime",    
    aliases: ["ani", "animesearch"],    
    version: "2.2 angel",    
    author: "Shade",    
    role: 0,    
    category: "media",    
    countDown: 5,    
    longDescription: "Recherche anime + détails + image après sélection",    
    guide: {      
      en: "{pn} <nom anime>"    }  },  
  onStart: async function ({ api, event, args, message }) {    
    try {      
      const query = args.join(" ");      
      if (!query) {        
        return message.reply(fonts.christus("💡 | Donne un nom d’anime !"));      
      }      
      try { api.setMessageReaction("⏳", event.messageID, () => {}, true); } catch(e) {}      
      
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`);      
      const results = res.data.data;      
      if (!results || !results.length) {        
        return message.reply(fonts.christus("❌ | Aucun anime trouvé"));      
      }      
      
      let rawMsg = fonts.bold("🎬 𝗔𝗡𝗜𝗠𝗘 𝗥𝗘𝗦𝗨𝗟𝗧𝗦") + "\n\n";      
      results.forEach((a, i) => {        
        rawMsg += `💠 ${i + 1}. ${a.title}\n`;      });      
      rawMsg += "\n💬 Réponds avec un numéro";      
      
      const sent = await message.reply(fonts.christus(rawMsg));      
      
      global.GoatBot.onReply.set(sent.messageID, {        
        commandName: "anime",        
        author: event.senderID,        
        results      });      
      
      try { api.setMessageReaction("✅", event.messageID, () => {}, true); } catch(e) {}    
    } catch (e) {      
      console.log(e);      
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch(e) {}      
      return message.reply(fonts.christus("❌ | Erreur anime API"));    }  },  
  onReply: async function ({ api, event, Reply, message }) {    
    try {      
      if (event.senderID !== Reply.author) return;      
      const index = parseInt(event.body);      
      if (isNaN(index) || index < 1 || index > Reply.results.length) {        
        return message.reply(fonts.christus("❌ | Numéro invalide"));      
      }      
      const anime = Reply.results[index - 1];      
      try { api.setMessageReaction("⏳", event.messageID, () => {}, true); } catch(e) {}      
      
      const imgUrl = anime.images.jpg.large_image_url;      
      const rawInfo = `🎬 ${anime.title}\n📺 Episodes: ${anime.episodes || "?"}\n🎭 Type: ${anime.type || "?"}\n📅 Status: ${anime.status || "?"}\n⏱️ Duration: ${anime.duration || "?"}\n\n📝 ${anime.synopsis?.slice(0, 500) || "Pas de synopsis"}`;      
      
      const file = await axios({        
        url: imgUrl,        
        responseType: "stream"      });      
      
      try { api.setMessageReaction("🖼️", event.messageID, () => {}, true); } catch(e) {}      
      
      return message.reply({        
        body: fonts.christus(rawInfo),        
        attachment: file.data      });    } catch (e) {      
      console.log(e);      
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch(e) {}      
      return message.reply(fonts.christus("❌ | Erreur lors du détail anime"));    }  }
};
