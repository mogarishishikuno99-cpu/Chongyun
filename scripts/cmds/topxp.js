const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const fs = require("fs");

function formatCompactExp(num) {
  const absoluteNum = Number(num);
  if (isNaN(absoluteNum) || absoluteNum === 0) return "0 XP";
  if (absoluteNum < 1000) return `${absoluteNum} XP`;
    
  const suffixes = ["", "K", "M", "B", "T"];
  let i = Math.floor(Math.log10(absoluteNum) / 3);
  if (i >= suffixes.length) i = suffixes.length - 1;
    
  const formatted = (absoluteNum / Math.pow(1000, i)).toFixed(1);
  return `${formatted.replace(/\.0$/, "")} ${suffixes[i]} XP`;
}

function drawModernCard(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawRankBadge(ctx, x, y, size, rank) {
  let color = "#22c55e"; 
  if (rank === 1) color = "#4ade80"; 
  if (rank === 2) color = "#2ee59d"; 
  if (rank === 3) color = "#16a34a"; 
    
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = "rgba(10, 15, 13, 0.9)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
    
  ctx.beginPath();
  ctx.moveTo(x, y + size/2);
  ctx.lineTo(x + size/4, y);
  ctx.lineTo(x + 3*size/4, y);
  ctx.lineTo(x + size, y + size/2);
  ctx.lineTo(x + 3*size/4, y + size);
  ctx.lineTo(x + size/4, y + size);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

module.exports = {
  config: {
    name: "topxp",
    aliases: ["topexp", "leveltop"],
    version: "2.0.1",
    author: "Shade × Gemini",
    role: 0,
    category: "economy",
    shortDescription: "Classement d'expérience des membres (Max 3 Pages)",
    guide: "{pn} [page]"
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      const { threadID, messageID, senderID } = event;
      let page = parseInt(args[0]) || 1;
            
      if (page < 1) page = 1;
      if (page > 3) page = 3; 

      const perPage = 7; 
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      let allUsers = await usersData.getAll();
      if (!allUsers || !Array.isArray(allUsers)) {
        return api.sendMessage("❌ Impossible d'accéder à la base de données.", threadID, messageID);
      }

      // Tri des utilisateurs par Expérience (exp)
      let sortedUsers = allUsers
        .map(u => {
          if (!u || !u.userID) return null;
          let expValue = u.exp !== undefined ? Number(u.exp) : Number(u.data?.exp || 0);
          return { userID: u.userID, exp: isNaN(expValue) ? 0 : expValue };
        })
        .filter(Boolean)
        .sort((a, b) => b.exp - a.exp);

      const totalUsers = sortedUsers.length;
      const totalPages = Math.min(3, Math.ceil((totalUsers - 3) / perPage) + 1 || 1);
      const currentPage = page > totalPages ? totalPages : page;

      const canvasWidth = 1400;
      const canvasHeight = 1000;
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      // Arrière-plan dégradé Émeraude
      const bgGrad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      bgGrad.addColorStop(0, '#0a0f0d');
      bgGrad.addColorStop(0.3, '#0d1f17');
      bgGrad.addColorStop(0.6, '#0f2a1d');
      bgGrad.addColorStop(1, '#0a0f0d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Quadrillage technologique
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.03)';
      ctx.lineWidth = 1;
      for (let i = -canvasHeight; i < canvasWidth; i += 60) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + canvasHeight, canvasHeight); ctx.stroke();
      }

      // Effet Néon central
      const emeraldGlow = ctx.createRadialGradient(canvasWidth/2, canvasHeight/2, 100, canvasWidth/2, canvasHeight/2, 600);
      emeraldGlow.addColorStop(0, "rgba(34, 197, 94, 0.06)");
      emeraldGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = emeraldGlow;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Titre principal
      ctx.save();
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#ffffff";
      ctx.font = "italic bold 48px sans-serif";
      ctx.fillText(" GLOBAL XP LEADERBOARD", 50, 85);
      ctx.restore();

      ctx.fillStyle = "rgba(187, 247, 208, 0.6)";
      ctx.font = "600 16px monospace";
      ctx.fillText(`SYSTEM STATUS: ACTIVE | PAGE ${currentPage}/${totalPages} | TOTAL USERS: ${totalUsers}`, 60, 115);

      let listYStart = 200;

      // Podium pour la Page 1 (Top 3 XP)
      if (currentPage === 1) {
        listYStart = 680;
        const podiums = [
          { rank: 2, x: 100, y: 220, w: 350, h: 420, color: "#2ee59d", avSize: 200 },
          { rank: 1, x: 480, y: 150, w: 440, h: 490, color: "#4ade80", avSize: 250 },
          { rank: 3, x: 950, y: 250, w: 350, h: 390, color: "#16a34a", avSize: 180 }
        ];

        for (const p of podiums) {
          const u = sortedUsers[p.rank - 1];
          const name = u ? (await usersData.getName(u.userID) || "Player") : "EMPTY";
          const expText = u ? formatCompactExp(u.exp) : "0 XP";

          ctx.save();
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 25;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.rank === 1 ? 4 : 2;
          ctx.fillStyle = "rgba(10, 15, 13, 0.85)";
          drawModernCard(ctx, p.x, p.y, p.w, p.h, 24);
          ctx.fill(); ctx.stroke();
          ctx.restore();

          if (p.rank === 1) {
            ctx.fillStyle = p.color;
            ctx.font = "70px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("⚜︎", p.x + p.w / 2, p.y - 20);
            ctx.textAlign = "left";
          }

          if (u) {
            let img = null;
            try {
              img = await loadImage(await usersData.getAvatarUrl(u.userID));
            } catch (err) {
              try { img = await loadImage("https://i.imgur.com/I3VsBEt.png"); } catch(e){}
            }

            const centerX = p.x + p.w / 2;
            const centerY = p.y + p.h / 3.2;

            if (img) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(centerX, centerY, p.avSize / 2, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              ctx.drawImage(img, centerX - p.avSize/2, centerY - p.avSize/2, p.avSize, p.avSize);
              ctx.restore();

              ctx.save();
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 20;
              ctx.strokeStyle = p.color;
              ctx.lineWidth = p.rank === 1 ? 6 : 4;
              ctx.beginPath(); ctx.arc(centerX, centerY, p.avSize / 2, 0, Math.PI * 2); ctx.stroke();
              ctx.restore();
            }
          }

          ctx.textAlign = "center";
          ctx.fillStyle = p.color;
          ctx.font = `bold ${p.rank === 1 ? "48px" : "38px"} sans-serif`;
          ctx.fillText(`#${p.rank}`, p.x + p.w / 2, p.y + p.h - 100);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 24px sans-serif";
          ctx.fillText(name.length > 18 ? name.slice(0, 16) + "..." : name, p.x + p.w / 2, p.y + p.h - 65);
          ctx.fillStyle = "#4ade80";
          ctx.font = "bold 26px monospace";
          ctx.fillText(expText, p.x + p.w / 2, p.y + p.h - 30);
          ctx.textAlign = "left";
        }
      }

      // Liste des positions suivantes
      const dataIdxOffset = currentPage === 1 ? 3 : 3 + (currentPage - 2) * perPage;
      const listData = sortedUsers.slice(dataIdxOffset, dataIdxOffset + perPage);
      const topExp = sortedUsers[0]?.exp || 1;
      const cardWidth = canvasWidth - 100;
      const rowHeight = 100;
      const gap = 15;

      for (let i = 0; i < listData.length; i++) {
        const u = listData[i];
        const actualRank = dataIdxOffset + i + 1;
        const y = listYStart + i * (rowHeight + gap);
        const playerName = await usersData.getName(u.userID) || "Player";
        const playerExp = formatCompactExp(u.exp);

        ctx.save();
        ctx.fillStyle = "rgba(10, 15, 13, 0.75)";
        ctx.strokeStyle = "rgba(34, 197, 94, 0.1)";
        if (actualRank === 4) {
          ctx.strokeStyle = "rgba(74, 222, 128, 0.4)";
          ctx.shadowColor = "#4ade80";
          ctx.shadowBlur = 10;
        }
        drawModernCard(ctx, 50, y, cardWidth, rowHeight, 16);
        ctx.fill(); ctx.stroke();
        ctx.restore();

        drawRankBadge(ctx, 80, y + 20, 60, actualRank);

        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText(actualRank.toString(), 110, y + 55);
        ctx.textAlign = "left";

        const avSize = 70;
        const avX = 180;
        const avY = y + 15;
        let img = null;

        try {
          img = await loadImage(await usersData.getAvatarUrl(u.userID));
        } catch (err) {
          try { img = await loadImage("https://i.imgur.com/I3VsBEt.png"); } catch(e){}
        }

        if (img) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, avX, avY, avSize, avSize);
          ctx.restore();

          ctx.save();
          ctx.shadowColor = "#22c55e";
          ctx.shadowBlur = 10;
          ctx.strokeStyle = "#22c55e";
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px sans-serif";
        const cleanName = playerName.length > 25 ? playerName.slice(0, 22) + "..." : playerName;
        ctx.fillText(cleanName, 300, y + 45);

        // Barre de progression XP
        const barWidth = 300;
        const expPercentage = Math.max(0.05, Math.min(1, u.exp / topExp));

        ctx.fillStyle = "rgba(34, 197, 94, 0.05)";
        drawModernCard(ctx, 300, y + 60, barWidth, 10, 5);
        ctx.fill();

        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        drawModernCard(ctx, 300, y + 60, barWidth * expPercentage, 10, 5);
        ctx.fill();

        ctx.textAlign = "right";
        ctx.fillStyle = "#4ade80";
        ctx.font = "bold 30px monospace";
        ctx.fillText(playerExp, canvasWidth - 100, y + rowHeight / 2 + 10);
        ctx.textAlign = "left";
      }

      if (currentPage === 1 && sortedUsers.length > 3) {
         ctx.fillStyle = "rgba(187, 247, 208, 0.4)";
         ctx.font = "16px monospace";
         ctx.textAlign = "center";
         ctx.fillText("💬 Réponds avec un numéro de page (ex: '2') pour naviguer (Max Page 3).", canvasWidth/2, canvasHeight - 20);
         ctx.textAlign = "left";
      }

      const pathSave = path.join(cacheDir, `top_xp_ui_${threadID}_${currentPage}.png`);
      const out = fs.createWriteStream(pathSave);
      canvas.createPNGStream().pipe(out);

      out.on("finish", () => {
        api.sendMessage(
          {
            body: `🏆 **GLOBAL XP LEADERBOARD** (Page ${currentPage}/${totalPages})\nRéponds avec un numéro de page pour naviguer.`,
            attachment: fs.createReadStream(pathSave)
          },
          threadID,
          (err, info) => {
            if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
            if (err) return;
            if (global.GoatBot?.onReply) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: "topxp", // FIXED: Doit correspondre à name: "topxp"
                author: senderID
              });
            }
          },
          messageID
        );
      });
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Erreur lors de la génération du classement XP.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    try {
      const { body, senderID, threadID, messageID } = event;
      if (senderID !== Reply.author) return;

      const page = parseInt(body);
      if (isNaN(page) || page < 1 || page > 3) {
        return api.sendMessage("⚠️ Saisissez un numéro de page valide entre 1 et 3.", threadID, messageID);
      }

      if (global.GoatBot?.onReply) {
        global.GoatBot.onReply.delete(event.messageReply.messageID);
      }

      return this.onStart({
        api,
        event: { ...event, args: [page.toString()] },
        args: [page.toString()],
        usersData
      });
    } catch (err) {
      console.error(err);
    }
  }
};
