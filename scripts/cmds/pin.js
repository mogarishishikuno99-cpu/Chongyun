/**
 * @author Zetsu & Shade
 * @title Pinterest Catalogue Premium (Infinite Scroll)
 * @name pin
 * @class pinterest
 * @version 3.0.2
 * @description Recherche Pinterest sous forme d'application interactive avec scroll (Next / Prev) et jusqu'à 30 images.
 * @usage pinterest [terme]
 * @alt pin
 */
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function createPinterestScrollCanvas(allPins, query, scrollOffset = 0) {
    // 1. Configuration de la grille Masonry à 3 colonnes
    const canvasWidth = 900;
    const viewportHeight = 1500;
    const padding = 30;
    const gap = 16;
    const cols = 3;
    const colWidth = (canvasWidth - (padding * 2) - (gap * (cols - 1))) / cols;
    const headerHeight = 140;

    // Limite fixée à 30 images
    const maxPins = allPins.slice(0, 30);

    // 2. Préchargement et calcul Masonry
    const loadedItems = await Promise.all(
        maxPins.map(async (pin) => {
            try {
                const img = await loadImage(pin.image);
                const aspectRatio = img.height / img.width;
                const calculatedHeight = Math.max(160, Math.min(450, Math.round(colWidth * aspectRatio)));
                return { img, height: calculatedHeight, success: true };
            } catch (e) {
                return { img: null, height: 220, success: false };
            }
        })
    );

    // 3. Positionnement Masonry
    const colHeights = [headerHeight, headerHeight, headerHeight];
    const itemPositions = [];

    loadedItems.forEach((item, index) => {
        let minCol = 0;
        if (colHeights[1] < colHeights[minCol]) minCol = 1;
        if (colHeights[2] < colHeights[minCol]) minCol = 2;

        const x = padding + minCol * (colWidth + gap);
        const y = colHeights[minCol];

        itemPositions.push({ x, y, width: colWidth, height: item.height, index });
        colHeights[minCol] += item.height + gap;
    });

    // 4. Initialisation du Canvas
    const canvas = createCanvas(canvasWidth, viewportHeight);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvasWidth, viewportHeight);

    function drawRoundedRect(x, y, w, h, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // 5. Zone d'affichage (Viewport Clipping)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, headerHeight - 20, canvasWidth, viewportHeight - (headerHeight - 20));
    ctx.clip();

    for (let i = 0; i < itemPositions.length; i++) {
        const pos = itemPositions[i];
        const drawY = pos.y - scrollOffset;

        if (drawY + pos.height < headerHeight - 40 || drawY > viewportHeight + 40) {
            continue;
        }

        const item = loadedItems[pos.index];
        const cornerRadius = 16;

        ctx.save();

        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 6;

        ctx.fillStyle = "#1e1e1e";
        drawRoundedRect(pos.x, drawY, pos.width, pos.height, cornerRadius);
        ctx.fill();

        ctx.shadowColor = "transparent";

        ctx.save();
        drawRoundedRect(pos.x, drawY, pos.width, pos.height, cornerRadius);
        ctx.clip();

        if (item.success && item.img) {
            ctx.drawImage(item.img, pos.x, drawY, pos.width, pos.height);
        } else {
            ctx.fillStyle = "#2a2a2a";
            ctx.fillRect(pos.x, drawY, pos.width, pos.height);
            ctx.fillStyle = "#8e8e93";
            ctx.font = "bold 15px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Image indisponible", pos.x + pos.width / 2, drawY + pos.height / 2);
            ctx.textAlign = "left";
        }
        ctx.restore();

        // Badge (#1, #2, ... #30)
        const badgeText = `#${pos.index + 1}`;
        ctx.font = "bold 13px sans-serif";
        const textMetrics = ctx.measureText(badgeText);
        const badgeWidth = textMetrics.width + 16;
        const badgeHeight = 24;
        const badgeX = pos.x + 10;
        const badgeY = drawY + 10;

        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        drawRoundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 12);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        ctx.restore();
    }
    ctx.restore();

    // 6. En-tête fixe
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvasWidth, headerHeight - 10);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("🔍 Recherche Pinterest", padding, 55);

    ctx.fillStyle = "#9ca3af";
    ctx.font = "18px sans-serif";
    ctx.fillText(`Résultats pour "${query}" • ${maxPins.length} images au total`, padding, 92);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, headerHeight - 15);
    ctx.lineTo(canvasWidth - padding, headerHeight - 15);
    ctx.stroke();

    // 7. Sauvegarde du fichier
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const cachePath = path.join(cacheDir, `pin_scroll_${Date.now()}.png`);
    await fs.writeFile(cachePath, canvas.toBuffer("image/png"));

    const maxScroll = Math.max(0, Math.max(...colHeights) - viewportHeight + 40);

    return { cachePath, maxScroll };
}

