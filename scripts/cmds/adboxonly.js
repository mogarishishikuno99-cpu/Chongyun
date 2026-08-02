const fonts = require("../func/fonts.js");

module.exports = {
	config: {
		name: "onlyadminbox",
		aliases: ["onlyadbox", "adboxonly", "adminboxonly"],
		version: "1.6",
		author: "NTKhang x Hori",
		countDown: 5,
		role: 1,
		description: {
			fr: "Hori verrouille le bot pour que seuls les admins du groupe puissent l'utiliser.",
			en: "Hori locks the bot so only group admins can use it."
		},
		category: "system",
		guide: {
			fr: "   {pn} [on | off] : Activer ou désactiver le mode admin unique."
				+ "\n   {pn} noti [on | off] : Activer ou couper les notifications pour les non-admins.",
			en: "   {pn} [on | off]: Turn on/off only admin box mode."
				+ "\n   {pn} noti [on | off]: Turn on/off notifications for non-admins."
		}
	},
	langs: {
		fr: {
			turnedOn: "✅ | C'est fait ! Maintenant, je n'écoute plus que les admins de ce groupe. Les autres, pas bouger !",
			turnedOff: "✅ | Libre accès ! Tout le monde peut recommencer à me parler ici... Ne me faites pas regretter mon choix !",
			turnedOnNoti: "✅ | Alerte activée ! Je vais afficher un message si un membre lambda essaie de me donner des ordres.",
			turnedOffNoti: "✅ | Silence radio. S'ils essaient de m'utiliser, je vais juste les ignorer en douce.",
			syntaxError: "❌ | Raaah, tu t'es trompé(e) ! Écris correctement '{pn} on' ou '{pn} off'. C'est pourtant pas si compliqué !"
		},
		en: {
			turnedOn: "✅ | Done! Now I only listen to the group admins. Everyone else, back off!",
			turnedOff: "✅ | Open access! Everyone can talk to me again... Don't make me regret this!",
			turnedOnNoti: "✅ | Alert on! I'll call out anyone who isn't an admin trying to boss me around.",
			turnedOffNoti: "✅ | Silence. If they try to use me, I'll just ignore them quietly.",
			syntaxError: "❌ | Ugh, you messed up! Use '{pn} on' or '{pn} off'. It's not that hard!"
		}
	},
	onStart: async function ({ args, message, event, threadsData, getLang }) {
		let isSetNoti = false;
		let value;
		let keySetData = "data.onlyAdminBox";
		let indexGetVal = 0;
		
		if (args.length === 0) {
			return message.reply(fonts.christus(getLang("syntaxError")));
		}
		if (args[0] === "noti") {
			isSetNoti = true;
			indexGetVal = 1;
			keySetData = "data.hideNotiMessageOnlyAdminBox";
		}
		const action = args[indexGetVal];
		if (action === "on") {
			value = true;
		} else if (action === "off") {
			value = false;
		} else {
			return message.reply(fonts.christus(getLang("syntaxError")));
		}
		
		const finalValue = isSetNoti ? !value : value;
		await threadsData.set(event.threadID, finalValue, keySetData);
		
		let textResponse = "";
		if (isSetNoti) {
			textResponse = value ? getLang("turnedOnNoti") : getLang("turnedOffNoti");
		} else {
			textResponse = value ? getLang("turnedOn") : getLang("turnedOff");
		}
		
		return message.reply(fonts.christus(textResponse));
	}
};
