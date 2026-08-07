const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const fonts = require("../func/fonts.js");

module.exports.config = {
  name: "imagedetail",
  aliases: ["imgdetail"],
  version: "1.2",
  author: "Shade",
  countDown: 5,
  role: 0,
  description: "Affiche les métadonnées d'une image avec style pro",
  category: "image",
  guide: "{pn} reply à une image"
};

module.exports.onStart = async ({ api, event }) => {
  const send = (text) =>
    api.sendMessage(fonts.christus(`📌 ${text}`), event.threadID, event.messageID);

  try {
    const attachment = event.messageReply?.attachments?.[0];
    if (!attachment || attachment.type !== "photo") {
      return send("Réponds à une image pour que je puisse lire ses informations.");
    }

    const imgUrl = attachment.url;
    const imgBuffer = await axios.get(imgUrl, {
      responseType: "arraybuffer"
    }).then(res => res.data);

    const tempPath = path.join(__dirname, `img_${Date.now()}.jpg`);
    await fs.writeFile(tempPath, imgBuffer);

    const metadata = await sharp(imgBuffer).metadata();
    
    const ratioList = [
      { r: 1, l: "1:1" },
      { r: 4 / 3, l: "4:3" },
      { r: 3 / 2, l: "3:2" },
      { r: 16 / 9, l: "16:9" },
      { r: 9 / 16, l: "9:16" },
      { r: 21 / 9, l: "21:9" },
      { r: 3 / 4, l: "3:4" },
      { r: 2 / 3, l: "2:3" }
    ];

    let ratio = "N/A";
    let orientation = "Inconnu";

    if (metadata.width && metadata.height) {
      const ratioDecimal = metadata.width / metadata.height;
      let closest = ratioList[0];
      let diffMin = Math.abs(ratioDecimal - closest.r);

      for (const r of ratioList) {
        const diff = Math.abs(ratioDecimal - r.r);
        if (diff < diffMin) {
          diffMin = diff;
          closest = r;
        }
      }

      ratio = closest.l;
      if (metadata.width > metadata.height) orientation = "Paysage";
      else if (metadata.width < metadata.height) orientation = "Portrait";
      else orientation = "Carré";
    }

    const sizeKB = (imgBuffer.byteLength / 1024).toFixed(2);
    const sizeMB = (imgBuffer.byteLength / (1024 * 1024)).toFixed(2);

    const caption = `╭───────────────✦` +
      `\n│ 📊 𝗜𝗠𝗔𝗚𝗘 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 𝗣𝗥𝗢` +
      `\n├────────────────` +
      `\n│ 📄 Format : ${metadata.format || "N/A"}` +
      `\n│ 📏 Taille : ${metadata.width || 0} x ${metadata.height || 0}px` +
      `\n│ 📐 Ratio : ${ratio}` +
      `\n│ 🧭 Orientation : ${orientation}` +
      `\n│ 📦 Poids : ${sizeKB} KB (${sizeMB} MB)` +
      `\n│ 🧠 Bits : ${metadata.depth || "N/A"}` +
      `\n│ 🎨 Canaux : ${metadata.channels || "N/A"}` +
      `\n│ 🌈 Couleur : ${metadata.space || "N/A"}` +
      `\n│ 🪶 Alpha : ${metadata.hasAlpha ? "Oui" : "Non"}` +
      `\n│ ⚡ Compression : ${metadata.compression || "N/A"}` +
      `\n│ 🔄 Orientation EXIF : ${metadata.orientation || "N/A"}` +
      `\n│ 📈 Progressif : ${metadata.isProgressive ? "Oui" : "Non"}` +
      `\n├────────────────` +
      `\n│ System by Shade` +
      `\n╰───────────────✦`;

    await api.sendMessage(
      {
        body: fonts.christus(caption),
        attachment: fs.createReadStream(tempPath)
      },
      event.threadID,
      async () => await fs.remove(tempPath),
      event.messageID
    );

  } catch (err) {
    console.error(err);
    return api.sendMessage(
      fonts.christus("⚠️ Erreur lors de l'analyse de l'image.\nVeuillez réessayer plus tard."),
      event.threadID,
      event.messageID
    );
  }
};
