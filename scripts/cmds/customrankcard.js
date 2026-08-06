// 🌸 Hori Custom Rank Card Terminal 🌸
const fs = require("fs");
const path = require("path");
const checkUrlRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif)/gi;
const regExColor = /#([0-9a-f]{6})|rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)|rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d+\.?\d*)\)/gi;
const fonts = require("../func/fonts.js");
const { uploadImgbb } = global.utils;

module.exports = {
  config: {
    name: "customrankcard",
    aliases: ["crc", "customrank", "horirank"],
    version: "2.0.2 Hori Pro",
    author: "NTKhang × Shade × Gemini",
    countDown: 5,
    role: 0,
    description: {
      en: "Design your custom dynamic rank card interface."
    },
    category: "utility",
    guide: {
      en: fonts.bold("🌸 {pn} maincolor #f43f5e")
    }
  },
  langs: {
    en: {
      invalidImage: "❌ Invalid target image URL link.",
      invalidAttachment: "❌ The provided component is not a valid image file.",
      invalidColor: "❌ Invalid hexa or RGB color code dynamic format.",
      notSupportImage: "❌ Image format background is not supported for parameters \"%1\".",
      success: "🌸 Parameters saved successfully. Checking preview interface below...",
      reseted: "🌸 Interface configuration restored to factory default parameters.",
      invalidAlpha: "❌ Opacity transparency value must be range between 0 ⟶ 1."
    }
  },
  onStart: async function ({ api, message, threadsData, usersData, event, args, getLang }) {
    if (!args[0]) return message.SyntaxError();
    const customRankCard = await threadsData.get(event.threadID, "data.customRankCard", {});
    const key = args[0].toLowerCase();
    let value = args.slice(1).join(" ");
    const supportImage = ["maincolor", "background", "bg", "subcolor", "expbarcolor", "progresscolor", "linecolor"];
    const notSupportImage = ["textcolor", "namecolor", "expcolor", "rankcolor", "levelcolor", "lvcolor"];

    // Fonction interne pour exécuter le rendu direct de rank.js pour l'aperçu
    const sendPreview = async (successMessage) => {
      const rankCmd = global.GoatBot?.commands?.get("rank");
      if (rankCmd && typeof rankCmd.onStart === "function") {
        return rankCmd.onStart({ api, event, args: [], usersData, threadsData, message });
      }
      return message.reply(fonts.christus(successMessage));
    };

    if ([...notSupportImage, ...supportImage].includes(key)) {
      const attachmentsReply = event.messageReply?.attachments;
      const attachments = [
        ...event.attachments.filter(({ type }) => ["photo", "animated_image"].includes(type)),
        ...(attachmentsReply?.filter(({ type }) => ["photo", "animated_image"].includes(type)) || [])
      ];

      if (value === "reset") {
        // Géré dans le switch
      } else if (value.match(/^https?:\/\//)) {
        const matchUrl = value.match(checkUrlRegex);
        if (!matchUrl) return message.reply(fonts.christus(getLang("invalidImage")));
        const infoFile = await uploadImgbb(matchUrl[0], "url");
        value = infoFile.image.url;
      } else if (attachments.length > 0) {
        if (!["photo", "animated_image"].includes(attachments[0].type)) {
          return message.reply(fonts.christus(getLang("invalidAttachment")));
        }
        const url = attachments[0].url;
        const infoFile = await uploadImgbb(url, "url");
        value = infoFile.image.url;
      } else {
        const colors = value.match(regExColor);
        if (!colors) return message.reply(fonts.christus(getLang("invalidColor")));
        value = colors.length === 1 ? colors[0] : colors;
      }

      if (value !== "reset" && notSupportImage.includes(key) && typeof value === "string" && value.startsWith("http")) {
        return message.reply(fonts.christus(getLang("notSupportImage", key)));
      }

      switch (key) {
        case "maincolor":
        case "background":
        case "bg":
          value === "reset" ? delete customRankCard.main_color : customRankCard.main_color = value;
          break;
        case "subcolor":
          value === "reset" ? delete customRankCard.sub_color : customRankCard.sub_color = value;
          break;
        case "linecolor":
          value === "reset" ? delete customRankCard.line_color : customRankCard.line_color = value;
          break;
        case "progresscolor":
          value === "reset" ? delete customRankCard.exp_color : customRankCard.exp_color = value;
          break;
        case "expbarcolor":
          value === "reset" ? delete customRankCard.expNextLevel_color : customRankCard.expNextLevel_color = value;
          break;
        case "textcolor":
          value === "reset" ? delete customRankCard.text_color : customRankCard.text_color = value;
          break;
        case "namecolor":
          value === "reset" ? delete customRankCard.name_color : customRankCard.name_color = value;
          break;
        case "rankcolor":
          value === "reset" ? delete customRankCard.rank_color : customRankCard.rank_color = value;
          break;
        case "levelcolor":
        case "lvcolor":
          value === "reset" ? delete customRankCard.level_color : customRankCard.level_color = value;
          break;
        case "expcolor":
          value === "reset" ? delete customRankCard.exp_text_color : customRankCard.exp_text_color = value;
          break;
      }

      try {
        await threadsData.set(event.threadID, customRankCard, "data.customRankCard");
        await message.reply(
          fonts.christus("✨ 🌸 [ INTERFACE DE RENDU MISE À JOUR ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n") +
          fonts.christus(`Attribut [ ${key} ] enregistré avec succès. Génération de l'aperçu...`)
        );
        await sendPreview("Aperçu non disponible.");
      } catch (err) {
        message.err(err);
      }
    } else if (["alphasubcolor", "alphasubcard"].includes(key)) {
      if (parseFloat(value) < 0 || parseFloat(value) > 1) {
        return message.reply(fonts.christus(getLang("invalidAlpha")));
      }
      customRankCard.alpha_subcard = parseFloat(value);
      try {
        await threadsData.set(event.threadID, customRankCard, "data.customRankCard");
        await message.reply(
          fonts.christus("✨ 🌸 [ OPACITY INTERFACE OPTIMIZED ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n") +
          fonts.christus(`Opacité mise à jour à [ ${value} ]. Génération de l'aperçu...`)
        );
        await sendPreview("Aperçu non disponible.");
      } catch (err) {
        message.err(err);
      }
    } else if (key === "reset") {
      try {
        await threadsData.set(event.threadID, {}, "data.customRankCard");
        await message.reply(fonts.christus("✨ 🌸 [ ARCHITECTURE INITIALISÉE ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nConfiguration réinitialisée. Les calques d'origine de la carte de niveau ont été restaurés."));
        await sendPreview("Aperçu non disponible.");
      } catch (err) {
        message.err(err);
      }
    } else {
      message.SyntaxError();
    }
  }
};
