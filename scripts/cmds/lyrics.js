const axios = require("axios");
const fonts = require("../func/fonts.js");

module.exports = {  
  config: {    
    name: "lyrics",    
    aliases: ["songlyrics"],    
    version: "2.0",    
    author: "xalman",    
    countDown: 5,    
    role: 0,    
    shortDescription: "Get song lyrics",    
    category: "tools",    
    guide: "{pn} [song name]"  },  
  onStart: async function ({ api, event, args }) {    
    const { threadID, messageID } = event;    
    const songName = args.join(" ");    
    if (!songName) {      
      return api.sendMessage(fonts.christus("╭─❍\n│ Please provide a song name!\n╰───────────⟡"), threadID, messageID);    
    }    
    const waitMsg = await api.sendMessage(fonts.christus(`🔍 | Searching lyrics for: ${songName}...`), threadID, messageID);    
    try {      
      const res = await axios.get(`https://xalman-apis.vercel.app/api/lyrics?song=${encodeURIComponent(songName)}`);            
      if (res.data.status && res.data.data) {        
        const { title, artist, lyrics } = res.data.data;        
        const titleText = fonts.bold("╭───────❍│  『 𝗦𝗢𝗡𝗚 𝗟𝗬𝗥𝗜𝗖𝗦 』╰───────────⟡\n");
        const bodyText = fonts.christus(`🎵 𝗧𝗶𝘁𝗹𝗲  : ${title}\n👤 𝗔𝗿𝘁𝗶𝘀𝘁 : ${artist}\n📜 𝗟𝘆𝗿𝗶𝗰𝘀 :\n━━━━━━━━━━━━━━━━━━\n${lyrics}\n━━━━━━━━━━━━━━━━━━`);        
        return api.editMessage(titleText + bodyText, waitMsg.messageID);      
      } else {        
        throw new Error();      
      }    } catch (error) {      
      return api.editMessage(fonts.christus(`✕ Could not find lyrics for "${songName}"!`), waitMsg.messageID);    }  }
};
