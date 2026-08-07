const axios = require('axios');
const fonts = require("../func/fonts.js");
const BASE_URL = 'https://quiz-api-zd8a.onrender.com/api';

module.exports = {  
  config: {    
    name: "quiz",    
    aliases: ["q"],    
    version: "4.2",    
    author: "Christus × Shade",    
    countDown: 0,    
    role: 0,    
    longDescription: {      
      en: "Jeu de quiz avancé avec 6000+ questions, images, succès et classements"    },    
    category: "game",    
    guide: {      
      en: "{pn} <catégorie>\n\n📚 Catégories disponibles :\n🎌 anime, 🏁 flag, 📺 cartoon, 🐾 animaux, 🏛️ monument, ⚽ sport, 🔬 science, 📖 histoire, 🎬 cinema, 🌍 geographie, ➗ maths, 🎭 culture, ⚖️ torf"    }  
  },  
  langs: {    
    en: {      
      reply: "🎯 Quiz Challenge\n━━━━━━━━━━\n\n📚 Catégorie: {category}\n🎚️ Difficulté: {difficulty}\n❓ Question: {question}\n\n{options}\n\n⏰ Vous avez 30 secondes pour répondre (A/B/C/D):",      
      torfReply: "⚙ Quiz ( Vrai/Faux )\n━━━━━━━━━━\n\n💭 Question: {question}\n\n😆: Vrai\n😮: Faux\n\nRéagissez avec les émojis\n⏰ 30 secondes pour répondre",      
      correctMessage: "🎉 Bonne réponse !\n━━━━━━━━━━\n\n✅ Score: {correct}/{total}\n🏆 Précision: {accuracy}%\n🔥 Série en cours: {streak}\n⚡ Temps de réponse: {time}s\n🎯 XP Gagné: +{xp}\n💰 Argent gagné: +{money}",      
      wrongMessage: "❌ Mauvaise réponse\n━━━━━━━━━━\n\n🎯 Bonne réponse: {correctAnswer}\n📊 Score: {correct}/{total}\n📈 Précision: {accuracy}%\n💔 Série réinitialisée",      
      timeoutMessage: "⏰ Temps écoulé ! Bonne réponse: {correctAnswer}",      
      achievementUnlocked: "🏆 Succès débloqué !\n{achievement}\n💰 +{bonus} pièces bonus !"    }  
  },  
  async safeStream(url) {    
    if (!url || !/^https?:\/\//i.test(url)) return null;    
    try {      
      const res = await axios.get(url, {        
        responseType: "stream",        
        timeout: 20000,        
        maxRedirects: 5,        
        headers: {          
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",          
          Accept: "image/avif,image/webp,image/*,*/*;q=0.8",          
          Referer: "https://www.google.com/"        }      });      
      const ext = (url.split("?")[0].split(".").pop() || "jpg").slice(0, 4);      
      res.data.path = `quiz_${Date.now()}.${ext}`;      
      return res.data;    } catch (e) {      
      console.error("Échec du téléchargement de l'image:", url, e.message);      
      try { return await global.utils.getStreamFromURL(url); } catch (e2) { return null; }    }  
  },  
  generateProgressBar(percentile) {    
    const filled = Math.round(percentile / 10);    
    const empty = 10 - filled;    
    return '█'.repeat(filled) + '░'.repeat(empty);  },  
  getUserTitle(correct) {    
    if (correct >= 50000) return '🌟 Quiz Omniscient';    
    if (correct >= 25000) return '👑 Quiz Divinité';    
    if (correct >= 15000) return '⚡ Quiz Titan';    
    if (correct >= 10000) return '🏆 Quiz Légende';    
    if (correct >= 7500) return '🎓 Grand Maître';    
    if (correct >= 5000) return '👨‍🎓 Maître du Quiz';    
    if (correct >= 2500) return '🔥 Expert Quiz';    
    if (correct >= 1500) return '📚 Savant Quiz';    
    if (correct >= 1000) return '🎯 Apprenti Quiz';    
    if (correct >= 750) return '🌟 Chercheur de Connaissances';    
    if (correct >= 500) return '📖 Apprenant Rapide';    
    if (correct >= 250) return '🚀 Étoile Montante';    
    if (correct >= 100) return '💡 Débutant';    
    if (correct >= 50) return '🎪 Premiers Pas';    
    if (correct >= 25) return '🌱 Nouveau Venu';    
    if (correct >= 10) return '🔰 Débutant';    
    if (correct >= 1) return '👶 Recrue';    
    return '🆕 Nouveau Joueur';  },  
  async getUserName(api, userId) {    
    try {      
      const userInfo = await api.getUserInfo(userId);      
      return userInfo[userId]?.name || 'Joueur Anonyme';    } catch (error) {      
      console.warn("Échec de récupération des infos utilisateur pour", userId, error);      
      return 'Joueur Anonyme';    }  },  
  async getAvailableCategories() {    
    try {      
      const res = await axios.get(`${BASE_URL}/categories`);      
      return res.data.map(cat => cat.toLowerCase());    } catch (error) {      
      console.error("Erreur lors de la récupération des catégories:", error);      
      return [];    }  },  
  onStart: async function ({ message, event, args, commandName, getLang, api, usersData }) {    
    try {      
      const command = args[0]?.toLowerCase();      
      if (!args[0] || command === "help") {        
        return await this.handleDefaultView(message, getLang);      }      
      switch (command) {        
        case "rank":        
        case "profile":          
          return await this.handleRank(message, event, getLang, api, usersData);        
        case "leaderboard":        
        case "lb":          
          return await this.handleLeaderboard(message, getLang, args.slice(1), api);        
        case "category":          
          if (args.length > 1) {            
            return await this.handleCategoryLeaderboard(message, getLang, args.slice(1), api);          }          
          return await this.handleCategories(message, getLang);        
        case "daily":          
          return await this.handleDailyChallenge(message, event, commandName, api);        
        case "torf":          
          return await this.handleTrueOrFalse(message, event, commandName, api);        
        case "flag":          
          return await this.handleFlagQuiz(message, event, commandName, api);        
        case "anime":          
          return await this.handleAnimeQuiz(message, event, commandName, api);        
        case "cartoon":        
        case "dessin":        
        case "dessins":        
        case "kids":          
          return await this.handleImageQuiz(message, event, commandName, "cartoon", "📺 Quiz Dessins Animés");        
        case "animaux":        
        case "animal":          
          return await this.handleImageQuiz(message, event, commandName, "animaux", "🐾 Quiz Animaux");        
        case "monument":        
        case "monuments":          
          return await this.handleImageQuiz(message, event, commandName, "monument", "🏛️ Quiz Monuments");        
        case "sport":        
        case "sports":          
          return await this.handleImageQuiz(message, event, commandName, "sport", "⚽ Quiz Sport");        
        case "cinema":        
        case "film":        
        case "films":          
          return await this.handleImageQuiz(message, event, commandName, "cinema", "🎬 Quiz Cinéma");        
        case "hard":          
          return await this.handleQuiz(message, event, ["general"], commandName, getLang, api, usersData, "hard");        
        case "medium":          
          return await this.handleQuiz(message, event, ["general"], commandName, getLang, api, usersData, "medium");        
        case "easy":          
          return await this.handleQuiz(message, event, ["general"], commandName, getLang, api, usersData, "easy");        
        case "random":          
          return await this.handleQuiz(message, event, [], commandName, getLang, api, usersData);        
        default:          
          const categories = await this.getAvailableCategories();          
          if (categories.includes(command)) {            
            return await this.handleQuiz(message, event, [command], commandName, getLang, api, usersData);          } else {            
            return await this.handleDefaultView(message, getLang);          }      }    } catch (err) {      
      console.error("Erreur de démarrage du quiz:", err);      
      return message.reply(fonts.christus("⚠️ Une erreur est survenue, réessayez."));    }  },  
  async handleDefaultView(message, getLang) {    
    try {      
      const res = await axios.get(`${BASE_URL}/categories`);      
      const categories = res.data;      
      const catText = categories.map(c => {        
        const icons = {          
          anime: '🎌', flag: '🏁', cartoon: '📺', animaux: '🐾',          
          monument: '🏛️', sport: '⚽', science: '🔬', histoire: '📖',          
          cinema: '🎬', geographie: '🌍', maths: '➗', culture: '🎭',          
          torf: '⚖️', general: '🎯'        };        
        return `${icons[c] || '📍'} ${c.charAt(0).toUpperCase() + c.slice(1)}`;      }).join("\n");      
      
      const title = fonts.bold("🎯 Quiz\n━━━━━━━━\n\n");
      const content = fonts.christus(      
                  `📚 Catégories (${categories.length})\n\n${catText}\n\n` +        
                  `━━━━━━━━━\n\n` +        
                  `🏆 Utilisation\n` +        
                  `• quiz rank - Voir votre classement\n` +        
                  `• quiz leaderboard - Voir le classement global\n` +        
                  `• quiz torf - Jouer au quiz Vrai/Faux\n` +        
                  `• quiz flag - Jouer au quiz des drapeaux\n` +        
                  `• quiz anime - Jouer au quiz anime\n` +        
                  `• quiz cartoon - Jouer au quiz dessins animés\n` +        
                  `• quiz animaux - Jouer au quiz animaux\n` +        
                  `• quiz monument - Jouer au quiz monuments\n` +        
                  `• quiz sport - Jouer au quiz sport\n\n` +        
                  `🎮 Utilisez: quiz <catégorie> pour commencer le quiz`);      
      return message.reply(title + content);    } catch (err) {      
      console.error("Erreur de la vue par défaut:", err);      
      return message.reply(fonts.christus("⚠️ Impossible de récupérer les catégories. Essayez 'quiz help' pour les commandes."));    }  },  
  async handleRank(message, event, getLang, api, usersData) {    
    try {      
      const userName = await this.getUserName(api, event.senderID);      
      await axios.post(`${BASE_URL}/user/update`, {        
        userId: event.senderID,        
        name: userName      });      
      const res = await axios.get(`${BASE_URL}/user/${event.senderID}`);      
      const user = res.data;      
      if (!user || user.total === 0) {        
        return message.reply(fonts.christus(`❌ Vous n'avez pas encore joué de quiz ! Utilisez 'quiz random' pour commencer.\n👤 Bienvenue, ${userName} !`));      }      
      const position = user.position ?? "N/A";      
      const totalUser = user.totalUsers ?? "N/A";      
      const progressBar = this.generateProgressBar(user.percentile ?? 0);      
      const titleName = this.getUserTitle(user.correct || 0);      
      const streakInfo = user.currentStreak > 0 ?         
        `🔥 Série en cours: ${user.currentStreak}${user.currentStreak >= 5 ? ' 🚀' : ''}` :        
        `🔥 Série en cours: 0`;      
      const bestStreakInfo = user.bestStreak > 0 ?        
        `🏅 Meilleure série: ${user.bestStreak}${user.bestStreak >= 10 ? ' 👑' : user.bestStreak >= 5 ? ' ⭐' : ''}` :        
        `🏅 Meilleure série: 0`;      
      const userData = await usersData.get(event.senderID) || {};      
      const userMoney = userData.money || 0;      
      const currentXP = user.xp ?? 0;      
      const xpTo1000 = Math.max(0, 1000 - currentXP);      
      const xpProgress = Math.min(100, (currentXP / 1000) * 100);      
      const xpProgressBar = this.generateProgressBar(xpProgress);      
      
      const title = fonts.bold("🎮 Profil Quiz\n━━━━━━━━━\n\n");
      const content = fonts.christus(      
                  `👤 ${userName}\n` +        
                  `🎖️ ${titleName}\n` +        
                  `🏆 Classement global: #${position}/${totalUser}\n` +        
                  `📈 Percentile: ${progressBar} ${user.percentile ?? 0}%\n\n` +        
                  `📊 Statistiques\n` +        
                  `✅ Bonnes réponses: ${user.correct ?? 0}\n` +        
                  `❌ Mauvaises réponses: ${user.wrong ?? 0}\n` +        
                  `📝 Total: ${user.total ?? 0}\n` +        
                  `🎯 Précision: ${user.accuracy ?? 0}%\n` +        
                  `⚡ Temps moyen de réponse: ${(user.avgResponseTime ?? 0).toFixed(1)}s\n\n` +        
                  `💰 Richesse & XP\n` +        
                  `💵 Argent: ${userMoney.toLocaleString()}\n` +        
                  `✨ XP: ${currentXP}/1000\n` +        
                  `🎯 XP restant pour 1000: ${xpTo1000}\n` +        
                  `${xpProgressBar} ${xpProgress.toFixed(1)}%\n\n` +        
                  `🔥 Info série\n` +        
                  `${streakInfo}\n` +        
                  `${bestStreakInfo}\n\n` +        
                  `🎯 Prochain objectif: ${user.nextMilestone || "Continuez à jouer !"}`);      
      return message.reply(title + content);    } catch (err) {      
      console.error("Erreur de classement:", err);      
      return message.reply(fonts.christus("⚠️ Impossible de récupérer le classement. Réessayez plus tard."));    }  },  
  async handleLeaderboard(message, getLang, args, api) {    
    try {      
      const page = parseInt(args?.[0]) || 1;      
      const sortBy = args?.[1] || 'correct';      
      const res = await axios.get(`${BASE_URL}/leaderboards?page=${page}&limit=8`);      
      const { rankings, stats, pagination } = res.data;      
      if (!rankings || rankings.length === 0) {        
        return message.reply(fonts.christus("🏆 Aucun joueur dans le classement. Commencez à jouer pour être le premier !"));      }      
      const now = new Date();      
      const currentDate = now.toLocaleDateString('fr-FR', {        
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'      });      
      const currentTime = now.toLocaleTimeString('fr-FR', {        
        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC'      });      
      const players = await Promise.all(rankings.map(async (u, i) => {        
        let userName = u.name || 'Joueur Anonyme';        
        if (u.userId && userName === 'Joueur Anonyme') {          
          try {            
            userName = await this.getUserName(api, u.userId);          
          } catch {            
            userName = u.name || 'Joueur Anonyme';          }        }        
        const position = (pagination.currentPage - 1) * 8 + i + 1;        
        const crown = position === 1 ? "👑" : position === 2 ? "🥈" : position === 3 ? "🥉" : position <= 10 ? "🏅" : "🎯";        
        const titleName = this.getUserTitle(u.correct || 0);        
        const level = u.level ?? Math.floor((u.correct || 0) / 50) + 1;        
        const xp = u.xp ?? (u.correct || 0) * 10;        
        const accuracy = u.accuracy ?? (u.total > 0 ? Math.round((u.correct / u.total) * 100) : 0);        
        const avgResponseTime = typeof u.avgResponseTime === 'number' ? `${u.avgResponseTime.toFixed(2)}s` : 'N/A';        
        const totalResponseTime = u.totalResponseTime?.toFixed(2) || '0';        
        const fastest = u.fastestResponse?.toFixed(2) || 'N/A';        
        const slowest = u.slowestResponse?.toFixed(2) || 'N/A';        
        const playTime = u.totalPlayTime ? `${(u.totalPlayTime / 60).toFixed(1)} min` : '0 min';        
        const games = u.gamesPlayed || u.total || 0;        
        const perfectGames = u.perfectGames || 0;        
        const joinDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : 'Inconnu';        
        return `${crown} #${position} ${userName}\n` +               
               `🎖️ ${titleName} | 🌟 Nv.${level} | ✨ XP: ${xp.toLocaleString()}\n` +               
               `📊 ${u.correct} ✅ / ${u.wrong} ❌ (Précision: ${accuracy}%)\n` +               
               `🔥 Série actuelle: ${u.currentStreak || 0} | 🏅 Meilleure série: ${u.bestStreak || 0}\n` +               
               `⚡ Temps moyen: ${avgResponseTime} | ⏱️ Temps total: ${totalResponseTime}s\n` +               
               `🚀 Plus rapide: ${fastest}s | 🐌 Plus lent: ${slowest}s\n` +               
               `🎯 Questions répondues: ${u.questionsAnswered} | Parties: ${games}\n` +               
               `🎮 Temps de jeu: ${playTime} | 📈 Parties parfaites: ${perfectGames}\n` +               
               `📅 Inscrit le: ${joinDate}`;      }));      
      
      const title = fonts.bold("🏆 Classement global\n━━━━━━━━━\n\n");
      const content = fonts.christus(      
                  `📅 ${currentDate}\n⏰ ${currentTime} UTC\n\n` +        
                  `━━━━━━━━━\n\n${players.join('\n\n')}\n\n` +        
                  `📖 Page ${pagination?.currentPage || 1}/${pagination?.totalPages || 1} | 👥 Total utilisateurs: ${stats?.totalUsers || 0}\n` +        
                  `🔄 Utilisez: quiz leaderboard <page> <tri>\n` +        
                  `📊 Options de tri: correct, accuracy, streak, level`);
      return message.reply(title + content);    } catch (err) {      
      console.error("Erreur du classement:", err);      
      return message.reply(fonts.christus("⚠️ Impossible de récupérer le classement. Le serveur est peut-être occupé, réessayez plus tard."));    }  },  
  async handleCategories(message, getLang) {    
    try {      
      const res = await axios.get(`${BASE_URL}/categories`);      
      const categories = res.data;      
      const icons = {        
        anime: '🎌', flag: '🏁', cartoon: '📺', animaux: '🐾',        
        monument: '🏛️', sport: '⚽', science: '🔬', histoire: '📖',        
        cinema: '🎬', geographie: '🌍', maths: '➗', culture: '🎭',        
        torf: '⚖️', general: '🎯'      };      
      const catText = categories.map(c =>         
        `${icons[c] || '📍'} ${c.charAt(0).toUpperCase() + c.slice(1)}`      ).join("\n");      
      
      const title = fonts.bold(`📚 Catégories du Quiz (${categories.length})\n━━━━━━━━\n\n`);
      const content = fonts.christus(      
                  `${catText}\n\n` +        
                  `🎯 Utilisez: quiz <catégorie>\n` +        
                  `🎲 Aléatoire: quiz random\n` +        
                  `🏆 Quotidien: quiz daily\n` +        
                  `🌟 Spéciaux: quiz torf, quiz flag, quiz anime, quiz cartoon\n` +        
                  `🐾 Quiz animaux: quiz animaux\n` +        
                  `🏛️ Quiz monuments: quiz monument\n` +        
                  `⚽ Quiz sport: quiz sport`);
      return message.reply(title + content);    } catch (err) {      
      console.error("Erreur des catégories:", err);      
      return message.reply(fonts.christus("⚠️ Impossible de récupérer les catégories."));    }  },  
  async handleDailyChallenge(message, event, commandName, api) {    
    try {      
      const res = await axios.get(`${BASE_URL}/challenge/daily?userId=${event.senderID}`);      
      const { question, challengeDate, reward, streak } = res.data;      
      const optText = question.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n");      
      
      const title = fonts.bold("🌟 Défi quotidien\n━━━━━━━━━\n\n");
      const content = fonts.christus(      
                  `📅 ${challengeDate}\n` +        
                  `🎯 Récompense bonus: +${reward} XP\n` +        
                  `🔥 Série quotidienne: ${streak}\n\n\n` +        
                  `❓ ${question.question}\n\n${optText}\n\n⏰ 30 secondes pour répondre !`);
      const info = await message.reply(title + content);      
      global.GoatBot.onReply.set(info.messageID, {        
        commandName,        
        author: event.senderID,        
        messageID: info.messageID,        
        answer: question.answer,        
        questionId: question._id,        
        startTime: Date.now(),        
        isDailyChallenge: true,        
        bonusReward: reward      });      
      setTimeout(() => {        
        const r = global.GoatBot.onReply.get(info.messageID);        
        if (r) {          
          message.reply(fonts.christus(`⏰ Temps écoulé ! La bonne réponse était: ${question.answer}`));          
          message.unsend(info.messageID);          
          global.GoatBot.onReply.delete(info.messageID);        }      }, 30000);    } catch (err) {      
      console.error("Erreur du défi quotidien:", err);      
      return message.reply(fonts.christus("⚠️ Impossible de créer le défi quotidien."));    }  },  
  async handleTrueOrFalse(message, event, commandName, api) {    
    try {      
      const res = await axios.get(`${BASE_URL}/question?category=torf&userId=${event.senderID}`);      
      const { _id, question, answer } = res.data;      
      const info = await message.reply(fonts.christus(this.langs.en.torfReply.replace("{question}", question)));      
      const correctAnswer = answer.toUpperCase();      
      global.GoatBot.onReaction.set(info.messageID, {        
        commandName,        
        author: event.senderID,        
        messageID: info.messageID,        
        answer: correctAnswer,        
        reacted: false,        
        reward: 10000,        
        questionId: _id,        
        startTime: Date.now()      });      
      setTimeout(() => {        
        const reaction = global.GoatBot.onReaction.get(info.messageID);        
        if (reaction && !reaction.reacted) {          
          const correctText = correctAnswer === "A" ? "Vrai" : "Faux";          
          message.reply(fonts.christus(this.langs.en.timeoutMessage.replace("{correctAnswer}", correctText)));          
          message.unsend(info.messageID);          
          global.GoatBot.onReaction.delete(info.messageID);        }      }, 30000);    } catch (err) {      
      console.error("Erreur Vrai/Faux:", err);      
      return message.reply(fonts.christus("⚠️ Impossible de créer la question Vrai/Faux."));    }  },  
  async handleFlagQuiz(message, event, commandName, api) {    
    try {      
      const res = await axios.get(`${BASE_URL}/question?category=flag&userId=${event.senderID}`, { timeout: 25000 });      
      const { _id, question, options, answer, imageUrl } = res.data;            
      if (!Array.isArray(options) || !options.length) {        
        return message.reply(fonts.christus("⚠️ Aucune question sur les drapeaux disponible pour le moment. Réessayez plus tard."));      }      
      const title = fonts.bold("🏁 Quiz drapeaux\n━━━━━━━━\n\n");
      const bodyText = fonts.christus(      
                       `🌍 Devinez le pays de ce drapeau :\n\n` +              
                       options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n") +              
                       `\n\n⏰ 30 secondes pour répondre.`);      
      const flagEmbed = {        
        body: title + bodyText,        
        attachment: imageUrl ? await this.safeStream(imageUrl) : null      };      
      const info = await message.reply(flagEmbed);      
      global.GoatBot.onReply.set(info.messageID, {        
        commandName,        
        author: event.senderID,        
        messageID: info.messageID,        
        answer,        
        options,        
        questionId: _id,        
        startTime: Date.now(),        
        isFlag: true,        
        reward: this.envConfig.flagReward || 10000      });      
      setTimeout(() => {        
        const r = global.GoatBot.onReply.get(info.messageID);        
        if (r) {          
          message.reply(fonts.christus(`⏰ Temps écoulé ! La bonne réponse était: ${answer}`));          
          message.unsend(info.messageID);          
          global.GoatBot.onReply.delete(info.messageID);        }      }, 30000);    } catch (err) {      
      console.error("Erreur du quiz drapeaux:", err);      
      const detail = err?.response?.data?.error || err.message || "erreur inconnue";      
      return message.reply(fonts.christus(`⚠️ Impossible de créer le quiz drapeaux.\n📄 Raison: ${detail}`));    }  },  
  async handleAnimeQuiz(message, event, commandName, api) {    
    try {      
      const res = await axios.get(`${BASE_URL}/question?category=anime&userId=${event.senderID}`, { timeout: 25000 });      
      const { _id, question, options, answer, imageUrl, hint } = res.data;            
      if (!Array.isArray(options) || !options.length) {        
        return message.reply(fonts.christus("⚠️ Aucune question anime disponible pour le moment. Réessayez plus tard."));      }      
      const title = fonts.bold("🎌 Quiz Anime\n━━━━━━━━\n\n");
      const bodyText = fonts.christus(      
                       `❔ Indice: ${hint || question}\n\n` +              
                       options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n") +              
                       `\n\n⏰ 30 secondes\n🎯 Défi de reconnaissance de personnage !`);      
      const animeEmbed = {        
        body: title + bodyText,        
        attachment: imageUrl ? await this.safeStream(imageUrl) : null      };      
      const info = await message.reply(animeEmbed);      
      global.GoatBot.onReply.set(info.messageID, {        
        commandName,        
        author: event.senderID,        
        messageID: info.messageID,        
        answer,        
        options,        
        questionId: _id,        
        startTime: Date.now(),        
        isAnime: true,        
        reward: this.envConfig.animeReward || 15000      });      
      setTimeout(() => {        
        const r = global.GoatBot.onReply.get(info.messageID);        
        if (r) {          
          message.reply(fonts.christus(`⏰ Temps écoulé ! La bonne réponse était: ${answer}\n🎌 Continuez à regarder des anime pour améliorer vos compétences !`));          
          message.unsend(info.messageID);          
          global.GoatBot.onReply.delete(info.messageID);        }      }, 30000);    } catch (err) {      
      console.error("Erreur du quiz anime:", err);      
      const detail = err?.response?.data?.error || err.message || "erreur inconnue";      
      return message.reply(fonts.christus(`⚠️ Impossible de créer le quiz anime.\n📄 Raison: ${detail}`));    }  },  
  async handleImageQuiz(message, event, commandName, category, titleText) {    
    try {      
      const res = await axios.get(`${BASE_URL}/question?category=${category}&userId=${event.senderID}`, { timeout: 25000 });      
      const { _id, question, options, answer, imageUrl, hint } = res.data;            
      if (!Array.isArray(options) || !options.length) {        
        return message.reply(fonts.christus(`⚠️ Aucune question « ${category} » disponible pour le moment. Réessayez plus tard.`));      }      
      const title = fonts.bold(`${titleText}\n━━━━━━━━\n\n`);
      const bodyText = fonts.christus(      
                       `❔ ${hint || question}\n\n` +        
                       options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join("\n") +        
                       `\n\n⏰ 30 secondes pour répondre (A/B/C/D)`);      
      const picture = imageUrl ? await this.safeStream(imageUrl) : null;      
      const info = await message.reply(picture ? { body: title + bodyText, attachment: picture } : { body: title + bodyText });      
      global.GoatBot.onReply.set(info.messageID, {        
        commandName,        
        author: event.senderID,        
        messageID: info.messageID,        
        answer,        
        options,        
        questionId: _id,        
        startTime: Date.now(),        
        isImage: true,        
        category,        
        reward: this.envConfig.imageReward || 12000      });      
      setTimeout(() => {        
        const r = global.GoatBot.onReply.get(info.messageID);        
        if (r) {          
          message.reply(fonts.christus(`⏰ Temps écoulé ! La bonne réponse était : ${answer}`));          
          message.unsend(info.messageID);          
          global.GoatBot.onReply.delete(info.messageID);        }      }, 30000);    } catch (err) {      
      console.error(`Erreur du quiz ${category}:`, err);      
      const detail = err?.response?.data?.error || err.message || "erreur inconnue";      
      return message.reply(fonts.christus(`⚠️ Impossible de créer le quiz ${category}.\n📄 Raison: ${detail}`));    }  },  
  async handleQuiz(message, event, args, commandName, getLang, api, usersData, forcedDifficulty = null) {    
    try {      
      const userName = await this.getUserName(api, event.senderID);      
      await axios.post(`${BASE_URL}/user/update`, {        
        userId: event.senderID,        
        name: userName      });      
      const category = args[0]?.toLowerCase() || "";      
      let queryParams = {        
        userId: event.senderID      };      
      if (category && category !== "random") {        
        queryParams.category = category;      }      
      if (forcedDifficulty) {        
        queryParams.difficulty = forcedDifficulty;      }      
      const res = await axios.get(`${BASE_URL}/question`, { params: queryParams });      
      const { _id, question, options, answer, category: qCategory, difficulty, imageUrl, hint } = res.data;      
      const optText = options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n");      
      const title = fonts.bold("🎯 Quiz Challenge\n━━━━━━━━━━\n\n");
      const content = fonts.christus(      
        `📚 Catégorie: ${qCategory?.charAt(0).toUpperCase() + qCategory?.slice(1) || "Aléatoire"}\n` +        
        `🎚️ Difficulté: ${difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1) || "Moyen"}\n` +        
        `❓ Question: ${hint || question}\n\n` +        
        `${optText}\n\n` +        
        `⏰ Vous avez 30 secondes pour répondre (A/B/C/D):`);      
      const picture = imageUrl ? await this.safeStream(imageUrl) : null;      
      const info = await message.reply(picture ? { body: title + content, attachment: picture } : { body: title + content });      
      global.GoatBot.onReply.set(info.messageID, {        
        commandName,        
        author: event.senderID,        
        messageID: info.messageID,        
        answer,        
        options,        
        questionId: _id,        
        startTime: Date.now(),        
        difficulty,        
        category: qCategory,        
        isImage: !!imageUrl      });      
      setTimeout(() => {        
        const r = global.GoatBot.onReply.get(info.messageID);        
        if (r) {          
          message.reply(fonts.christus(getLang("timeoutMessage").replace("{correctAnswer}", answer)));          
          message.unsend(info.messageID);          
          global.GoatBot.onReply.delete(info.messageID);        }      }, 30000);    } catch (err) {      
      console.error("Erreur du quiz:", err);      
      message.reply(fonts.christus("⚠️ Impossible de récupérer une question. Essayez 'quiz categories' pour voir les options disponibles."));    }  },  
  async handleCategoryLeaderboard(message, getLang, args, api) {    
    try {      
      const category = args[0]?.toLowerCase();      
      if (!category) {        
        return message.reply(fonts.christus("📚 Veuillez spécifier une catégorie pour voir le classement."));      }      
      const page = parseInt(args[1]) || 1;      
      const res = await axios.get(`${BASE_URL}/leaderboard/category/${category}?page=${page}&limit=10`);      
      const { users, pagination } = res.data;      
      if (!users || users.length === 0) {        
        return message.reply(fonts.christus(`🏆 Aucun joueur trouvé pour la catégorie: ${category}.`));      }      
      const topPlayersWithNames = await Promise.all(users.map(async (u, i) => {        
        let userName = 'Joueur Anonyme';        
        if (u.userId) {          
          userName = await this.getUserName(api, u.userId);        }        
        const position = (pagination.currentPage - 1) * 10 + i + 1;        
        const crown = position === 1 ? "👑" : position === 2 ? "🥈" : position === 3 ? "🥉" : "🏅";        
        const titleName = this.getUserTitle(u.correct || 0);        
        return `${crown} #${position} ${userName}\n🎖️ ${titleName}\n📊 ${u.correct || 0}/${u.total || 0} (${u.accuracy || 0}%)`;      }));      
      const topPlayers = topPlayersWithNames.join('\n\n');      
      const title = fonts.bold(`🏆 Classement: ${category.charAt(0).toUpperCase() + category.slice(1)}\n━━━━━━━━━\n\n`);
      const content = fonts.christus(      
                  `${topPlayers}\n\n` +        
                  `📖 Page ${pagination.currentPage}/${pagination.totalPages}\n` +        
                  `👥 Total joueurs: ${pagination.totalUsers}`);
      return message.reply(title + content);    } catch (err) {      
      console.error("Erreur du classement par catégorie:", err);      
      return message.reply(fonts.christus("⚠️ Impossible de récupérer le classement de la catégorie."));    }  },  
  onReaction: async function ({ message, event, Reaction, api, usersData }) {    
    try {      
      const { author, messageID, answer, reacted, reward } = Reaction;      
      if (event.userID !== author || reacted) return;      
      const userAnswer = event.reaction === '😆' ? "A" : "B";       
      const isCorrect = userAnswer === answer;      
      const timeSpent = (Date.now() - Reaction.startTime) / 1000;      
      if (timeSpent > 30) {        
        return message.reply(fonts.christus("⏰ Temps écoulé !"));      }      
      const userName = await this.getUserName(api, event.userID);      
      const answerData = {        
        userId: event.userID,        
        questionId: Reaction.questionId,        
        answer: userAnswer,        
        timeSpent,        
        userName      };      
      try {        
        const res = await axios.post(`${BASE_URL}/answer`, answerData);        
        const { user, xpGained } = res.data;        
        const userData = await usersData.get(event.userID) || {};        
        if (isCorrect) {          
          const baseMoneyReward = 10000;          
          const streakBonus = (user.currentStreak || 0) * 1000;          
          const totalMoneyReward = baseMoneyReward + streakBonus;          
          userData.money = (userData.money || 0) + totalMoneyReward;          
          await usersData.set(event.userID, userData);          
          const correctText = answer === "A" ? "Vrai" : "Faux";          
          const torfSuccessMessages = [            
            "🎯 ABSOLUMENT VRAI ! Vous êtes un génie ! ✨",            
            "⚡ PARFAIT ! Maître du Vrai/Faux ! 🏆",            
            "🔥 FANTASTIQUE ! Vous avez réussi ! 🎯",            
            "🌟 BRAVO ! Simple mais efficace ! ⭐",            
            "🎊 EXCELLENT ! Rapide et correct ! 🚀"          ];          
          const randomTorfMsg = torfSuccessMessages[Math.floor(Math.random() * torfSuccessMessages.length)];          
          let streakMessage = "";          
          const streak = user.currentStreak || 0;          
          if (streak >= 5) streakMessage = "\n🔥 Série amazingne ! Continuez ainsi ! 🚀";          
          const successMsg = fonts.christus(            
            `${randomTorfMsg}\n` +            
            `━━━━━━━━━\n\n` +            
            `🎉 Félicitations, ${userName} ! 🎉\n\n` +            
            `💰 Argent gagné: +${totalMoneyReward.toLocaleString()} 💎\n` +            
            `✨ XP gagné: +${xpGained || 15} ⚡\n` +            
            `🔥 Série: ${user.currentStreak || 0} 🚀\n` +            
            `⏱️ Temps: ${timeSpent.toFixed(1)}s` + streakMessage +            
            `\n\n🎯 Maître du Vrai/Faux ! Continuez ainsi ! 🌟`);          
          message.reply(successMsg);        } else {          
          const correctText = answer === "A" ? "Vrai" : "Faux";          
          const torfWrongMessages = [            
            "💔 Ooh ! Le Vrai/Faux peut être difficile ! 🤔",            
            "🌱 Oups ! Ce n'est pas grave, continuez d'apprendre ! 📚",            
            "🔄 Pas totalement ! Parfois c'est une question de chance ! 🎲",            
            "⭐ Faux ! La pratique rend perfect ! 💪",            
            "💫 Raté ! Même les maîtres ratent parfois ! 🌟"          ];          
          const randomTorfWrongMsg = torfWrongMessages[Math.floor(Math.random() * torfWrongMessages.length)];          
          const wrongMsg = fonts.christus(            
            `${randomTorfWrongMsg}\n` +            
            `━━━━━━━━━\n\n` +            
            `🎯 Bonne réponse: ${correctText} ✅\n` +            
            `👤 ${userName}\n` +            
            `💔 Série réinitialisée\n\n` +            
            `🔥 Prochaine question bientôt ! Allez, vous pouvez le faire ! 🚀`);          
          message.reply(wrongMsg);        }      } catch (error) {        
        console.error("Erreur lors de la mise à jour du score:", error);      }      
      global.GoatBot.onReaction.get(messageID).reacted = true;      
      setTimeout(() => global.GoatBot.onReaction.delete(messageID), 1000);    } catch (err) {      
      console.error("Erreur de réaction au quiz:", err);    }  },  
  onReply: async function ({ message, event, Reply, getLang, api, usersData }) {    
    if (Reply.author !== event.senderID) return;    
    try {      
      const ans = event.body.trim().toUpperCase();      
      if (!["A", "B", "C", "D"].includes(ans)) {        
        return message.reply(fonts.christus("❌ Veuillez répondre avec A, B, C ou D uniquement !"));      }      
      const timeSpent = (Date.now() - Reply.startTime) / 1000;      
      if (timeSpent > 30) {        
        return message.reply(fonts.christus("⏰ Temps écoulé !"));      }      
      const userName = await this.getUserName(api, event.senderID);      
      let correctAnswer = Reply.answer;      
      let userAnswer = ans;      
      if ((Reply.isFlag || Reply.isAnime || Reply.isImage) && Reply.options) {        
        const optionIndex = ans.charCodeAt(0) - 65;        
        if (optionIndex >= 0 && optionIndex < Reply.options.length) {          
          userAnswer = Reply.options[optionIndex];        }      }      
      const answerData = {        
        userId: event.senderID,        
        questionId: Reply.questionId,        
        answer: userAnswer,        
        timeSpent,        
        userName      };      
      const res = await axios.post(`${BASE_URL}/answer`, answerData);      
      if (!res.data) {        
        throw new Error('Aucune donnée de réponse reçue');      }      
      const { result, user } = res.data;      
      let responseMsg;      
      if (result === "correct") {        
        const userData = await usersData.get(event.senderID) || {};        
        let baseMoneyReward = 10000;        
        if (Reply.difficulty === 'hard') baseMoneyReward = 15000;        
        if (Reply.difficulty === 'easy') baseMoneyReward = 7500;        
        if (Reply.isFlag) baseMoneyReward = 12000;        
        if (Reply.isAnime) baseMoneyReward = 15000;        
        if (Reply.isImage) baseMoneyReward = 12000;        
        if (Reply.isDailyChallenge) baseMoneyReward = 20000;        
        const streakBonus = (user.currentStreak || 0) * 1000;        
        const totalMoneyReward = baseMoneyReward + streakBonus;        
        userData.money = (userData.money || 0) + totalMoneyReward;        
        await usersData.set(event.senderID, userData);        
        const difficultyBonus = Reply.difficulty === 'hard' ? ' 🔥' : Reply.difficulty === 'easy' ? ' ⭐' : '';        
        const streakBonus2 = (user.currentStreak || 0) >= 5 ? ` 🚀 ${user.currentStreak}x série !` : '';        
        const flagBonus = Reply.isFlag ? ' 🏁' : '';        
        const animeBonus = Reply.isAnime ? ' 🎌' : '';        
        const imageBonus = Reply.isImage ? ' 🖼️' : '';        
        const dailyBonus = Reply.isDailyChallenge ? ' 🌟' : '';        
        responseMsg = fonts.christus(          
          `🎉 Bonne réponse ! 💰\n` +          
          `💵 Argent: +${totalMoneyReward.toLocaleString()}\n` +          
          `✨ XP: +${user.xpGained || 15}\n` +          
          `📊 Score: ${user.correct || 0}/${user.total || 0} (${user.accuracy || 0}%)\n` +          
          `🔥 Série: ${user.currentStreak || 0}\n` +          
          `⚡ Temps de réponse: ${timeSpent.toFixed(1)}s\n` +          
          `🎯 Progression XP: ${user.xp || 0}/1000\n` +          
          `👤 ${userName}` + difficultyBonus + streakBonus2 + flagBonus + animeBonus + imageBonus + dailyBonus);      } else {        
        responseMsg = fonts.christus(          
          `❌ Mauvaise réponse ! Bonne réponse: ${correctAnswer}\n` +          
          `📊 Score: ${user.correct || 0}/${user.total || 0} (${user.accuracy || 0}%)\n` +          
          `💔 Série réinitialisée\n` +          
          `👤 ${userName}` + (Reply.isFlag ? ' 🏁' : '') + (Reply.isAnime ? ' 🎌' : '') + (Reply.isImage ? ' 🖼️' : ''));      }      
      await message.reply(responseMsg);      
      if (user.achievements && user.achievements.length > 0) {        
        const achievementMsg = user.achievements.map(ach => `🏆 ${ach}`).join('\n');        
        await message.reply(fonts.christus(`🏆 Succès débloqué !\n${achievementMsg}\n💰 +50,000 pièces bonus !\n✨ +100 XP bonus !`));        
        const userData = await usersData.get(event.senderID) || {};        
        userData.money = (userData.money || 0) + 50000;        
        await usersData.set(event.senderID, userData);      }      
      message.unsend(Reply.messageID);      
      global.GoatBot.onReply.delete(Reply.messageID);    } catch (err) {      
      console.error("Erreur de réponse:", err);      
      const errorMsg = err.response?.data?.error || err.message || "Erreur inconnue";      
      message.reply(fonts.christus(`⚠️ Erreur lors du traitement de votre réponse: ${errorMsg}`));    }  },  
  envConfig: {    
    reward: 10000,    
    achievementReward: 50000,    
    streakReward: 1000,    
    flagReward: 12000,    
    animeReward: 15000,    
    imageReward: 12000,    
    dailyChallengeBonus: 20000,    
    hardDifficultyReward: 15000,    
    easyDifficultyReward: 7500  }
};
