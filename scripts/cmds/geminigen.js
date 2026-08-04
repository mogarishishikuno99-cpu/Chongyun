const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const fonts = require("../func/fonts.js");
const apiUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";

async function getApiUrl() {
    const res = await axios.get(apiUrl);
    return res.data.apiv3;
}

async function urlToBase64(url) {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(res.data).toString("base64");
}

module.exports = {
    config: {
        name: "geminigen",
        aliases: ["gen"],
        version: "1.0",
        author: "Shade",
        countDown: 5,
        role: 2,
        shortDescription: "Generate or edit images using text prompts",
        longDescription: "Generate a new image from a text prompt or edit an existing image by replying to it.",
        category: "ai",
        guide: "{p}geminigen <prompt>\n" + "{p}geminigen <prompt> (reply to an image to edit it)"  
    },
    onStart: async function ({ api, event, args, message }) {
        const repliedImage = event.messageReply?.attachments?.[0];
        const prompt = args.join(" ").trim();
            
        if (!prompt) {
            return message.reply(fonts.christus("Veuillez fournir un prompt.\n\nExemples :\n/geminigen a cyberpunk city\n/geminigen make me anime (répondre à une image)"));
        }
            
        const processingMsg = await message.reply(fonts.christus("Traitement de votre image en cours..."));
        const imgPath = path.join(__dirname, "cache", `${Date.now()}_geminigen.jpg`);
            
        try {
            const API_URL = await getApiUrl();
            const payload = {
                prompt: repliedImage                     
                    ? `Edit the given image based on this description:\n${prompt}`                     
                    : `Create a high quality image based on this description:\n${prompt}`,
                format: "jpg"      
            };
                  
            if (repliedImage && repliedImage.type === "photo") {
                payload.images = [await urlToBase64(repliedImage.url)];
            }
                  
            const res = await axios.post(API_URL, payload, {
                responseType: "arraybuffer",
                timeout: 180000      
            });
                  
            await fs.ensureDir(path.dirname(imgPath));
            await fs.writeFile(imgPath, Buffer.from(res.data));
            await api.unsendMessage(processingMsg.messageID);
                  
            return message.reply({
                body: fonts.christus(repliedImage                     
                    ? `Image édité avec succès.\nPrompt : ${prompt}`                     
                    : `Image généré avec succès.\nPrompt : ${prompt}`),
                attachment: fs.createReadStream(imgPath)      
            });
        } catch (error) {
            console.error("GEMINIGEN Error:", error?.response?.data || error.message);
            await api.unsendMessage(processingMsg.messageID);
            return message.reply(fonts.christus("Échec du traitement de l'image. Veuillez réessayer plus tard."));
        } finally {
            if (fs.existsSync(imgPath)) {
                await fs.remove(imgPath);
            }
        }
    }
};
