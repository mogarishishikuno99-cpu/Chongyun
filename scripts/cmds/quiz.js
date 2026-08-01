const axios = require('axios');
const BASE_URL = 'https://qizapi.onrender.com/api';

module.exports = {
  config: {
    name: "quiz",
    aliases: ["q"],
    version: "3.1",
    author: "Christus",
    countDown: 0,
    role: 0,
    longDescription: {
      en: "Advanced quiz game with social features, multiplayer, achievements, and comprehensive analytics"
    },
    category: "game",
    guide: {
      en: "{pn} <category>"
    }
  },
  langs: {
    en: {
      reply: "🎯 𝗤𝘂𝗶𝘇\n━━━━━━━━━━\n\n📚 𝖢𝖺𝗍é𝗀𝗈𝗋𝗂𝖾 : {category}\n🎚️ 𝖣𝗂𝖿𝖿𝗂𝖼𝗎𝗅𝗍é : {difficulty}\n❓ 𝖰𝗎𝖾𝗌𝗍𝗂𝗈𝗇 : {question}\n\n{options}\n\n⏰ 𝖵𝗈𝗎𝗌 𝖺𝗏𝖾𝗓 30 𝗌𝖾𝖼𝗈𝗇𝖽𝖾𝗌 𝘱𝘰𝘶𝘳 𝘳é𝘱𝘰𝘯𝘥𝘳𝘦 (A/B/C/D) :",
      torfReply: "⚙ 𝗤𝘂𝗶𝘇 ( 𝖵𝗋𝖺𝗂 / 𝖥𝖺𝗎𝗑 )\n━━━━━━━━━━\n\n💭 𝖰𝗎𝖾𝗌𝗍𝗂𝗈𝗇 : {question}\n\n😆 : Vrai\n😮 : Faux\n\n𝗥é𝘢𝘨𝘪𝘴𝘴𝘦𝘻 𝘢𝘷𝘦𝘤 𝘭𝘦𝘴 é𝘮𝘰𝘫𝘪𝘴\n⏰ 30 secondes pour répondre",
      correctMessage: "🎉 𝗥é𝗽𝗼𝗻𝘀𝗲 𝗖𝗼𝗿𝗿𝗲𝗰𝘁𝗲 !\n━━━━━━━━━━\n\n✅ 𝖲𝖼𝗈𝗋𝖾 : {correct}/{total}\n🏆 𝖯é𝗋𝗂𝗆è𝗍𝗋𝖾 : {accuracy}%\n🔥 𝖲𝗍𝗋𝖾𝖺𝗄 𝘢𝗰𝘁𝘶𝘦𝘭 : {streak}\n⚡ 𝖳𝖾𝗆𝘱𝗌 : {time}s\n🎯 𝖃𝗤 𝖦𝖺𝗴𝗻é : +{xp}\n💰 𝖠𝗋𝗴𝖾𝗻𝗍 : +{money}",
      wrongMessage: "❌ 𝗥é𝗽𝗼𝗻𝘀𝗲 𝗜𝗻𝗰𝗼𝗿𝗿𝗲𝗰𝘁𝗲\n━━━━━━━━━━\n\n🎯 𝖢𝗈𝗋𝗋𝖾𝖼𝗍𝖾 : {correctAnswer}\n📊 𝖲𝖼𝗈𝗋𝖾 : {correct}/{total}\n📈 𝖯𝗋é𝘤𝘪𝘴𝘪𝘰𝘯 : {accuracy}%\n💔 𝖲𝗍𝗋𝖾𝖺𝗄 𝖱é𝗌𝖾𝗍",
      timeoutMessage: "⏰ 𝖳𝖾𝗆𝘱𝗌 é𝚌𝗼𝘶𝗹é ! 𝖱é𝘱𝗼𝗻𝘀𝗲 𝗰𝗼𝗿𝗿𝗲𝗰𝘁𝗲 : {correctAnswer}",
      achievementUnlocked: "🏆 𝗔𝗰𝗵𝗶è𝘷𝘦𝘮𝘦𝗻𝘁 Déverrouillé !\n{achievement}\n💰 +{bonus} pièces bonus !"
    }
  },
  generateProgressBar(percentile) {
    const filled = Math.round(percentile / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  },
  getUserTitle(correct) {
    if (correct >= 50000) return '🌟 Quiz Omniscient';
    if (correct >= 25000) return '👑 Quiz Deity';
    if (correct >= 15000) return '⚡ Quiz Titan';
    if (correct >= 10000) return '🏆 Quiz Legend';
    if (correct >= 7500) return '🎓 Grandmaster';
    if (correct >= 5000) return '👨‍🎓 Quiz Master';
    if (correct >= 2500) return '🔥 Quiz Expert';
    if (correct >= 1500) return '📚 Quiz Scholar';
    if (correct >= 1000) return '🎯 Quiz Apprentice';
    if (correct >= 750) return '🌟 Knowledge Seeker';
    if (correct >= 500) return '📖 Quick Learner';
    if (correct >= 250) return '🚀 Rising Star';
    if (correct >= 100) return '💡 Getting Started';
    if (correct >= 50) return '🎪 First Steps';
    if (correct >= 25) return '🌱 Newcomer';
    if (correct >= 10) return '🔰 Beginner';
    if (correct >= 1) return '👶 Rookie';
    return '🆕 New Player';
  },
  async getUserName(api, userId) {
    try {
      const userInfo = await api.getUserInfo(userId);
      return userInfo[userId]?.name || 'Anonymous Player';
    } catch (error) {
      console.warn("User info fetch failed for", userId, error);
      return 'Anonymous Player';
    }
  },
  async getAvailableCategories() {
    try {
      const res = await axios.get(`${BASE_URL}/categories`);
      return res.data.map(cat => cat.toLowerCase());
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
  onStart: async function ({ message, event, args, commandName, getLang, api, usersData }) {
    try {
      const command = args[0]?.toLowerCase();
      if (!args[0] || command === "help") {
        return await this.handleDefaultView(message, getLang);
      }
      switch (command) {
        case "rank":
        case "profile":
          return await this.handleRank(message, event, getLang, api, usersData);
        case "leaderboard":
        case "lb":
          return await this.handleLeaderboard(message, getLang, args.slice(1), api);
        case "category":
          if (args.length > 1) {
            return await this.handleCategoryLeaderboard(message, getLang, args.slice(1), api);
          }
          return await this.handleCategories(message, getLang);
        case "daily":
          return await this.handleDailyChallenge(message, event, commandName, api);
        case "torf":
          return await this.handleTrueOrFalse(message, event, commandName, api);
        case "flag":
          return await this.handleFlagQuiz(message, event, commandName, api);
        case "anime":
          return await this.handleAnimeQuiz(message, event, commandName, api);
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
            return await this.handleQuiz(message, event, [command], commandName, getLang, api, usersData);
          } else {
            return await this.handleDefaultView(message, getLang);
          }
      }
    } catch (err) {
      console.error("Quiz start error:", err);
      return message.reply("⚠️ Une erreur est survenue, réessayez.");
    }
  },
  async handleDefaultView(message, getLang) {
    try {
      const res = await axios.get(`${BASE_URL}/categories`);
      const categories = res.data;
      const catText = categories.map(c => `📍 𝖢𝖺𝗍é𝗀𝗈𝗋𝗂𝖾 : ${c.charAt(0).toUpperCase() + c.slice(1)}`).join("\n");
      return message.reply(
        `🎯 𝗤𝘂𝗶𝘇\n━━━━━━━━\n\n` +
        `📚 𝗖𝗮𝘁é𝗴𝗼𝗿𝗶𝗲𝘀\n\n${catText}\n\n` +
        `━━━━━━━━━\n\n` +
        `🏆 𝗨𝘁𝗶𝗹𝗶𝘀𝗮𝘁𝗶𝗼𝗻\n` +
        `• 𝗊𝗎𝗂𝗓 𝗋𝖺𝗇𝗄 - 𝗩𝗈𝗂𝗋 𝗏𝗈𝗍𝗋𝖾 𝖼𝗅𝖺𝗌𝗌𝖾𝗆𝖾𝗇𝗍\n` +
        `• 𝗊𝗎𝗂𝗓 𝗅𝖾𝖺𝖽𝖾𝗋𝖻𝗈𝖺𝗋𝖽 - 𝗩𝗈𝗂𝗋 𝗅𝖾 𝖼𝗅𝖺𝗌𝗌𝖾𝗆𝖾𝗇𝗍 𝘨𝘭𝘰𝘣𝘢𝘭\n` +
        `• 𝗊𝗎𝗂𝗓 𝗍𝗈𝗋𝖿 - 𝗝𝗈𝗎𝖾𝗋 𝖺𝗎 𝗊𝗎𝗂𝗓 𝗩𝗋𝖺𝗂/𝗙𝖺𝗎𝗑\n` +
        `• 𝗊𝗎𝗂𝗓 𝘧𝘭𝘢𝘨 - 𝗝𝗈𝗎𝖾𝗋 𝖺𝗎 𝗊𝗎𝗂𝗓 𝖽𝖾𝗌 𝖽𝗋𝖺𝘱𝘦𝘢𝘶𝘹\n` +
        `• 𝗊𝗎𝗂𝗓 𝘢𝘯𝘪𝘮𝘦 - 𝗝𝗈𝗎𝖾𝗋 𝖺𝗎 𝗊𝗎𝗂𝗓 𝘢𝘯𝘪𝘮é\n\n` +
        `🎮 𝖴𝗍𝗂𝗅𝗂𝗌𝘦𝗓 : 𝗊𝗎𝗂𝗓 <𝖼𝖺𝗍é𝘨𝘰𝘳𝘪𝘦> 𝘱𝘰𝘶𝘳 𝗰𝗼𝗺𝗺𝗲𝗻𝗰𝗲𝗿`
      );
    } catch (err) {
      console.error("Default view error:", err);
      return message.reply("⚠️ Impossible de récupérer les catégories.");
    }
  },
  async handleRank(message, event, getLang, api, usersData) {
    try {
      const userName = await this.getUserName(api, event.senderID);
      await axios.post(`${BASE_URL}/user/update`, {
        userId: event.senderID,
        name: userName
      });
      const res = await axios.get(`${BASE_URL}/user/${event.senderID}`);
      const user = res.data;
      if (!user || user.total === 0) {
        return message.reply(`❌ Vous n'avez encore joué à aucun quiz ! Utilisez 'quiz random' pour commencer.\n👤 Bienvenue, ${userName} !`);
      }
      const position = user.position ?? "N/A";
      const totalUser = user.totalUsers ?? "N/A";
      const progressBar = this.generateProgressBar(user.percentile ?? 0);
      const title = this.getUserTitle(user.correct || 0);
      const streakInfo = user.currentStreak > 0 ?
         `🔥 𝖲𝗍𝗿𝗲𝗮𝗸 𝘢𝘤𝘵𝘶𝘦𝘭 : ${user.currentStreak}${user.currentStreak >= 5 ? ' 🚀' : ''}` :
        `🔥 𝖲𝗍𝗿𝗲𝗮𝗸 𝘢𝘤𝘵𝘶𝘦𝘭 : 0`;
      const bestStreakInfo = user.bestStreak > 0 ?
        `🏅 𝗠𝗲𝗶𝗹𝗹𝗲𝘂𝗿 𝗦𝘁𝗿𝗲𝗮𝗸 : ${user.bestStreak}${user.bestStreak >= 10 ? ' 👑' : user.bestStreak >= 5 ? ' ⭐' : ''}` :
        `🏅 𝗠𝗲𝗶𝗹𝗹𝗲𝘂𝗿 𝗦𝘁𝗿𝗲𝗮𝗸 : 0`;
      const userData = await usersData.get(event.senderID) || {};
      const userMoney = userData.money || 0;
      const currentXP = user.xp ?? 0;
      const xpTo1000 = Math.max(0, 1000 - currentXP);
      const xpProgress = Math.min(100, (currentXP / 1000) * 100);
      const xpProgressBar = this.generateProgressBar(xpProgress);
      return message.reply(
        `🎮 𝗤𝘂𝗶𝘇 𝗣𝗿𝗼𝗳𝗶𝗹\n━━━━━━━━━\n\n` +
        `👤 ${userName}\n` +
        `🎖️ ${title}\n` +
        `🏆 𝖱𝖺𝗇𝗄 𝖦𝗅𝗈𝖻𝖺𝗅 : #${position}/${totalUser}\n` +
        `📈 𝖯é𝗋𝗂𝗆è𝗍𝗋𝖾 : ${progressBar} ${user.percentile ?? 0}%\n\n` +
        `📊 𝗦𝘁𝗮𝘁𝗶𝘀𝘁𝗶𝗾𝘂𝗲𝘀\n` +
        `✅ 𝖢𝗈𝗋𝗋𝖾𝖼𝗍𝖾𝗌 : ${user.correct ?? 0}\n` +
        `❌ 𝖬𝗮𝘶𝘷𝗮𝗶𝘀𝗲𝘀 : ${user.wrong ?? 0}\n` +
        `📝 𝖳𝗈𝗍𝖺𝗅 : ${user.total ?? 0}\n` +
        `🎯 𝖯𝗋é𝘤𝘪𝘴𝘪𝘰𝘯 : ${user.accuracy ?? 0}%\n` +
        `⚡ 𝖳𝖾𝗆𝘱𝗌 𝘮𝘰𝘺𝘦𝘯 : ${(user.avgResponseTime ?? 0).toFixed(1)}s\n\n` +
        `💰 𝖱𝘦𝘤𝘩𝘦𝘴𝘴𝘦 & 𝗫𝗣\n` +
        `💵 𝖠𝗋𝗴𝖾𝗻𝗍 : ${userMoney.toLocaleString()}\n` +
        `✨ 𝖃𝗤 : ${currentXP}/1000\n` +
        `${xpProgressBar} ${xpProgress.toFixed(1)}%\n\n` +
        `${streakInfo}\n${bestStreakInfo}`
      );
    } catch (err) {
      console.error("Rank error:", err);
      return message.reply("⚠️ Impossible de récupérer le classement.");
    }
  },
  async handleLeaderboard(message, getLang, args, api) {
    try {
      const page = parseInt(args?.[0]) || 1;
      const res = await axios.get(`${BASE_URL}/leaderboards?page=${page}&limit=8`);
      const { rankings, stats, pagination } = res.data;
      if (!rankings || rankings.length === 0) {
        return message.reply("🏆 Aucun joueur trouvé. Soyez le premier à jouer !");
      }
      const players = await Promise.all(rankings.map(async (u, i) => {
        let userName = u.name || 'Anonymous Player';
        if (u.userId && userName === 'Anonymous Player') {
          try {
            userName = await this.getUserName(api, u.userId);
          } catch {
            userName = u.name || 'Anonymous Player';
          }
        }
        const position = (pagination.currentPage - 1) * 8 + i + 1;
        const crown = position === 1 ? "👑" : position === 2 ? "🥈" : position === 3 ? "🥉" : "🎯";
        const title = this.getUserTitle(u.correct || 0);
        return `${crown} #${position} ${userName}\n🎖️ ${title} | 📊 ${u.correct} ✅ / ${u.wrong} ❌ (Précision : ${u.accuracy || 0}%)`;
      }));
      return message.reply(
        `🏆 𝗖𝗹𝗮𝘀𝘀𝗲𝗺𝗲𝗻𝘁 𝗚𝗹𝗼𝗯𝗮𝗹\n━━━━━━━━━\n\n${players.join('\n\n')}\n\n` +
        `📖 Page ${pagination?.currentPage || 1}/${pagination?.totalPages || 1} | 👥 Total : ${stats?.totalUsers || 0}`
      );
    } catch (err) {
      console.error("Leaderboard error:", err);
      return message.reply("⚠️ Impossible de récupérer le classement global.");
    }
  },
  async handleCategories(message, getLang) {
    try {
      const res = await axios.get(`${BASE_URL}/categories`);
      const categories = res.data;
      const catText = categories.map(c => `📍 ${c.charAt(0).toUpperCase() + c.slice(1)}`).join("\n");
      return message.reply(
        `📚 𝗤𝘂𝗶𝘇 𝗖𝗮𝘁é𝗴𝗼𝗿𝗶𝗲𝘀\n━━━━━━━━\n\n${catText}\n\n` +
        `🎯 𝖴𝗍𝗂𝗅𝗂𝗌𝘦𝗓 : 𝗊𝗎𝗂𝗓 <𝘤𝘢𝘵é𝘨𝘰𝘳𝘪𝘦>\n🎲 Aléatoire : quiz random`
      );
    } catch (err) {
      console.error("Categories error:", err);
      return message.reply("⚠️ Impossible de charger les catégories.");
    }
  },
  async handleDailyChallenge(message, event, commandName, api) {
    try {
      const res = await axios.get(`${BASE_URL}/challenge/daily?userId=${event.senderID}`);
      const { question, challengeDate, reward, streak } = res.data;
      const optText = question.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n");
      const info = await message.reply(
        `🌟 Défi Quotidien\n━━━━━━━━━\n📅 ${challengeDate}\n🎯 Récompense : +${reward} XP\n🔥 Série : ${streak}\n\n❓ ${question.question}\n\n${optText}\n\n⏰ 30 secondes pour répondre !`
      );
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        author: event.senderID,
        messageID: info.messageID,
        answer: question.answer,
        questionId: question._id,
        startTime: Date.now(),
        isDailyChallenge: true,
        bonusReward: reward
      });
      setTimeout(() => {
        const r = global.GoatBot.onReply.get(info.messageID);
        if (r) {
          message.reply(`⏰ Temps écoulé ! La réponse était : ${question.answer}`);
          message.unsend(info.messageID);
          global.GoatBot.onReply.delete(info.messageID);
        }
      }, 30000);
    } catch (err) {
      console.error("Daily challenge error:", err);
      return message.reply("⚠️ Impossible de charger le défi quotidien.");
    }
  },
  async handleTrueOrFalse(message, event, commandName, api) {
    try {
      const res = await axios.get(`${BASE_URL}/question?category=torf&userId=${event.senderID}`);
      const { _id, question, answer } = res.data;
      const info = await message.reply(this.langs.en.torfReply.replace("{question}", question));
      const correctAnswer = answer.toUpperCase();
      global.GoatBot.onReaction.set(info.messageID, {
        commandName,
        author: event.senderID,
        messageID: info.messageID,
        answer: correctAnswer,
        reacted: false,
        questionId: _id,
        startTime: Date.now()
      });
      setTimeout(() => {
        const reaction = global.GoatBot.onReaction.get(info.messageID);
        if (reaction && !reaction.reacted) {
          const correctText = correctAnswer === "A" ? "Vrai" : "Faux";
          message.reply(this.langs.en.timeoutMessage.replace("{correctAnswer}", correctText));
          message.unsend(info.messageID);
          global.GoatBot.onReaction.delete(info.messageID);
        }
      }, 30000);
    } catch (err) {
      console.error("True/False error:", err);
      return message.reply("⚠️ Impossible de créer la question Vrai/Faux.");
    }
  },
  async handleFlagQuiz(message, event, commandName, api) {
    try {
      const res = await axios.get(`${BASE_URL}/question?category=flag&userId=${event.senderID}`);
      const { _id, question, options, answer } = res.data;
      const flagEmbed = {
        body: `🏁 𝗙𝗹𝗮𝗴 𝗤𝘂𝗶𝘇\n━━━━━━━━\n\n🌍 Devinez ce drapeau :\n\n` +
              options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n") +
              `\n\n⏰ Temps : 30 secondes.`,
        attachment: question ? await global.utils.getStreamFromURL(question) : null
      };
      const info = await message.reply(flagEmbed);
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        author: event.senderID,
        messageID: info.messageID,
        answer,
        options,
        questionId: _id,
        startTime: Date.now(),
        isFlag: true
      });
      setTimeout(() => {
        const r = global.GoatBot.onReply.get(info.messageID);
        if (r) {
          message.reply(`⏰ Temps écoulé ! La réponse était : ${answer}`);
          message.unsend(info.messageID);
          global.GoatBot.onReply.delete(info.messageID);
        }
      }, 30000);
    } catch (err) {
      console.error("Flag quiz error:", err);
      return message.reply("⚠️ Impossible de charger le quiz des drapeaux.");
    }
  },
  async handleAnimeQuiz(message, event, commandName, api) {
    try {
      // Correction du paramètre anime pour s'assurer qu'il appelle le bon point de terminaison ou la catégorie adéquate
      const res = await axios.get(`${BASE_URL}/question?category=anime&userId=${event.senderID}`);
      const data = res.data;
      const { _id, question, options, answer } = data;
      // Certains backends renvoient l'image sous "imageUrl", d'autres sous "image" ou "question" si c'est un lien
      const imageUrl = data.imageUrl || data.image || (question && question.startsWith('http') ? question : null);
      const hintText = (imageUrl && question && !question.startsWith('http')) ? question : "Devinez ce personnage/élément d'animé !";

      const animeEmbed = {
        body: `🎌 𝗔𝗻𝗶𝗺𝗲 𝗤𝘂𝗶𝘇\n━━━━━━━━\n\n❔ 𝗜𝗻𝗱𝗶𝗰𝗲 : ${hintText}\n\n` +
              options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n") +
              `\n\n⏰ Temps : 30 secondes`,
        attachment: imageUrl ? await global.utils.getStreamFromURL(imageUrl) : null
      };
      const info = await message.reply(animeEmbed);
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        author: event.senderID,
        messageID: info.messageID,
        answer,
        options,
        questionId: _id,
        startTime: Date.now(),
        isAnime: true
      });
      setTimeout(() => {
        const r = global.GoatBot.onReply.get(info.messageID);
        if (r) {
          message.reply(`⏰ Temps écoulé ! La réponse était : ${answer}`);
          message.unsend(info.messageID);
          global.GoatBot.onReply.delete(info.messageID);
        }
      }, 30000);
    } catch (err) {
      console.error("Anime quiz error:", err);
      return message.reply("⚠️ Impossible de charger le quiz animé. Vérifiez la disponibilité des questions animées.");
    }
  },
  async handleQuiz(message, event, args, commandName, getLang, api, usersData, forcedDifficulty = null) {
    try {
      const userName = await this.getUserName(api, event.senderID);
      await axios.post(`${BASE_URL}/user/update`, {
        userId: event.senderID,
        name: userName
      });
      const category = args[0]?.toLowerCase() || "";
      let queryParams = { userId: event.senderID };
      if (category && category !== "random") {
        queryParams.category = category;
      }
      if (forcedDifficulty) {
        queryParams.difficulty = forcedDifficulty;
      }
      const res = await axios.get(`${BASE_URL}/question`, { params: queryParams });
      const { _id, question, options, answer, category: qCategory, difficulty } = res.data;
      const optText = options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n");
      const info = await message.reply(getLang("reply")
        .replace("{category}", qCategory?.charAt(0).toUpperCase() + qCategory?.slice(1) || "Aléatoire")
        .replace("{difficulty}", difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1) || "Moyen")
        .replace("{question}", question)
        .replace("{options}", optText));
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        author: event.senderID,
        messageID: info.messageID,
        answer,
        questionId: _id,
        startTime: Date.now(),
        difficulty,
        category: qCategory
      });
      setTimeout(() => {
        const r = global.GoatBot.onReply.get(info.messageID);
        if (r) {
          message.reply(getLang("timeoutMessage").replace("{correctAnswer}", answer));
          message.unsend(info.messageID);
          global.GoatBot.onReply.delete(info.messageID);
        }
      }, 30000);
    } catch (err) {
      console.error("Quiz error:", err);
      message.reply("⚠️ Impossible de récupérer la question. Utilisez 'quiz' pour voir les catégories.");
    }
  },
  async handleCategoryLeaderboard(message, getLang, args, api) {
    try {
      const category = args[0]?.toLowerCase();
      if (!category) {
        return message.reply("📚 Veuillez spécifier une catégorie.");
      }
      const page = parseInt(args[1]) || 1;
      const res = await axios.get(`${BASE_URL}/leaderboard/category/${category}?page=${page}&limit=10`);
      const { users, pagination } = res.data;
      if (!users || users.length === 0) {
        return message.reply(`🏆 Aucun joueur trouvé pour la catégorie : ${category}.`);
      }
      const topPlayersWithNames = await Promise.all(users.map(async (u, i) => {
        let userName = 'Anonymous Player';
        if (u.userId) {
          userName = await this.getUserName(api, u.userId);
        }
        const position = (pagination.currentPage - 1) * 10 + i + 1;
        const crown = position === 1 ? "👑" : position === 2 ? "🥈" : position === 3 ? "🥉" : "🏅";
        const title = this.getUserTitle(u.correct || 0);
        return `${crown} #${position} ${userName}\n🎖️ ${title}\n📊 ${u.correct || 0}/${u.total || 0} (${u.accuracy || 0}%)`;
      }));
      const topPlayers = topPlayersWithNames.join('\n\n');
      return message.reply(
        `🏆 𝗟𝗲𝗮𝗱𝗲𝗿𝗯𝗼𝗮𝗿𝗱 : ${category.charAt(0).toUpperCase() + category.slice(1)}\n━━━━━━━━━\n\n${topPlayers}\n\n📖 Page ${pagination.currentPage}/${pagination.totalPages}`
      );
    } catch (err) {
      console.error("Category leaderboard error:", err);
      return message.reply("⚠️ Impossible de récupérer le classement.");
    }
  },
  onReaction: async function ({ message, event, Reaction, api, usersData }) {
    try {
      const { author, messageID, answer, reacted } = Reaction;
      if (event.userID !== author || reacted) return;
      const userAnswer = event.reaction === '😆' ? "A" : "B";
      const isCorrect = userAnswer === answer;
      const timeSpent = (Date.now() - Reaction.startTime) / 1000;
      if (timeSpent > 30) {
        return message.reply("⏰ Temps écoulé !");
      }
      const userName = await this.getUserName(api, event.userID);
      const answerData = {
        userId: event.userID,
        questionId: Reaction.questionId,
        answer: userAnswer,
        timeSpent,
        userName
      };
      try {
        const res = await axios.post(`${BASE_URL}/answer`, answerData);
        const { user, xpGained } = res.data;
        const userData = await usersData.get(event.userID) || {};
        if (isCorrect) {
          const totalMoneyReward = 10000 + ((user.currentStreak || 0) * 1000);
          userData.money = (userData.money || 0) + totalMoneyReward;
          await usersData.set(event.userID, userData);
          message.reply(`🎯 𝗕𝗥𝗔𝗩𝗢 ! Réponse correcte !\n💰 Argent : +${totalMoneyReward.toLocaleString()}\n✨ XP : +${xpGained || 15}\n🔥 Streak : ${user.currentStreak || 0}`);
        } else {
          const correctText = answer === "A" ? "Vrai" : "Faux";
          message.reply(`❌ 𝖬𝖺𝗎𝘷𝖺𝗂𝗌𝖾 𝗋é𝘱𝗈𝗇𝗌𝖾 ! La bonne réponse était : ${correctText}\n💔 Streak Réset`);
        }
      } catch (error) {
        console.error("Error updating score:", error);
      }
      global.GoatBot.onReaction.get(messageID).reacted = true;
      setTimeout(() => global.GoatBot.onReaction.delete(messageID), 1000);
    } catch (err) {
      console.error("Quiz reaction error:", err);
    }
  },
  onReply: async function ({ message, event, Reply, getLang, api, usersData }) {
    if (Reply.author !== event.senderID) return;
    try {
      const ans = event.body.trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(ans)) {
        return message.reply("❌ Veuillez répondre uniquement par A, B, C ou D !");
      }
      const timeSpent = (Date.now() - Reply.startTime) / 1000;
      if (timeSpent > 30) {
        return message.reply("⏰ Temps écoulé !");
      }
      const userName = await this.getUserName(api, event.senderID);
      let correctAnswer = Reply.answer;
      let userAnswer = ans;
      if ((Reply.isFlag || Reply.isAnime) && Reply.options) {
        const optionIndex = ans.charCodeAt(0) - 65;
        if (optionIndex >= 0 && optionIndex < Reply.options.length) {
          userAnswer = Reply.options[optionIndex];
        }
      }
      const answerData = {
        userId: event.senderID,
        questionId: Reply.questionId,
        answer: userAnswer,
        timeSpent,
        userName
      };
      const res = await axios.post(`${BASE_URL}/answer`, answerData);
      if (!res.data) {
        throw new Error('No response data received');
      }
      const { result, user } = res.data;
      let responseMsg;
      if (result === "correct") {
        const userData = await usersData.get(event.senderID) || {};
        let baseMoneyReward = 10000;
        if (Reply.difficulty === 'hard') baseMoneyReward = 15000;
        if (Reply.difficulty === 'easy') baseMoneyReward = 7500;
        if (Reply.isFlag) baseMoneyReward = 12000;
        if (Reply.isAnime) baseMoneyReward = 15000;
        if (Reply.isDailyChallenge) baseMoneyReward = 20000;
        const totalMoneyReward = baseMoneyReward + ((user.currentStreak || 0) * 1000);
        userData.money = (userData.money || 0) + totalMoneyReward;
        await usersData.set(event.senderID, userData);
        responseMsg = `🎉 Correct ! 💰\n` +
          `💵 Argent : +${totalMoneyReward.toLocaleString()}\n` +
          `✨ XP : +${user.xpGained || 15}\n` +
          `📊 Score : ${user.correct || 0}/${user.total || 0} (${user.accuracy || 0}%)\n` +
          `🔥 Streak : ${user.currentStreak || 0}\n👤 ${userName}`;
      } else {
        responseMsg = `❌ Faux ! Réponse correcte : ${correctAnswer}\n` +
          `📊 Score : ${user.correct || 0}/${user.total || 0} (${user.accuracy || 0}%)\n` +
          `💔 Streak Réset\n👤 ${userName}`;
      }
      await message.reply(responseMsg);
      message.unsend(Reply.messageID);
      global.GoatBot.onReply.delete(Reply.messageID);
    } catch (err) {
      console.error("Answer error:", err);
      message.reply("⚠️ Erreur lors du traitement de votre réponse.");
    }
  },
  envConfig: {
    reward: 10000,
    achievementReward: 50000,
    streakReward: 1000,
    flagReward: 12000,
    animeReward: 15000,
    dailyChallengeBonus: 20000,
    hardDifficultyReward: 15000,
    easyDifficultyReward: 7500
  }
};
