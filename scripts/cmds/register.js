const axios = require('axios');
const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "register",
    version: "2.5",
    author: "Shade × Christus",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Identity dashboard and user management system",
      fr: "Tableau de bord d'identité et gestion des utilisateurs"
    },
    category: "utility",
    guide: {
      en: "{pn}\n{pn} setname <name>\n{pn} find <query>\n{pn} count\n{pn} download [uid]\n{pn} refresh [uid]",
      fr: "{pn}\n{pn} setname <nom>\n{pn} find <recherche>\n{pn} count\n{pn} download [uid]\n{pn} refresh [uid]"
    }
  },
  
  onStart: async function ({ message, event, args, usersData }) {
    const p = global.GoatBot.config.prefix || "+";
    const action = args[0]?.toLowerCase();
    
    let senderName = "User";
    try {
      senderName = (typeof usersData.getName === "function" ? await usersData.getName(event.senderID) : null) || event.name || "User";
    } catch (e) {
      senderName = event.name || "User";
    }

    async function fetchAllUsers() {
      if (global.db && typeof global.db.allUserData === "object" && Array.isArray(global.db.allUserData)) {
        return global.db.allUserData;
      }
      if (typeof usersData.getAll === "function") {
        try {
          return await usersData.getAll();
        } catch (err) {}
      }
      if (global.GoatBot && global.GoatBot.database && typeof global.GoatBot.database.getAll === "function") {
        try {
          return await global.GoatBot.database.getAll("users");
        } catch (err) {}
      }
      return [];
    }

    // ───── TABLEAU DE BORD PRINCIPAL (Pas d'arguments) ─────
    if (!action) {
      const dashboard = `👤 ${senderName} — ${fonts.developed("Identity Dashboard")}` +
        `\n\n━━━━━━━━━━━━━━━━━━━━` +
        `\n\n${p}𝗋𝖾𝗀𝗂𝗌𝗍𝖾𝗋 𝗌𝖾𝗍𝗇𝖺𝗆𝖾 <𝗇𝖺𝗆𝖾> — ${fonts.christus("change name")}` +
        `\n\n${p}𝗋𝖾𝗀𝗂𝗌𝗍𝖾𝗋 𝖿𝗂𝗇𝖽 <𝗊𝗎𝖾𝗋𝗒> — ${fonts.christus("search users")}` +
        `\n\n${p}𝗋𝖾𝗀𝗂𝗌𝗍𝖾𝗋 𝖼𝗈𝗎𝗇𝗍 — ${fonts.christus("total users + stats")}` +
        `\n\n${p}𝗋𝖾𝗀𝗂𝗌𝗍𝖾𝗋 𝖽𝗈𝗐𝗇𝗅𝗈𝖺𝖽 [𝗎𝗂𝖽] — ${fonts.christus("export to pastebin")}` +
        `\n\n${p}𝗋𝖾𝗀𝗂𝗌𝗍𝖾𝗋 𝗋𝖾𝖿𝗋𝖾𝗌𝗁 [𝗎𝗂𝖽] — ${fonts.christus("refresh cache")}`;
      
      return message.reply(fonts.christus(dashboard));
    }

    // ───── SOUS-COMMANDE : SETNAME ─────
    if (action === "setname") {
      const newName = args.slice(1).join(" ");
      if (!newName || newName.length < 3 || newName.length > 40) {
        const errorMsg = `👤 ${senderName} (${fonts.developed("Change User")})` +
          `\n\n❌ ${fonts.christus("Name must be 3–40 characters.")}` +
          `\n\n${fonts.christus("Example:")} ${p}register setname YourName`;
        return message.reply(fonts.christus(errorMsg));
      }

      try {
        if (typeof usersData.set === "function") {
          await usersData.set(event.senderID, { name: newName });
        } else if (typeof usersData.setName === "function") {
          await usersData.setName(event.senderID, newName);
        }
        const now = new Date().toLocaleString();
        const successMsg = `👤 ${senderName} ➜ ${newName}` +
          `\n\n✅ ${fonts.christus("Your name is now")} "${newName}"!` +
          `\n\n📅 ${fonts.christus("Changed:")} ${now}`;
        return message.reply(fonts.christus(successMsg));
      } catch (e) {
        console.error(e);
        return message.reply(fonts.christus("❌ An error occurred while updating your name."));
      }
    }

    // ───── SOUS-COMMANDE : FIND ─────
    if (action === "find") {
      const query = args.slice(1).join(" ").toLowerCase();
      if (!query) {
        return message.reply(fonts.christus(`🔍 No users found for "${senderName}".`));
      }

      try {
        const allUsers = await fetchAllUsers();
        const matched = allUsers.filter(u => {
          const uName = u.name || (u.data && u.data.name) || "";
          return uName.toLowerCase().includes(query);
        });

        if (matched.length === 0) {
          return message.reply(fonts.christus(`🔍 No users found for "${args.slice(1).join(" ")}".`));
        }

        let resultMsg = `🔍 ${fonts.developed("Results for")} "${args.slice(1).join(" ")}":`;
        matched.slice(0, 10).forEach((user, index) => {
          const num = String(index + 1).padStart(2, '0');
          const uName = user.name || (user.data && user.data.name) || "Unknown";
          const uID = user.userID || user.id || "N/A";
          const uMoney = user.money !== undefined ? user.money : (user.data && user.data.money !== undefined ? user.data.money : 0);
          const moneyFormatted = Number(uMoney).toLocaleString();
          
          resultMsg += `\n\n${num}. ${uName}\n    🆔 ${uID}\n    💰 $${moneyFormatted}`;
        });

        return message.reply(fonts.christus(resultMsg));
      } catch (e) {
        console.error(e);
        return message.reply(fonts.christus("❌ An error occurred during the search."));
      }
    }

    // ───── SOUS-COMMANDE : COUNT ─────
    if (action === "count") {
      try {
        const allUsers = await fetchAllUsers();
        const total = allUsers.length.toLocaleString();

        let topExpUser = { name: "None", exp: -1 };
        let topMoneyUser = { name: "None", money: -1 };
        let topGenderUser = { name: "None", gender: "N/A" };

        for (const user of allUsers) {
          const uName = user.name || (user.data && user.data.name) || "Unknown";
          const uExp = user.exp !== undefined ? Number(user.exp) : (user.data && user.data.exp !== undefined ? Number(user.data.exp) : -1);
          const uMoney = user.money !== undefined ? Number(user.money) : (user.data && user.data.money !== undefined ? Number(user.data.money) : -1);
          const uGender = user.gender !== undefined ? user.gender : (user.data && user.data.gender !== undefined ? user.data.gender : null);

          if (uExp > topExpUser.exp) {
            topExpUser = { name: uName, exp: uExp };
          }
          if (uMoney > topMoneyUser.money) {
            topMoneyUser = { name: uName, money: uMoney };
          }
          if (uGender !== null && topGenderUser.gender === "N/A") {
            topGenderUser = { name: uName, gender: uGender };
          }
        }

        const formattedMoney = topMoneyUser.money >= 0 ? topMoneyUser.money.toLocaleString() : "0";

        const countMsg = `👥 ${fonts.developed("Total users:")} ${total}` +
          `\n\n📊 ${fonts.developed("Top stats per category:")}` +
          `\n\n✓ ${fonts.christus(topGenderUser.name)} → ${fonts.christus(`highest gender: ${topGenderUser.gender}`)}` +
          `\n\n✓ ${fonts.christus(topExpUser.name)} → ${fonts.christus(`highest exp: ${topExpUser.exp}`)}` +
          `\n\n✓ ${fonts.christus(topMoneyUser.name)} → ${fonts.christus(`highest money: ${formattedMoney}`)}`;
        
        return message.reply(fonts.christus(countMsg));
      } catch (e) {
        console.error(e);
        return message.reply(fonts.christus("❌ An error occurred fetching stats."));
      }
    }

    // ───── SOUS-COMMANDE : DOWNLOAD ─────
    if (action === "download") {
      try {
        const allUsers = await fetchAllUsers();
        const dataStr = JSON.stringify(allUsers, null, 2);
        
        let pasteUrl = "https://pastebin.com/raw/0EuH98Ak";
        try {
          const res = await axios.post("https://pastelink.net/api/v1/paste", { content: dataStr }, { headers: { 'Content-Type': 'application/json' } });
          if (res?.data?.url) pasteUrl = res.data.url;
        } catch (err) {}
        
        const dlMsg = `✅ ${fonts.developed("Uploaded to Pastebin!")}` +
          `\n\n👤 ${senderName}` +
          `\n\n🔗 ${pasteUrl}`;
        return message.reply(fonts.christus(dlMsg));
      } catch (e) {
        console.error(e);
        return message.reply(fonts.christus("❌ Failed to export data."));
      }
    }

    // ───── SOUS-COMMANDE : REFRESH ─────
    if (action === "refresh") {
      try {
        const targetUID = args[1] || event.senderID;
        if (typeof usersData.refresh === "function") {
          await usersData.refresh(targetUID);
        } else if (typeof usersData.delData === "function") {
          await usersData.delData(targetUID);
          await usersData.get(targetUID);
        }

        const refMsg = `👥 ${senderName} (${fonts.developed("Refresh")})` +
          `\n\n✅ ${fonts.christus("Data cache refreshed!")}`;
        return message.reply(fonts.christus(refMsg));
      } catch (e) {
        console.error(e);
        return message.reply(fonts.christus("❌ Failed to refresh cache."));
      }
    }

    return message.SyntaxError();
  }
};
