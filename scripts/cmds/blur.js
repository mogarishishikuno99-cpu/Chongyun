const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const fonts = require("../func/fonts.js");

module.exports = {  
  config: {    
    name: "blur",    
    version: "1.1",    
    author: "Saimx69x × Gemini",    
    countDown: 5,    
    role: 0,    
    category: "image",    
    description: "Blur replied image using specified level",    
    guide: "{pn} [level] — Reply to an image and choose blur level (default 3)"  },  
  onStart: async function ({ api, args, message, event }) {    
    try {      
      let blurLevel = parseInt(args[0]) || 3;      
      let imageUrl;      
      
      if (event.type === "message_reply") {        
        const attachment = event.messageReply.attachments?.[0];        
        if (!attachment)          
          return message.reply(fonts.christus("❌ | Please reply to an image."));        
        if (attachment.type !== "photo")          
          return message.reply(fonts.christus("❌ | Only image replies are supported. Video or files not allowed."));        
        imageUrl = attachment.url;      } else {        
        return message.reply(fonts.christus("❌ | Please reply to an image to use this command."));      }      
      
      try { api.setMessageReaction("🌫️", event.messageID, () => {}, true); } catch(e) {}      
      const waitMsg = await message.reply(fonts.christus(`Applying blur level ${blurLevel}...`));      
      
      const RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";      
      const { data } = await axios.get(RAW);      
      const apiBase = data.apiv1;      
      const apiUrl = `${apiBase}/api/blur?url=${encodeURIComponent(imageUrl)}&level=${encodeURIComponent(blurLevel)}`;      
      
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });      
      const filePath = path.join(__dirname, "cache", `blur_${Date.now()}.png`);      
      await fs.outputFile(filePath, response.data);      
      
      try { message.unsend(waitMsg.messageID); } catch(e) {}      
      try { api.setMessageReaction("✅", event.messageID, () => {}, true); } catch(e) {}      
      
      message.reply({        
        body: fonts.christus(`Here's your blurred image (Level: ${blurLevel})`),        
        attachment: fs.createReadStream(filePath)      });    } catch (error) {      
      console.error(error);      
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch(e) {}      
      message.reply(fonts.christus("❌ | Failed to apply blur. Please try again later."));    }  }
};
