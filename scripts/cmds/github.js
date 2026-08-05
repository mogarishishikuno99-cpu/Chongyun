const axios = require("axios");
const fonts = require("../func/fonts.js");

// 🔒 SÉCURITÉ : Ton nouveau compte GitHub
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ""; 
const GITHUB_USERNAME = "taijylangu30-lgtm";

// Configuration globale des requêtes Axios pour l'API GitHub
const githubAPI = axios.create({  
  baseURL: "https://api.github.com",  
  headers: {    
    "Authorization": `Bearer ${GITHUB_TOKEN}`,    
    "Accept": "application/vnd.github+json",    
    "X-GitHub-Api-Version": "2022-11-28"  
  }
});

module.exports = {  
  config: {    
    name: "github",    
    aliases: ["git", "repo"],    
    version: "1.3.1",    
    role: 3,     
    author: "AI Collaborator",    
    description: "Explorateur, éditeur, créateur et suppresseur de fichiers sur dépôts GitHub",    
    category: "security",    
    guide: {      
      en: "{p}{n} [repo_name]"    },    
    countDown: 2  },  
  
  // ÉTAPE 1 : Entrée dans le dépôt et affichage de la racine  
  onStart: async function ({ api, event, args }) {    
    const { threadID, messageID, senderID } = event;    
    const repoName = args[0];    
    
    if (!repoName) {      
      return api.sendMessage(fonts.christus("⚠️ Spécifiez le nom d'un de vos dépôts (ex: !github No)"), threadID, messageID);    }    
    
    if (!GITHUB_TOKEN) {      
      return api.sendMessage(fonts.christus("❌ Configuration manquante : Le Token GitHub n'est pas configuré dans l'environnement du serveur."), threadID, messageID);    }    
    
    try {      
      const url = `/repos/${GITHUB_USERNAME}/${repoName}/contents`;      
      const res = await githubAPI.get(url);      
      
      let msg = `Dépôt : ${repoName}\nRacine (/)\n\n`;      
      msg += `0️⃣ ➔ ➕ Créer un nouveau fichier ou dossier\n──────────────────\n`;            
      
      let filesList = [];      
      res.data.forEach((item, index) => {        
        const typeIcon = item.type === "dir" ? "📁" : "📄";        
        msg += `${index + 1}. ${typeIcon} ${item.name}\n`;        
        filesList.push({ name: item.name, type: item.type, path: item.path, sha: item.sha });      });      
      
      msg += `\n🔢 Répondez avec un numéro pour naviguer ou 0 pour créer.`;      
      return api.sendMessage(fonts.christus(msg), threadID, (err, info) => {        
        if (err) return;        
        global.GoatBot.onReply.set(info.messageID, {          
          commandName: this.config.name,          
          author: senderID,          
          repoName: repoName,          
          currentPath: "",          
          filesList: filesList,          
          step: "navigate"        });      }, messageID);    } catch (err) {      
      console.error("GitHub API Error:", err.response ? err.response.data : err.message);      
      const status = err.response ? err.response.status : null;            
      
      let errorHint = "Vérifiez le nom et vos accès.";      
      if (status === 401 || status === 403) errorHint = "Token invalide ou permissions insuffisantes (cochez 'repo').";      
      if (status === 404) errorHint = "Dépôt introuvable ou vide (ajoutez un fichier README sur GitHub si le dépôt vient d'être créé).";      
      
      return api.sendMessage(fonts.christus(`❌ Impossible d'accéder au dépôt (${status || "Erreur réseau"}). ${errorHint}`), threadID, messageID);    }  },  
  
  // GESTION INTERACTIVE DES RÉPONSES  
  onReply: async function ({ api, event, Reply }) {    
    const { threadID, messageID, senderID, body } = event;    
    if (senderID !== Reply.author) return;    
    
    // --- MODE NAVIGATION ---    
    if (Reply.step === "navigate") {      
      const choice = body.trim();      
      if (choice === "0") {        
        api.unsendMessage(Reply.messageID);        
        return api.sendMessage(fonts.christus("📝 Voulez-vous créer un fichier ou un dossier ?\nRépondez par 'file' ou 'folder' :"), threadID, (err, info) => {          
          global.GoatBot.onReply.set(info.messageID, {            
            commandName: this.config.name,            
            author: senderID,            
            repoName: Reply.repoName,            
            currentPath: Reply.currentPath,            
            step: "choose_type_to_create"          });        }, messageID);      }      
      
      const index = parseInt(choice) - 1;      
      if (isNaN(index) || !Reply.filesList[index]) {        
        return api.sendMessage(fonts.christus("⚠️ Numéro invalide."), threadID, messageID);      }      
      
      const selectedItem = Reply.filesList[index];      
      
      // Cas A : Dossier      
      if (selectedItem.type === "dir") {        
        try {          
          const url = `/repos/${GITHUB_USERNAME}/${Reply.repoName}/contents/${selectedItem.path}`;          
          const res = await githubAPI.get(url);          
          
          let msg = `Dépôt : ${Reply.repoName}\nDossier : /${selectedItem.path}\n\n`;          
          msg += `0️⃣ ➔ ➕ Créer un nouveau fichier ou dossier\n──────────────────\n`;                    
          
          let filesList = [];          
          res.data.forEach((item, idx) => {            
            const typeIcon = item.type === "dir" ? "📁" : "📄";            
            msg += `${idx + 1}. ${typeIcon} ${item.name}\n`;            
            filesList.push({ name: item.name, type: item.type, path: item.path, sha: item.sha });          });          
          
          msg += `\n🔢 Répondez avec un numéro pour naviguer ou 0 pour créer.`;          
          api.unsendMessage(Reply.messageID);          
          
          return api.sendMessage(fonts.christus(msg), threadID, (err, info) => {            
            global.GoatBot.onReply.set(info.messageID, {              
              commandName: this.config.name,              
              author: senderID,              
              repoName: Reply.repoName,              
              currentPath: selectedItem.path,              
              filesList: filesList,              
              step: "navigate"            });          }, messageID);        } catch (e) {          
          return api.sendMessage(fonts.christus("❌ Erreur lors de l'ouverture du dossier."), threadID, messageID);        }      }      
      
      // Cas B : Fichier      
      if (selectedItem.type === "file") {        
        try {          
          const url = `/repos/${GITHUB_USERNAME}/${Reply.repoName}/contents/${selectedItem.path}`;          
          const res = await githubAPI.get(url);          
          const fileContent = Buffer.from(res.data.content, "base64").toString("utf8");          
          api.unsendMessage(Reply.messageID);                    
          
          let msg = `Fichier : ${selectedItem.name}\n\n\`\`\`javascript\n${fileContent.substring(0, 1500)}${fileContent.length > 1500 ? "\n... (coupé)" : ""}\n\`\`\`\n`;          
          msg += `\n──────────────────\n`;          
          msg += `📝 Pour modifier : Répondez à ce message en collant le nouveau code complet.\n\n`;          
          msg += `🗑️ Pour supprimer : Répondez simplement en écrivant le mot delete`;          
          
          return api.sendMessage(fonts.christus(msg), threadID, (err, info) => {            
            global.GoatBot.onReply.set(info.messageID, {              
              commandName: this.config.name,              
              author: senderID,              
              repoName: Reply.repoName,              
              filePath: selectedItem.path,              
              fileSha: selectedItem.sha,              
              step: "edit_or_delete"            });          }, messageID);        } catch (e) {          
          return api.sendMessage(fonts.christus("❌ Erreur lors de la lecture du fichier."), threadID, messageID);        }      }    }    
    
    // --- CHOIX DU TYPE À CRÉER ---
    if (Reply.step === "choose_type_to_create") {
      const typeChoice = body.trim().toLowerCase();
      api.unsendMessage(Reply.messageID);

      if (typeChoice === "folder" || typeChoice === "dossier") {
        return api.sendMessage(fonts.christus("📁 Entrez le nom du dossier à créer :"), threadID, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: senderID,
            repoName: Reply.repoName,
            currentPath: Reply.currentPath,
            step: "ask_new_folder_name"
          });
        }, messageID);
      } else {
        return api.sendMessage(fonts.christus("📝 Entrez le nom du fichier avec son extension (ex: test.js) :"), threadID, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: senderID,
            repoName: Reply.repoName,
            currentPath: Reply.currentPath,
            step: "ask_new_file_name"
          });
        }, messageID);
      }
    }

    // --- CRÉATION : DOSSIER ---
    if (Reply.step === "ask_new_folder_name") {
      const folderName = body.trim();
      if (!folderName) return api.sendMessage(fonts.christus("❌ Nom de dossier invalide."), threadID, messageID);

      const folderPath = Reply.currentPath ? `${Reply.currentPath}/${folderName}/.gitkeep` : `${folderName}/.gitkeep`;
      api.unsendMessage(Reply.messageID);

      api.sendMessage(fonts.christus("⏳ Création du dossier sur GitHub..."), threadID, async (err, infoLoading) => {
        try {
          const url = `/repos/${GITHUB_USERNAME}/${Reply.repoName}/contents/${folderPath}`;
          const base64Content = Buffer.from("Auto-generated to maintain folder structure", "utf8").toString("base64");
          
          await githubAPI.put(url, {
            message: `Create folder ${folderName} via Messenger Bot`,
            content: base64Content
          });

          api.unsendMessage(infoLoading.messageID);
          return api.sendMessage(fonts.christus(`✅ Dossier "${folderName}" créé avec succès !`), threadID, messageID);
        } catch (e) {
          console.error("Create Folder Error:", e.response ? e.response.data : e.message);
          api.unsendMessage(infoLoading.messageID);
          return api.sendMessage(fonts.christus("❌ Impossible de créer le dossier. Vérifiez les permissions de votre Token GitHub (scope 'repo')."), threadID, messageID);
        }
      }, messageID);
    }

    // --- CRÉATION : NOM DU FICHIER ---    
    if (Reply.step === "ask_new_file_name") {      
      const fileName = body.trim();      
      if (!fileName) return api.sendMessage(fonts.christus("❌ Nom invalide."), threadID, messageID);      
      
      const finalPath = Reply.currentPath ? `${Reply.currentPath}/${fileName}` : fileName;      
      api.unsendMessage(Reply.messageID);      
      
      return api.sendMessage(fonts.christus(`💻 Collez et envoyez maintenant le code complet pour le fichier ${fileName} :`), threadID, (err, info) => {        
        global.GoatBot.onReply.set(info.messageID, {          
          commandName: this.config.name,          
          author: senderID,          
          repoName: Reply.repoName,          
          filePath: finalPath,          
          step: "save_new_file"        });      }, messageID);    }    
    
    // --- CRÉATION : ENREGISTREMENT FICHIER ---    
    if (Reply.step === "save_new_file") {      
      const fileCode = body;      
      api.unsendMessage(Reply.messageID);      
      
      api.sendMessage(fonts.christus("⏳ Création et push du fichier sur GitHub..."), threadID, async (err, infoLoading) => {        
        try {          
          const url = `/repos/${GITHUB_USERNAME}/${Reply.repoName}/contents/${Reply.filePath}`;          
          const base64Content = Buffer.from(fileCode, "utf8").toString("base64");          
          
          await githubAPI.put(url, {            
            message: `Create new file ${Reply.filePath} via Messenger Bot`,            
            content: base64Content          });          
          
          api.unsendMessage(infoLoading.messageID);          
          return api.sendMessage(fonts.christus(`✅ Nouveau fichier créé avec succès !\nChemin : ${Reply.filePath}`), threadID, messageID);        } catch (e) {          
          console.error("Save File Error:", e.response ? e.response.data : e.message);          
          api.unsendMessage(infoLoading.messageID);          
          return api.sendMessage(fonts.christus("❌ Impossible de créer le fichier. Vérifiez les permissions de votre Token GitHub (scope 'repo')."), threadID, messageID);        }      }, messageID);    }    
    
    // --- INTERACTION : ÉDITION OU SUPPRESSION ---    
    if (Reply.step === "edit_or_delete") {      
      const input = body.trim();      
      api.unsendMessage(Reply.messageID);      
      
      // CAS 1 : Suppression      
      if (input.toLowerCase() === "delete") {        
        api.sendMessage(fonts.christus(`⏳ Suppression du fichier ${Reply.filePath} sur GitHub...`), threadID, async (err, infoLoading) => {          
          try {            
            const url = `/repos/${GITHUB_USERNAME}/${Reply.repoName}/contents/${Reply.filePath}`;                        
            await githubAPI.delete(url, {              
              data: {                
                message: `Delete file ${Reply.filePath} via Messenger Bot`,                
                sha: Reply.fileSha              }            });            
            
            api.unsendMessage(infoLoading.messageID);            
            return api.sendMessage(fonts.christus(`🗑️ Fichier ${Reply.filePath} supprimé définitivement de GitHub avec succès !`), threadID, messageID);          } catch (e) {            
            console.error("Delete Error:", e.response ? e.response.data : e.message);            
            api.unsendMessage(infoLoading.messageID);            
            return api.sendMessage(fonts.christus("❌ Impossible de supprimer le fichier."), threadID, messageID);          }        }, messageID);        
        return;      }      
      
      // CAS 2 : Modification du code      
      api.sendMessage(fonts.christus("⏳ Sauvegarde des modifications sur GitHub..."), threadID, async (err, infoLoading) => {        
        try {          
          const url = `/repos/${GITHUB_USERNAME}/${Reply.repoName}/contents/${Reply.filePath}`;          
          const base64Content = Buffer.from(input, "utf8").toString("base64");          
          
          await githubAPI.put(url, {            
            message: `Update ${Reply.filePath} via Messenger Bot`,            
            content: base64Content,            
            sha: Reply.fileSha          });          
          
          api.unsendMessage(infoLoading.messageID);          
          return api.sendMessage(fonts.christus(`✅ Fichier ${Reply.filePath} mis à jour sur GitHub !`), threadID, messageID);        } catch (e) {          
          console.error("Update Error:", e.response ? e.response.data : e.message);          
          api.unsendMessage(infoLoading.messageID);          
          return api.sendMessage(fonts.christus("❌ Échec de la mise à jour sur GitHub. Vérifiez les permissions de votre Token GitHub (scope 'repo')."), threadID, messageID);        }      }, messageID);    }  }
};
