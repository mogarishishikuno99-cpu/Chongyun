const axios = require("axios");
const fonts = require("../func/fonts.js");

module.exports = {
	config: {
		name: "setavt",
		aliases: ["changeavt", "setavatar"],
		version: "1.4",
		author: "NTKhang / Adapted",
		countDown: 5,
		role: 4,
		description: {
			en: "Modifier l'avatar du bot"
		},
		category: "admin",
		guide: {
			en: "   {pn} [<url de l'image> | <répondre à un message avec une photo>] [<légende> | vide] [<expiration en secondes> | vide]"
				+ "\nRépondre à un message contenant une image avec la commande : {pn}"
				+ "\nEnvoyer un message avec une image et la légende : {pn}"
				+ "\n\nNotes :"
				+ "\n  + légende : le texte qui accompagnera le changement d'avatar"
				+ "\n  + expiration : définit un avatar temporaire (disparaît après x secondes)"
				+ "\nExemples :"
				+ "\n   {pn} https://example.com/image.jpg : (change l'avatar sans légende ni expiration)"
				+ "\n   {pn} https://example.com/image.jpg Bonjour : (change l'avatar avec la légende \"Bonjour\")"
				+ "\n   {pn} https://example.com/image.jpg Bonjour 3600 : (change l'avatar avec légende, expire dans 1h)"
		}
	},
	langs: {
		en: {
			cannotGetImage: "❌ | Une erreur est survenue lors de la récupération de l'URL de l'image",
			invalidImageFormat: "❌ | Le format de l'image n'est pas valide",
			changedAvatar: "✅ | L'avatar du bot a été modifié avec succès !"
		}
	},
	onStart: async function ({ message, event, api, args, getLang }) {
		const imageURL = (args[0] || "").startsWith("http") ? args.shift() : event.attachments[0]?.url || event.messageReply?.attachments[0]?.url;
		const expirationAfter = !isNaN(args[args.length - 1]) ? args.pop() : null;
		const caption = args.join(" ");
		
		if (!imageURL)
			return message.SyntaxError();
			
		let response;
		try {
			response = (await axios.get(imageURL, {
				responseType: "stream"
			}));
		}
		catch (err) {
			return message.reply(fonts.christus(getLang("cannotGetImage")));
		}
		
		if (!response.headers["content-type"].includes("image"))
			return message.reply(fonts.christus(getLang("invalidImageFormat")));
			
		response.data.path = "avatar.jpg";
		
		api.changeAvatar(response.data, caption, expirationAfter ? expirationAfter * 1000 : null, (err) => {
			if (err)
				return message.err(err);
			return message.reply(fonts.christus(getLang("changedAvatar")));
		});
	}
};
