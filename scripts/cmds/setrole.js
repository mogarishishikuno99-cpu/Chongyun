const fonts = require("../func/fonts.js");

module.exports = {
	config: {
		name: "setrole",
		version: "1.5",
		author: "NTKhang",
		countDown: 5,
		role: 3,
		description: {
			vi: "Chỉnh sửa role của lệnh (những lệnh có role < 2)",
			en: "Edit role of command (commands with role < 2)"
		},
		category: "admin",
		guide: {
			vi: "   {pn} <commandName> <new role>: set role mới cho lệnh"
				+ "\n   Với:"
				+ "\n   + <commandName>: tên lệnh"
				+ "\n   + <new role>: role mới của lệnh với:"
				+ "\n   + <new role> = 0: lệnh có thể được sử dụng bởi mọi thành viên trong nhóm"
				+ "\n   + <new role> = 1: lệnh chỉ có thể được sử dụng bởi quản trị viên"
				+ "\n   + <new role> = default: reset role lệnh về mặc định"
				+ "\n   Ví dụ:"
				+ "\n    {pn} rank 1: (lệnh rank sẽ chỉ có thể được sử dụng bởi quản trị viên)"
				+ "\n    {pn} rank 0: (lệnh rank sẽ có thể được sử dụng bởi mọi thành viên trong nhóm)"
				+ "\n    {pn} rank default: reset về mặc định"
				+ "\n—————"
				+ "\n   {pn} [viewrole|view|show]: xem role của những lệnh đã chỉnh sửa",
			en: "   {pn} <commandName> <new role>: set new role for command"
				+ "\n   With:"
				+ "\n   + <commandName>: command name"
				+ "\n   + <new role>: new role of command with:"
				+ "\n   + <new role> = 0: command can be used by all members in group"
				+ "\n   + <new role> = 1: command can be used by admin only"
				+ "\n   + <new role> = default: reset role of command to default"
				+ "\n   Example:"
				+ "\n    {pn} rank 1: (command rank can be used by admin only)"
				+ "\n    {pn} rank 0: (command rank can be used by all members in group)"
				+ "\n    {pn} rank default: reset to default"
				+ "\n—————"
				+ "\n   {pn} [viewrole|view|show]: view role of edited commands"
		}
	},
	langs: {
		vi: {
			noEditedCommand: "✅ Hiện tại nhóm bạn không có lệnh nào được chỉnh sửa role",
			editedCommand: "⚠️ Những lệnh trong nhóm bạn đã chỉnh sửa role:\n",
			noPermission: "❗ Chỉ có quản trị viên mới có thể thực hiện lệnh này",
			commandNotFound: "Không tìm thấy lệnh \"%1\"",
			noChangeRole: "❗ Không thể thay đổi role của lệnh \"%1\"",
			resetRole: "Đã reset role của lệnh \"%1\" về mặc định",
			changedRole: "Đã thay đổi role của lệnh \"%1\" thành %2"
		},
		en: {
			noEditedCommand: "✅ Your group has no edited command",
			editedCommand: "⚠️ Your group has edited commands:\n",
			noPermission: "❗ Only admin can use this command",
			commandNotFound: "Command \"%1\" not found",
			noChangeRole: "❗ Can't change role of command \"%1\"",
			resetRole: "Reset role of command \"%1\" to default",
			changedRole: "Changed role of command \"%1\" to %2"
		}
	},
	onStart: async function ({ message, event, args, role, threadsData, getLang }) {
		// Fonction de repli sécurisée pour getLang si appelé depuis noprefix.js
		const getText = (key, ...val) => {
			try {
				const res = typeof getLang === "function" ? getLang(key, ...val) : key;
				if (!res || res === key) {
					const fallbacks = {
						noEditedCommand: "✅ Your group has no edited command",
						editedCommand: "⚠️ Your group has edited commands:\n",
						noPermission: "❗ Only admin can use this command",
						commandNotFound: `Command "${val[0]}" not found`,
						noChangeRole: `❗ Can't change role of command "${val[0]}"`,
						resetRole: `Reset role of command "${val[0]}" to default`,
						changedRole: `Changed role of command "${val[0]}" to ${val[1]}`
					};
					return fallbacks[key] || key;
				}
				return res;
			} catch {
				return key;
			}
		};

		const { commands, aliases } = global.GoatBot;
		const setRole = await threadsData.get(event.threadID, "data.setRole", {});
		
		if (["view", "viewrole", "show"].includes(args[0])) {
			if (!setRole || Object.keys(setRole).length === 0)
				return message.reply(fonts.christus(getText("noEditedCommand")));
			let msg = getText("editedCommand");
			for (const cmd in setRole) msg += `- ${cmd} => ${setRole[cmd]}\n`;
			return message.reply(fonts.christus(msg));
		}
		
		let commandName = (args[0] || "").toLowerCase();
		let newRole = args[1];
		if (!commandName || (isNaN(newRole) && newRole !== "default"))
			return message.SyntaxError();
			
		if (role < 1)
			return message.reply(fonts.christus(getText("noPermission")));
			
		const command = commands.get(commandName) || commands.get(aliases.get(commandName));
		if (!command)
			return message.reply(fonts.christus(getText("commandNotFound", commandName)));
			
		commandName = command.config.name;
		if (command.config.role > 1)
			return message.reply(fonts.christus(getText("noChangeRole", commandName)));
			
		let Default = false;
		if (newRole === "default" || newRole == command.config.role) {
			Default = true;
			newRole = command.config.role;
		}
		else {
			newRole = parseInt(newRole);
		}
		
		setRole[commandName] = newRole;
		if (Default)
			delete setRole[commandName];
			
		await threadsData.set(event.threadID, setRole, "data.setRole");
		
		const successText = Default === true ? getText("resetRole", commandName) : getText("changedRole", commandName, newRole);
		return message.reply(fonts.christus("✅ " + successText));
	}
};
