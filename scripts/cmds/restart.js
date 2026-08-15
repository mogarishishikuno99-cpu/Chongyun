const fs = require("fs-extra");
const path = require("path");
const fonts = require("../func/fonts.js");

module.exports = {
	config: {
		name: "restart",
		version: "1.3",
		author: "NTKhang / Adapted",
		countDown: 5,
		role: 3,
		description: {
			vi: "Khởi động lại bot",
			en: "Restart bot"
		},
		category: "owner",
		guide: {
			vi: "   {pn}: Khởi động lại bot",
			en: "   {pn}: Restart bot"
		}
	},
	langs: {
		vi: {
			restartting: "🔄 | Đang khởi động lại bot..."
		},
		en: {
			restartting: "🔄 | Restarting bot..."
		}
	},
	onLoad: function ({ api }) {
		const pathFile = path.join(__dirname, "tmp", "restart.txt");
		if (fs.existsSync(pathFile)) {
			const content = fs.readFileSync(pathFile, "utf-8").trim();
			const [tid, time] = content.split(" ");
			if (tid && time) {
				api.sendMessage(fonts.christus(`✅ | Bot restarted\n⏰ | Time: ${(Date.now() - Number(time)) / 1000}s`), tid);
			}
			fs.unlinkSync(pathFile);
		}
	},
	onStart: async function ({ message, event, getLang }) {
		const tmpDir = path.join(__dirname, "tmp");
		const pathFile = path.join(tmpDir, "restart.txt");
		
		await fs.ensureDir(tmpDir);
		fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);

		// Récupération sécurisée du texte de langue avec fallback
		let restartText = "🔄 | Restarting bot...";
		try {
			restartText = typeof getLang === "function" ? getLang("restartting") : restartText;
		} catch (e) {}

		const replyText = fonts.christus(restartText);
		
		if (message && typeof message.reply === "function") {
			await message.reply(replyText);
		} else {
			await global.api.sendMessage(replyText, event.threadID, event.messageID);
		}
		
		process.exit(2);
	}
};
