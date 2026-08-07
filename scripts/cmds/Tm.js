const fonts = require("../func/fonts.js");

const MAX_BET = Infinity; 
const MAX_PLAYS = 10; 
const LIMIT_INTERVAL_HOURS = 5 / 60;

module.exports = {  
  config: {    
    name: "triplematch",    
    aliases: ["tm", "match3"],    
    version: "2.1",    
    countDown: 5,    
    author: "Shade",    
    description: "Aligne 3 lignes aléatoires et gagne x1, x2 ou JACKPOT avec animation",    
    category: "game",    
    role: 0,    
    guide: {      
      en: "Utilisation:\n/tm <mise>\nExemple: /tm 5000\n/tm top → Affiche le top des joueurs\n\nNote: 10 parties maximum, puis 5 minutes d'attente."    }  
  },  
  onStart: async function ({ api, event, args, usersData }) {    
    const { threadID, senderID, messageID } = event;    
    
    if (args[0]?.toLowerCase() === "top") {      
      const allUsers = await usersData.getAll();      
      const sorted = allUsers        
        .filter(u => u.tmwin1 > 0)        
        .sort((a, b) => (b.tmwin1 || 0) - (a.tmwin1 || 0))        
        .slice(0, 5);      
      
      if (sorted.length === 0)        
        return api.sendMessage(fonts.christus("❌ Aucun gagnant pour le moment !"), threadID, messageID);      
      
      let rankText = "🏆 Top 5 des gagnants TripleMatch :\n\n";      
      for (let i = 0; i < sorted.length; i++) {        
        const name = sorted[i].name || `Utilisateur ${sorted[i].userID || "?"}`;        
        rankText += `${i + 1}. ${name} — 🏅 ${sorted[i].tmwin1} victoires\n`;      }      
      return api.sendMessage(fonts.christus(rankText), threadID, messageID);    
    }    

    const bet = parseInt(args[0]);    
    if (isNaN(bet) || bet <= 0)      
      return api.sendMessage(fonts.christus("⚠️ Montant de mise invalide."), threadID, messageID);    
    
    let user = await usersData.get(senderID) || {      
      money: 0,      
      tmwin1: 0,      
      data: {}    
    };
    if (!user.data) user.data = {};    

    const now = Date.now();
    const cooldown = 5 * 60 * 1000;

    if (!user.data.tmPlayCount) user.data.tmPlayCount = 0;
    if (!user.data.tmLastTime) user.data.tmLastTime = 0;

    if (user.data.tmPlayCount >= MAX_PLAYS) {
      const timeLeft = cooldown - (now - user.data.tmLastTime);
      if (timeLeft > 0) {
        const minutes = Math.floor(timeLeft / (60 * 1000));
        const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
        return api.sendMessage(
          fonts.christus(`⏳ Tu as atteint la limite de ${MAX_PLAYS} parties. Tu dois attendre encore ${minutes}m ${seconds}s avant de rejouer !`), 
          threadID, 
          messageID
        );
      } else {
        user.data.tmPlayCount = 0;
        user.data.tmLastTime = 0;
      }
    }

    if ((user.money || 0) < bet)      
      return api.sendMessage(fonts.christus("❌ Vous n'avez pas assez d'argent."), threadID, messageID);    

    user.data.tmPlayCount += 1;
    if (user.data.tmPlayCount === MAX_PLAYS) {
      user.data.tmLastTime = now;
    }

    const emojis = ["✅", "❌"];    
    const matchedLines = [];    
    const winChance = Math.random();    
    let matchCount = winChance <= 0.4 ? Math.floor(Math.random() * 3) + 1 : 0;    
    
    while (matchedLines.length < matchCount) {      
      const line = Math.floor(Math.random() * 3);      
      if (!matchedLines.includes(line)) matchedLines.push(line);    
    }    

    const generateRow = (i) =>      
      matchedLines.includes(i)        
        ? ["✅", "✅", "✅"]        
        : Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * 2)]);    
    
    const finalGrid = [generateRow(0), generateRow(1), generateRow(2)];    
    const getOrdinal = n => (n === 1 ? "ère" : "ème");    
    let resultText = "", totalMultiplier = 0;    
    
    for (let i = 0; i < 3; i++) {      
      const row = finalGrid[i];      
      const isMatched = row.every(cell => cell === "✅");      
      if (isMatched) {        
        if (i === 0) {          
          resultText += `✅ 1ère ligne alignée (x1)\n`;          
          totalMultiplier += 1;        } else if (i === 1) {          
          resultText += `✅ 2ème ligne alignée (x2)\n`;          
          totalMultiplier += 2;        } else {          
          resultText += `🎉 3ème ligne alignée — JACKPOT (x5)\n`;          
          totalMultiplier += 5;        }      
      } else {        
        resultText += `❌ ${i + 1}${getOrdinal(i + 1)} ligne non alignée\n`;      
      }    }    

    const wonCoins = bet * totalMultiplier;    
    user.money = user.money - bet + wonCoins;    
    if (totalMultiplier > 0)      
      user.tmwin1 = (user.tmwin1 || 0) + 1;    
    
    await usersData.set(senderID, user);    

    const prizeText = totalMultiplier > 0      
      ? `💰 Multiplicateur total: x${totalMultiplier}\n💰 Vous gagnez: ${wonCoins.toLocaleString()}`      
      : `😢 Aucun alignement. Vous perdez votre mise de ${bet.toLocaleString()}`;    
    
    const finalAnim = `🎰 GRILLE FINALE\n\n┌────────────┐\n` +
      `│ ${finalGrid[0][0]} | ${finalGrid[0][1]} | ${finalGrid[0][2]} │\n` +
      `│ ${finalGrid[1][0]} | ${finalGrid[1][1]} | ${finalGrid[1][2]} │\n` +
      `│ ${finalGrid[2][0]} | ${finalGrid[2][1]} | ${finalGrid[2][2]} │\n` +
      `└────────────┘\n` +
      `${resultText}${prizeText}\n` +
      `💵 Solde: ${user.money.toLocaleString()} coins\n` +
      `🕹️ Parties jouées : ${user.data.tmPlayCount}/${MAX_PLAYS}`;    

    const delay = ms => new Promise(res => setTimeout(res, ms));    
    const anim1 = "🎰 Rotation des symboles...\n\n┌────────────┐\n│ ⏳ | ⏳ | ⏳ │\n│ ⏳ | ⏳ | ⏳ │\n│ ⏳ | ⏳ | ⏳ │\n└────────────┘";    
    const anim2 = `🎰 Rotation...\n\n┌────────────┐\n` +
      `│ ${finalGrid[0][0]} | ${finalGrid[0][1]} | ${finalGrid[0][2]} │\n` +
      `│ ⏳ | ⏳ | ⏳ │\n` +
      `│ ⏳ | ⏳ | ⏳ │\n` +
      `└────────────┘`;    
    const anim3 = `🎰 Rotation...\n\n┌────────────┐\n` +
      `│ ${finalGrid[0][0]} | ${finalGrid[0][1]} | ${finalGrid[0][2]} │\n` +
      `│ ${finalGrid[1][0]} | ${finalGrid[1][1]} | ${finalGrid[1][2]} │\n` +
      `│ ⏳ | ⏳ | ⏳ │\n` +
      `└────────────┘`;    

    api.sendMessage(fonts.christus(anim1), threadID, async (err, info) => {      
      if (!err && info?.messageID) {        
        await delay(1000);        
        await api.editMessage(fonts.christus(anim2), info.messageID, threadID);        
        await delay(1000);        
        await api.editMessage(fonts.christus(anim3), info.messageID, threadID);        
        await delay(1000);        
        await api.editMessage(fonts.christus(finalAnim), info.messageID, threadID);      
      }    });  
  }
};