module.exports = {
    config: {
        name: "pin",
        aliases: ["pinterest"],
        version: "3.0.2",
        author: "Zetsu & Shade",
        countDown: 5,
        role: 0,
        category: "image",
        guide: {
            fr: "{p}{n} <recherche>\nExemple: {p}{n} naruto"
        }
    },
    onStart: async function ({ api, event, message, args, commandName }) {
        const { threadID, messageID, senderID } = event;
        const query = args.join(" ");

        if (!query) {
            return message.reply("❌ Veuillez entrer un mot-clé pour lancer la recherche interactive.");
        }

        const apiUrl = `https://zetbot-page.onrender.com/api/pinterest?query=${encodeURIComponent(query)}&limit=32`;

        try {
            const loadingMsg = await message.reply("🔍 Chargement du catalogue Pinterest...");
            const response = await axios.get(apiUrl);

            if (!response.data.status || !response.data.pins || response.data.pins.length === 0) {
                try { api.unsendMessage(loadingMsg.messageID); } catch(e){}
                return message.reply("❌ Aucun résultat trouvé pour cette recherche.");
            }

            const allPins = response.data.pins.slice(0, 30);
            const { cachePath, maxScroll } = await createPinterestScrollCanvas(allPins, query, 0);

            try { api.unsendMessage(loadingMsg.messageID); } catch(e){}

            const sentMessage = await api.sendMessage({
                body: `📸 **𝖯𝖨𝖭𝖳𝖤𝖱𝖤𝖲𝖳 𝖥𝖤𝖤𝖣** (30 images)\n\n💬 **Navigation :**\n• Répondez **\`next\`** pour faire défiler vers le bas (Scroll).\n• Répondez **\`prev\`** ou **\`back\`** pour remonter.\n• Répondez avec un numéro (\`1\` à \`30\`) pour recevoir l'image HD.`,
                attachment: fs.createReadStream(cachePath)
            }, threadID, messageID);

            global.GoatBot?.onReply?.set(sentMessage.messageID, {
                commandName,
                author: senderID,
                query,
                allPins,
                scrollOffset: 0,
                maxScroll,
                messageID: sentMessage.messageID
            });

            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        } catch (error) {
            console.error(error);
            return message.reply(`❌ Une erreur est survenue lors de la recherche : ${error.message}`);
        }
    },
    onReply: async function ({ api, event, Reply, message, commandName }) {
        const { senderID, threadID, messageID, body } = event;
        const { author, query, allPins, scrollOffset = 0, maxScroll = 0, messageID: replyMsgID } = Reply || {};

        if (senderID !== author) return;

        const input = (body || "").trim().toLowerCase();

        // ---- NAVIGATION PAR SCROLL ----
        if (input === "next" || input === "prev" || input === "back") {
            const scrollStep = 550;
            let newScrollOffset = scrollOffset;

            if (input === "next") {
                if (scrollOffset >= maxScroll) {
                    return message.reply("❌ Vous avez atteint le bas du fil d'actualité.");
                }
                newScrollOffset = Math.min(scrollOffset + scrollStep, maxScroll);
            } else {
                if (scrollOffset <= 0) {
                    return message.reply("❌ Vous êtes tout en haut du fil d'actualité.");
                }
                newScrollOffset = Math.max(0, scrollOffset - scrollStep);
            }

            try { api.unsendMessage(replyMsgID); } catch (e) {}

            const { cachePath, maxScroll: updatedMaxScroll } = await createPinterestScrollCanvas(allPins, query, newScrollOffset);

            const sentMessage = await api.sendMessage({
                body: `📸 **𝖯𝖨𝖭𝖳𝖤𝖱𝖤𝖲𝖳 𝖥𝖤𝖤𝖣**\n\n💬 Répondez **\`next\`** ou **\`prev\`** pour scroller.\n💬 Tapez un numéro (\`1\` à \`30\`) pour obtenir l'image HD.`,
                attachment: fs.createReadStream(cachePath)
            }, threadID, messageID);

            global.GoatBot?.onReply?.set(sentMessage.messageID, {
                commandName,
                author: senderID,
                query,
                allPins,
                scrollOffset: newScrollOffset,
                maxScroll: updatedMaxScroll,
                messageID: sentMessage.messageID
            });

            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
            return;
        }

        // ---- SÉLECTION DE L'IMAGE HD (#1 À #30) ----
        const selection = parseInt(input, 10);
        if (!isNaN(selection) && selection >= 1 && selection <= allPins.length) {
            const selectedPin = allPins[selection - 1];

            if (!selectedPin || !selectedPin.image) {
                return message.reply("❌ Données de l'image introuvables.");
            }

            const ext = selectedPin.image.split('.').pop().split('?')[0] || "jpg";
            const cacheDir = path.join(__dirname, "cache");
            await fs.ensureDir(cacheDir);
            const cachePath = path.join(cacheDir, `pin_hd_${Date.now()}.${ext}`);

            try {
                const downloadNotice = await message.reply(`📥 Extraction et envoi de l'image HD n°${selection}...`);
                const response = await axios({
                    method: "get",
                    url: selectedPin.image,
                    responseType: "stream"
                });

                const writer = fs.createWriteStream(cachePath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on("finish", resolve);
                    writer.on("error", reject);
                });

                try { api.unsendMessage(downloadNotice.messageID); } catch(e){}

                await api.sendMessage({
                    body: `✨ **I𝖬𝖠𝖦𝖤 𝖤𝖷𝖳𝖱𝖠𝖨𝖳𝖤 (#${selection})** ✨\n\n📝 Titre : ${selectedPin.title || "Sans titre"}\n👤 Compte : ${selectedPin.uploader?.username || "Inconnu"}`,
                    attachment: fs.createReadStream(cachePath)
                }, threadID, () => {
                    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
                }, messageID);
            } catch (e) {
                console.error(e);
                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
                return message.reply("❌ Impossible de récupérer cette image en haute résolution.");
            }
        }
    }
};
