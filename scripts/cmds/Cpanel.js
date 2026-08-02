const os = require("os");
const moment = require("moment-timezone");
const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");
const fs = require("fs");
const path = require("path");
const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "cpanel",
    aliases: ["panel", "dashboard"],
    version: "6.0.1",
    author: "Shade × Gemini",
    description: "💎 Panneau de contrôle Cyber Émeraude Premium",
    usage: "cpanel",
    category: "system",
    role: 0
  },
  onStart: async function ({ api, event }) {
    try {
      const width = 1000, height = 750;
      const encoder = new GIFEncoder(width, height);
      const fileName = `cyber_panel_${Date.now()}.gif`;
      const filePath = path.join(__dirname, fileName);
      const stream = fs.createWriteStream(filePath);
      encoder.createReadStream().pipe(stream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(140);
      encoder.setQuality(10);
      
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      const formatUptime = (sec) => {
        const d = Math.floor(sec / 86400);
        const h = Math.floor((sec % 86400) / 3600);
        const m = Math.floor((sec % 3600) / 60);
        return `${d}j ${h}h ${m}m`;
      };

      const getStats = () => {
        const uptime = os.uptime();
        const total = os.totalmem() / 1024 / 1024 / 1024;
        const free = os.freemem() / 1024 / 1024 / 1024;
        const used = total - free;
        return [
          ["CORE UPTIME", formatUptime(process.uptime())],
          ["CPU CORES", `${os.cpus().length} Cores`],
          ["NODE VERSION", process.version],
          ["RAM USAGE", (used / total * 100).toFixed(1) + "%"],
          ["SYS UPTIME", formatUptime(uptime)],
          ["CPU LOAD", os.loadavg()[0].toFixed(2)],
          ["TOTAL RAM", total.toFixed(1) + " GB"]
        ];
      };

      const cyberColors = ["#22c55e", "#4ade80", "#10b981", "#06b6d4", "#22d3ee", "#14b8a6"];
      
      const drawHex = (x, y, r, label, value, strokeColor, frame) => {
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = Math.PI / 3 * i;
          const x_i = x + r * Math.cos(angle);
          const y_i = y + r * Math.sin(angle);
          i === 0 ? ctx.moveTo(x_i, y_i) : ctx.lineTo(x_i, y_i);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(10, 20, 15, 0.6)";
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 15;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(187, 247, 208, 0.7)";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(label, x, y - 12);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px monospace";
        ctx.fillText(value, x, y + 18);
      };

      const cx = width / 2;
      const cy = height / 2 + 30;
      const spacing = 200;
      const positions = [
        [cx, cy - spacing],
        [cx + spacing, cy - spacing / 2],
        [cx + spacing, cy + spacing / 2],
        [cx, cy + spacing],
        [cx - spacing, cy + spacing / 2],
        [cx - spacing, cy - spacing / 2],
        [cx, cy]
      ];

      for (let frame = 0; frame < 20; frame++) {
        const stats = getStats();
        ctx.clearRect(0, 0, width, height);

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#0a0f0d");
        gradient.addColorStop(0.5, "#0d1f17");
        gradient.addColorStop(1, "#0a0f0d");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
        for (let i = 0; i < 40; i++) {
          let starX = (Math.sin(i + frame) * 0.5 + 0.5) * width;
          let starY = (Math.cos(i * 2 + frame) * 0.5 + 0.5) * height;
          ctx.beginPath();
          ctx.arc(starX, starY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 38px sans-serif";
        ctx.textAlign = "center";
        ctx.shadowColor = "#22c55e";
        ctx.shadowBlur = 18;
        ctx.fillText("⚙️ SYSTEM CONTROL PANEL", width / 2, 85);
        ctx.restore();

        ctx.fillStyle = "rgba(34, 197, 94, 0.5)";
        ctx.font = "600 14px monospace";
        ctx.textAlign = "center";
        ctx.fillText("⚡ PREMIUM SYSTEM GATEWAY OVERVIEW ⚡", width / 2, 120);

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "600 15px monospace";
        ctx.textAlign = "right";
        ctx.fillText(
          "🕒 " + moment().tz("Africa/Kinshasa").format("DD/MM/YYYY | HH:mm:ss"),
          width - 40,
          45
        );
        ctx.textAlign = "left";
        ctx.fillText(`💻 PLATFORM : ${os.platform().toUpperCase()} (x64)`, 40, 45);

        for (let i = 0; i < stats.length; i++) {
          const colorIndex = (frame + i) % cyberColors.length;
          const color = cyberColors[colorIndex];
          drawHex(positions[i][0], positions[i][1], 100, stats[i][0], stats[i][1], color, frame);
        }

        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(34, 197, 94, 0.3)";
        ctx.font = "600 13px monospace";
        ctx.fillText("♦ DESIGN BY SHADE ♦ ENGINE MATRIX OVERLOAD ♦", width / 2, height - 30);
        encoder.addFrame(ctx);
      }

      encoder.finish();

      stream.on("finish", () => {
        const msgBody = fonts.christus("⚡ [CYBER-PANEL] Terminal central rechargé avec succès. Données à jour.");
        api.sendMessage({
          body: msgBody,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      });
    } catch (err) {
      console.error(err);
      const errBody = fonts.christus("❌ Échec de l'initialisation du terminal Matrix.");
      api.sendMessage(errBody, event.threadID);
    }
  }
};
