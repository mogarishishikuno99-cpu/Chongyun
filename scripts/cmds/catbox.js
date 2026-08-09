const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const mime = require("mime-types");
const fonts = require("../func/fonts.js");

module.exports = {  
  config: {    
    name: "catbox",    
    aliases: ["cb"],    
    version: "2.2.1 Hori Edition",    
    author: "Shade",    
    role: 0,    
    category: "download",    
    description: "Upload tes médias sur Catbox et récupère un lien permanent.",    
    guide: {      
      fr: "Réponds à une image, vidéo ou audio avec : {pn}"    
    }  
  },  
  
  onStart: async function ({ api, event }) {    
    const attachment = event.messageReply?.attachments?.[0];    
    const attachmentUrl = attachment?.url;    
    
    if (!attachmentUrl) {      
      const errorText = fonts.bold("UPLOAD TERMINAL") + "\n\n" +
        "❌ | Action requise : Réponds à une image, une vidéo ou un fichier audio pour l'envoyer vers le serveur d'hébergement.";
      return api.sendMessage(fonts.christus(errorText), event.threadID, event.messageID);    
    }    
    
    let ext = ".bin";    
    if (attachment.type === "photo") ext = ".png";    
    else if (attachment.type === "video") ext = ".mp4";    
    else if (attachment.type === "audio") ext = ".mp3";    
    else {      
      ext = path.extname(attachmentUrl.split("?")[0]) || ".bin";    
    }    
    
    const filename = `hori_upload_${Date.now()}${ext}`;    
    
    try { api.setMessageReaction("⏳", event.messageID, () => {}, true); } catch(e){}
    
    try {      
      const fileRes = await axios.get(attachmentUrl, {          
        responseType: "stream"        
      });      
      
      const form = new FormData();        
      form.append("reqtype", "fileupload");        
      form.append("fileToUpload", fileRes.data, {          
        filename: filename,          
        contentType: mime.lookup(ext) || "application/octet-stream"        
      });      
      
      const { data } = await axios.post(          
        "https://catbox.moe/user/api.php",          
        form,          
        { headers: form.getHeaders() }        
      );      
      
      try { api.setMessageReaction("📩", event.messageID, () => {}, true); } catch(e){}      
      
      const successTitle = fonts.bold("CLOUD STORAGE SUCCESS") + "\n\n";
      
      // Application des polices uniquement sur le texte, hors de l'URL
      const bodyHeader = fonts.christus("📦 | Statut : Hébergement terminé [ 100% ]\n\n🔗 | Lien permanent généré :\n");
      const bodyFooter = fonts.christus("\n\n💡 | Le fichier est désormais stocké en ligne de façon définitive.");
      
      const finalMessage = successTitle + bodyHeader + data + bodyFooter;
      
      return api.sendMessage(finalMessage, event.threadID, event.messageID);      
    } catch (err) {        
      console.error("Catbox error:", err.message);        
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch(e){}      
      
      const failTitle = fonts.bold("TRANSFER PROTOCOL FAILED") + "\n\n";
      const failText = failTitle + 
        "❌ | Impossible de transférer le composant vers la base de données.\n\n" + 
        "💡 | Vérifie la taille ou le format de ton média, puis réessaie.";      
      
      return api.sendMessage(fonts.christus(failText), event.threadID, event.messageID);      
    }
  }
};
