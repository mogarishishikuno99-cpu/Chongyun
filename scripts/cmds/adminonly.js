const fs = require("fs-extra");
const fonts = require("../func/fonts.js");

module.exports = {
	config: {
		name: "adminonly",
		aliases: ["adonly", "onlyad", "onlyadmin"],
		version: "1.7.0",
		author: "NTKhang & Gemini",
		countDown: 5,
		role: 3,
		description: {
			fr: "Activer ou désactiver le mode où seul l'admin peut utiliser le bot",
			en: "Turn on/off only admin can use bot"
		},
		category: "owner",
		guide: {
			fr: "{pn} [on | off] : Activer/Désactiver le mode admin unique\n{pn} noti [on | off] : Activer/Désactiver les notifications de refus",
			en: "{pn} [on | off] : Turn on/off only admin mode\n{pn} noti [on | off] : Turn on/off access denied notifications"
		}
	},
	langs: {
		fr: {
			turnedOn: "Le mode 'Seul l'administrateur peut utiliser le bot' est désormais ACTIVÉ.",
			turnedOff: "Le mode 'Seul l'administrateur peut utiliser le bot' est désormais DÉSACTIVÉ.",
			turnedOnNoti: "Les notifications d'avertissement pour les non-admins sont désormais ACTIVÉES.",
			turnedOffNoti: "Les notifications d'avertissement pour les non-admins sont désormais DÉSACTIVÉES."
		},
		en: {
			turnedOn: "The mode 'Only admin can use the bot' has been ENABLED.",
			turnedOff: "The mode 'Only admin can use the bot' has been DISABLED.",
			turnedOnNoti: "Access denied notifications for non-admin users have been ENABLED.",
			turnedOffNoti: "Access denied notifications for non-admin users have been DISABLED."
		}
	},
	onStart: async function ({ args, message, getLang }) {
		const configPath = global.client.dirConfig;
		const currentConfig = global.GoatBot.config;
		
		if (!currentConfig.adminOnly) currentConfig.adminOnly = {};
		if (!currentConfig.hideNotiMessage) currentConfig.hideNotiMessage = {};
		
		let isSetNoti = false;
		let value;
		let indexGetVal = 0;
		
		if (args[0]?.toLowerCase() === "noti") {
			isSetNoti = true;
			indexGetVal = 1;
		}
		
		const action = args[indexGetVal]?.toLowerCase();
		if (action === "on") {
			value = true;
		} else if (action === "off") {
			value = false;
		} else {
			return message.reply(fonts.christus("❌ | ") + fonts.christus("Syntaxe invalide. Utilisez '{pn} on' ou '{pn} off'."));
		}
		
		try {
			let langKey = "";
			if (isSetNoti) {
				currentConfig.hideNotiMessage.adminOnly = !value;
				langKey = value ? "turnedOnNoti" : "turnedOffNoti";
			} else {
				currentConfig.adminOnly.enable = value;
				langKey = value ? "turnedOn" : "turnedOff";
			}
			
			fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 4));
			
			const icon = isSetNoti ? (value ? "🔔 | " : "🔕 | ") : "✅ | ";
			return message.reply(fonts.christus(icon) + fonts.christus(getLang(langKey)));
		} catch (error) {
			console.error("[ERROR adminonly]:", error);
			return message.reply(fonts.christus("❌ | Une erreur est survenue lors de la réécriture du fichier de configuration."));
		}
	}
};
