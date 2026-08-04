const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const fonts = require("../func/fonts.js");
const githubUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
const memoryFile = path.join(__dirname, "cache", "gem_memory.json");
let memory = {};

// Initialisation sécurisée de la mémoire
try {
  fs.ensureDirSync(path.dirname(memoryFile));
  if (fs.existsSync(memoryFile)) {
    memory = JSON.parse(fs.readFileSync(memoryFile, "utf8"));
  }
} catch (e) {
  memory = {};
}

function saveMemory() {
  try {
    fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
  } catch (e) {
    console.error("Impossible de sauvegarder la mémoire de gem :", e.message);
  }
}

// Récupère l'URL de l'API depuis GitHub
async function getApiUrl() {
  const res = await axios.get(githubUrl);
  return res.data.apiv3;
}

// Convertit l'image en Base64 pour l'API
async function urlToBase64(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data).toString("base64");
}

module.exports = {
  config: {
    name: "gem",
    version: "6.1.2 Fonts Edition",
    author: "Shade × Gemini",
    role: 0,
    category: "ai",
    description: "🎨 Génère un montage graphique anime/fantastique basé sur une image et une histoire continue.",
    guide: { fr: "Réponds à une image avec tes consignes de montage de scène" }
  },
  onStart: async function ({ message, event, args, api }) {
    const userID = event.senderID;
    const prompt = args.join(" ").trim();

    // Réinitialisation de la mémoire utilisateur
    if (prompt.toLowerCase() === "reset") {
      memory[userID] = { image: null, story: "" };
      saveMemory();
      return message.reply(fonts.christus("🧠 Ton historique de scène et tes prompts accumulés ont été effacés avec succès !"));
    }

    const attachment = event.messageReply?.attachments?.[0];
    if (!attachment || attachment.type !== "photo") {
      return message.reply(fonts.christus("💡 Action requise : Réponds à une image (photo de profil, paysage, anime) pour définir la base visuelle du montage."));
    }

    if (!prompt) {
      return message.reply(fonts.christus(`💡 Exemple d'utilisation :\nRéponds à une photo et écris : \`${this.config.name} en train de se battre avec Sukuna sur un toit en bois style anime\``));
    }

    // Gestion de l'historique d'images dans la mémoire de l'IA
    if (!memory[userID] || memory[userID].image !== attachment.url) {
      memory[userID] = { image: attachment.url, story: `Anime style montage, high quality, illustration, inspired by the appearance of the context image, ${prompt}` };
    } else {
      memory[userID].story = `${memory[userID].story}, ${prompt}`;
    }
    
    saveMemory();

    let loading;
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `gem_${userID}_${Date.now()}.jpg`);

    try {
      try { api.setMessageReaction("🎨", event.messageID, () => {}, true); } catch(e) {}
      loading = await message.reply(fonts.christus("🎨 Rendu en cours d'exécution... Le module de dessin applique vos filtres esthétiques, veuillez patienter."));

      // 1. Récupération de l'URL de l'API
      const API_URL = await getApiUrl();

      // 2. Préparation des données (Payload) en Base64
      const payload = {
        prompt: memory[userID].story,
        images: [await urlToBase64(attachment.url)],
        format: "jpg"
      };

      // 3. Création physique du sous-dossier cache si absent
      await fs.ensureDir(cacheDir);

      // 4. Appel de ton API externe
      const res = await axios.post(API_URL, payload, {
        responseType: "arraybuffer",
        timeout: 180000
      });

      // 5. Sauvegarde de l'image reçue
      await fs.writeFile(filePath, Buffer.from(res.data));

      if (loading?.messageID) {
        await api.unsendMessage(loading.messageID).catch(() => {});
      }
      try { api.setMessageReaction("🖼️", event.messageID, () => {}, true); } catch(e) {}

      return message.reply({
        body: fonts.christus("✅ Synthèse réussie\n💡 Utilise la commande \"reset\" pour démarrer une toute nouvelle composition."),
        attachment: fs.createReadStream(filePath)
      }, () => {
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
      });

    } catch (e) {
      console.log("====== GEM ERROR ======", e?.response?.data || e.message || e);
      if (loading?.messageID) {
        await api.unsendMessage(loading.messageID).catch(() => {});
      }
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch(e) {}
      try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
      
      return message.reply(fonts.christus("❌ Le serveur de rendu graphique est temporairement saturé ou en cours de redémarrage. Veuillez soumettre à nouveau votre invite dans 30 secondes."));
    }
  }
};
