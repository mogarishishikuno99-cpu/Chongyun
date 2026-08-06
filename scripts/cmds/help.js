const { commands } = global.GoatBot;
const config = global.GoatBot.config;
const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "help",
    version: "10.6",
    author: "Shade × Christus",
    countDown: 2,
    role: 0,
    category: "system",
    guide: "help [commande | search <mot>]"
  },
  onStart: async function ({ message, args }) {
    const p = config.prefix || "!";

    // ───── CAS RECHERCHE (help search <mot>) ─────
    if (args[0] && args[0].toLowerCase() === "search") {
      const keyword = args.slice(1).join(" ").toLowerCase();
      if (!keyword) {
        return message.reply(fonts.christus(`❌ Veuillez entrer un mot-clé à rechercher. Utilisation : ${p}help search <mot>`));
      }

      const matchedCmds = [];
      for (const [name, cmd] of commands) {
        const c = cmd.config || {};
        const cmdName = (c.name || name).toLowerCase();
        
        let descStr = "";
        if (typeof c.shortDescription === "string") descStr = c.shortDescription;
        else if (c.shortDescription && typeof c.shortDescription.en === "string") descStr = c.shortDescription.en;
        else if (typeof c.description === "string") descStr = c.description;
        else if (c.description && typeof c.description.en === "string") descStr = c.description.en;

        const aliases = c.aliases ? c.aliases.map(a => a.toLowerCase()) : [];

        if (cmdName.includes(keyword) || descStr.toLowerCase().includes(keyword) || aliases.some(a => a.includes(keyword))) {
          matchedCmds.push({ name: c.name || name, config: c });
        }
      }

      if (matchedCmds.length === 0) {
        return message.reply(fonts.christus(`❌ Aucune commande trouvée pour "${keyword}".`));
      }

      let resultMsg = `🔎 ${fonts.developed("Search Results")} (${matchedCmds.length})`;
      
      for (const item of matchedCmds) {
        const c = item.config;
        const rawName = c.name || "unknown";
        
        let descStr = "";
        if (typeof c.shortDescription === "string") descStr = c.shortDescription;
        else if (c.shortDescription && typeof c.shortDescription.en === "string") descStr = c.shortDescription.en;
        else if (typeof c.description === "string") descStr = c.description;
        else if (c.description && typeof c.description.en === "string") descStr = c.description.en;

        const aliases = c.aliases && c.aliases.length > 0 ? c.aliases.join(", ") : "None";
        const guide = c.guide?.fr || c.guide?.en || (typeof c.guide === "string" ? c.guide : "");

        resultMsg += `\n\n📁 +${fonts.christus(rawName)}`;
        
        if (!descStr || descStr.trim() === "" || descStr.toLowerCase() === "none") {
          resultMsg += `\n➜ 𝗡𝗈 𝗗𝖾𝗌𝖼𝗋𝗂𝗉𝗍𝗂𝗈𝗇`;
        } else {
          resultMsg += `\n➜ ${fonts.christus(descStr)}`;
        }

        resultMsg += `\n𝗔𝗅𝗂𝖺𝗌𝖾𝗌: ${fonts.christus(aliases)}`;
        if (guide) {
          resultMsg += `\n➜ ${fonts.christus(guide)}`;
        }
      }

      resultMsg += `\n\n➜ 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐛𝐲 @𝐒𝐡𝐚𝐝𝐞 🎀`;
      return message.reply(fonts.christus(resultMsg));
    }

    // ───── DÉTAIL COMMANDE (help <commande>) ─────
    if (args[0]) {
      const search = args[0].toLowerCase();
      const cmd = commands.get(search) ||
        Array.from(commands.values())
          .find(c => c.config?.aliases?.includes(search));
      
      if (!cmd) return message.reply(fonts.christus("❌ Commande introuvable."));
      const c = cmd.config;

      const rawName = c.name || "Unknown";
      const capitalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const author = c.author || "Unknown";
      
      let descStr = "None";
      if (typeof c.shortDescription === "string") descStr = c.shortDescription;
      else if (c.shortDescription && typeof c.shortDescription.en === "string") descStr = c.shortDescription.en;
      else if (typeof c.description === "string") descStr = c.description;
      else if (c.description && typeof c.description.en === "string") descStr = c.description.en;

      const usage = c.guide?.fr || c.guide?.en || (typeof c.guide === "string" ? c.guide : "No guide available");
      const category = c.category || "other";
      const cooldown = `${c.countDown || 0}s`;
      let roleText = "All users";
      if (c.role === 1) roleText = "Moderator";
      if (c.role === 2) roleText = "Admin";
      const aliases = c.aliases && c.aliases.length > 0 ? c.aliases.join(", ") : "None";

      const detailMsg = `╭─── 📄 ${fonts.developed(capitalizedName)} ───` +
        `\n│ ➤ 𝗡𝖺𝗆𝖾: ${fonts.christus(rawName)}` +
        `\n│ ➤ 𝗔𝗎𝗍𝗁𝗈𝗋: ${fonts.christus(author)}` +
        `\n│ ➤ 𝗗𝖾𝗌𝖼𝗋𝗂𝗉𝗍𝗂𝗈𝗇: ${fonts.christus(descStr)}` +
        `\n│ ➤ 𝗨𝗌𝖺𝗀𝖾: ${fonts.mono(usage)}` +
        `\n│ ➤ 𝗖𝖺𝗍𝖾𝗀𝗈𝗋𝗒: ${fonts.christus(category)}` +
        `\n│ ➤ 𝗖𝗈𝗈𝗅𝖽𝗈𝗐𝗇: ${fonts.christus(cooldown)}` +
        `\n│ ➤ 𝗥𝗈𝗅𝖾: ${fonts.christus(roleText)}` +
        `\n│ ➤ 𝗔𝗅𝗂𝖺𝗌𝖾𝗌: ${fonts.christus(aliases)}` +
        `\n╰────────────────`;

      return message.reply(fonts.christus(detailMsg));
    }

    // ───── MENU GLOBAL ─────
    const cats = {};
    for (const [name, cmd] of commands) {
      let cat = cmd?.config?.category || "other";
      cat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(name);
    }

    let menu = `🔍 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 🧰 (${commands.size})`;
    const sortedCats = Object.keys(cats).sort();

    for (const cat of sortedCats) {
      const sortedCmds = cats[cat].sort();
      const count = sortedCmds.length;

      menu += `\n\n${fonts.developed(cat)} (${count})`;
      
      const formattedCmdsList = sortedCmds.map(cmd => `📄 ${fonts.christus(cmd)}`).join("   ");
      menu += `\n${formattedCmdsList}`;
    }

    menu += `\n\n➜ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐝𝐞𝐭𝐚𝐢𝐥𝐬: ${p}help <𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚎>`;
    menu += `\n➜ 𝐁𝐚𝐬𝐢𝐜𝐬: ${p}help 𝚋𝚊𝚜𝚒𝚌𝚜`;
    menu += `\n➜ 𝐒𝐞𝐚𝐫𝐜𝐡: ${p}help 𝚜𝚎𝚊𝚛𝚌𝚑 <𝚖𝗈𝚝>`;
    menu += `\n➜ 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐛𝐲 @𝐒𝐡𝐚𝐝𝐞 🎀`;

    return message.reply(fonts.christus(menu));
  }
};
