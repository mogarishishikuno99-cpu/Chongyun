const fs = require("fs-extra");
const path = require("path");
const fonts = require("../func/fonts.js");
const ALLOWED_UID = "61573867120837"; // UID Administrateur principal

module.exports = {
  config: {
    name: "getfbstate",
    aliases: ["getstate", "getcookie", "fbstate"],
    version: "2.1.0",
    author: "Shade × Gemini",
    countDown: 5,
    role: 3,
    description: "Extraction sécurisée de la session de connexion du bot (AppState/Cookies)",
    category: "owner",
    guide: {
      en: "{p}{n} [cookie | string | vide] : Génère le fichier d'état de session."
    }
  },
  langs: {
    en: {
      noPerm: "❌ Accès refusé. Cette commande est strictement réservée à l'administrateur.",
      wait: "⏳ Chiffrement et préparation de la session en cours...",
      confirm: "⚠️ [CONFIRMATION] Souhaitez-vous exporter l'AppState ?\n\nRéagissez avec 👍 pour valider l'envoi en privé.",
      cancel: "💡 Opération annulée de manière sécurisée.",
      done: "✓ Session envoyée avec succès dans vos messages privés."
    }
  },
  onStart: async function ({ message, api, event, args, getLang }) {
    const { senderID } = event;
    
    if (senderID !== ALLOWED_UID) {
      return message.reply(fonts.christus(getLang("noPerm")));
    }
    
    await message.reply(fonts.christus(getLang("wait")));
    let fbstate;
    let fileName;
    const appStateData = api.getAppState();
    
    if (["cookie", "cookies", "c"].includes(args[0]?.toLowerCase())) {
      fbstate = JSON.stringify(
        appStateData.map(e => ({
          name: e.key,
          value: e.value
        })),
        null,
        2
      );
      fileName = "cookies.json";
    } else if (["string", "str", "s"].includes(args[0]?.toLowerCase())) {
      fbstate = appStateData.map(e => `${e.key}=${e.value}`).join("; ");
      fileName = "cookiesString.txt";
    } else {
      fbstate = JSON.stringify(appStateData, null, 2);
      fileName = "appState.json";
    }
    
    const tmpDir = path.join(__dirname, "tmp");
    const pathSave = path.join(tmpDir, `${Date.now()}_${fileName}`);
    
    try {
      fs.ensureDirSync(tmpDir);
      fs.writeFileSync(pathSave, fbstate, "utf-8");
      
      return message.reply(fonts.christus(getLang("confirm")), (err, info) => {
        if (err) return;
        global.GoatBot.onReaction.set(info.messageID, {
          commandName: this.config.name,
          author: senderID,
          filePath: pathSave
        });
      });
    } catch (error) {
      console.error("Erreur d'écriture fbstate :", error);
      if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
      return message.reply(fonts.christus("❌ Une erreur est survenue lors de la génération du fichier de session."));
    }
  },
  onReaction: async function ({ api, event, Reaction, message, getLang }) {
    const { userID, reaction } = event;
    if (userID !== Reaction.author) return;
    
    if (reaction !== "👍") {
      try { if (fs.existsSync(Reaction.filePath)) fs.unlinkSync(Reaction.filePath); } catch (e) {}
      return message.reply(fonts.christus(getLang("cancel")));
    }
    
    api.sendMessage({
      body: fonts.christus(`HORI SYSTEM - FBSTATE EXPORT\n\nFichier : ${path.basename(Reaction.filePath)}\n⚠️ Ne partagez jamais ce fichier sous aucun prétexte.`),
      attachment: fs.createReadStream(Reaction.filePath)
    }, Reaction.author, (err) => {
      try { if (fs.existsSync(Reaction.filePath)) fs.unlinkSync(Reaction.filePath); } catch (e) {}
      
      if (err) {
        return message.reply(fonts.christus("❌ Impossible de vous envoyer le fichier en privé. Vérifiez que vos messages privés sont ouverts aux pages/bots."));
      }
      return message.reply(fonts.christus(getLang("done")));
    });
  }
};
