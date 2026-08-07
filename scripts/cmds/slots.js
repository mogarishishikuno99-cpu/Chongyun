const fonts = require("../func/fonts.js");

const DAILY_LIMIT = 20;
const MAX_BET = 6000000;

module.exports = {
  config: {
    name: "slots",
    aliases: ["slot"],
    version: "2.1",
    author: "Shade",
    countDown: 8,
    role: 0,
    description: "Slot Machine (Wallet direct)",
    category: "economy"
  },
  onStart: async function ({ message, event, args, usersData }) {
    try {
      const { senderID } = event;

      let user = await usersData.get(senderID);
      if (!user || typeof user !== "object") user = {};
      if (!user.data) user.data = {};
      if (typeof user.money !== "number") user.money = 0;

      const bet = parseInt(args[0]);

      const formatMoney = (amount) => {
        if (isNaN(amount)) return "$0";
        if (amount >= 1e12) return "$" + (amount / 1e12).toFixed(2) + "T";
        if (amount >= 1e9) return "$" + (amount / 1e9).toFixed(2) + "B";
        if (amount >= 1e6) return "$" + (amount / 1e6).toFixed(2) + "M";
        if (amount >= 1e3) return "$" + (amount / 1e3).toFixed(2) + "k";
        return "$" + amount.toLocaleString();
      };

      if (isNaN(bet) || bet <= 0)
        return message.reply(fonts.christus("Invalid bet amount!"));
      
      if (bet > MAX_BET)
        return message.reply(fonts.christus(`Max bet is ${formatMoney(MAX_BET)}`));

      if (user.money < bet)
        return message.reply(fonts.christus("Not enough money in wallet!"));

      const today = new Date().toISOString().split("T")[0];
      if (!user.data.slotsDay) user.data.slotsDay = today;
      if (typeof user.data.slotsCount !== "number") user.data.slotsCount = 0;
      
      if (user.data.slotsDay !== today) {
        user.data.slotsDay = today;
        user.data.slotsCount = 0;
      }

      if (user.data.slotsCount >= DAILY_LIMIT)
        return message.reply(fonts.christus(`Daily limit reached (${DAILY_LIMIT})`));

      const symbols = [
        { emoji: "🍒", weight: 30 },
        { emoji: "🍋", weight: 25 },
        { emoji: "🍇", weight: 20 },
        { emoji: "🍉", weight: 15 },
        { emoji: "⭐", weight: 7 },
        { emoji: "7️⃣", weight: 3 }
      ];

      const roll = () => {
        let total = symbols.reduce((a, b) => a + b.weight, 0);
        let r = Math.random() * total;
        for (const s of symbols) {
          if (r < s.weight) return s.emoji;
          r -= s.weight;
        }
        return "🍒";
      };

      const s1 = roll();
      const s2 = roll();
      const s3 = roll();
      let win = 0;
      let result = "";
      let bonus = "";

      if (s1 === "7️⃣" && s2 === "7️⃣" && s3 === "7️⃣") {
        win = bet * 10;
        result = "ANGEL JACKPOT x10!";
        bonus = "Divine Blessing Activated!";
      } else if (s1 === s2 && s2 === s3) {
        win = bet * 5;
        result = "TRIPLE MATCH!";
      } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        win = bet * 2;
        result = "DOUBLE MATCH!";
      } else if (Math.random() < 0.4) {
        win = Math.floor(bet * 1.5);
        result = "Lucky Spin!";
      } else {
        win = -bet;
        result = "Lost spin...";
      }

      user.money += win;
      user.data.slotsCount += 1;

      await usersData.set(senderID, {
        ...user,
        money: user.money,
        data: user.data
      });

      const ui = `╭───────────────✦\n` +
        `│ 🎰 𝗔𝗡𝗚𝗘𝗟 𝗦𝗟𝗢𝗧𝗦\n` +
        `├────────────────\n` +
        `│ [ ${s1} | ${s2} | ${s3} ]\n` +
        `├────────────────\n` +
        `│ RESULT: ${result}\n` +
        `${bonus ? `│ 💫 ${bonus}\n` : ``}` +
        `│ CHANGE: ${win >= 0 ? "+" : ""}${formatMoney(win)}\n` +
        `│ WALLET: ${formatMoney(user.money)}\n` +
        `│ SPINS: ${user.data.slotsCount}/${DAILY_LIMIT}\n` +
        `├────────────────\n` +
        `│ System by Shade\n` +
        `╰───────────────✦`;

      return message.reply(fonts.christus(ui));
    } catch (err) {
      console.error("Slots Error:", err);
      return message.reply(fonts.christus("An error occurred while playing slots."));
    }
  }
};
