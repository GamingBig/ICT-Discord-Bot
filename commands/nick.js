const Discord = require("discord.js")
const fs = require("fs")
const twig = require("../Twig")

module.exports = {
	name: "nick",
	aliases: [],
	description: "",
	category: "User",
	guildOnly: true,
	memberpermissions: "",
	adminPermOverride: true,
	cooldown: 0,
	args: [""],
	usage: "&pref;nick (Nickname).",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 * @param {Array} args
	 * @param {String} curPrefix
	 */
	async execute(client, msg, args, curPrefix) {
        var userSettings = require("../misc/userconfig.json")

		if (msg.member.permissions.has("ADMINISTRATOR")) {
			return msg.channel.send({content: "I cant change the nick of an admin.", components: [twig.discordDismissButton]})
		}
		if (!args.join(" ").includes("(")) {
			if (userSettings[msg.member.id] && userSettings[msg.member.id].name) {
				var newName = args.join(" ") + " (" + userSettings[msg.member.id].name + ")"
				newName = newName.replace(/( \(undefined)\w+/g, "")
				if (newName.length > 32) {
					return msg.channel.send({content: "Name needs to be 32 characters or less.", components: [twig.discordDismissButton] })
				}
				await msg.member.setNickname(newName)
				return msg.channel.send("Your nickname is now: `" + newName + "`")
			}
			if (args.join(" ") > 32) {
				return msg.channel.send({content: "Name needs to be 32 characters or less.", components: [twig.discordDismissButton] })
			}
			msg.member.setNickname(args.join(" "))
			msg.channel.send("Your nickname is now: `" + args.join(" ") + "`\n\nPlease add your real name to your nickname like this: `XX_SniperKiller_XX (Karel)`.")
			return
		}
		var newName = args.join(" ")
		newName = newName.replace(/( \(undefined)\w+/g, "")
		if (newName.length > 32) {
			return msg.channel.send({content: "Name needs to be 32 characters or less.", components: [twig.discordDismissButton] })
		}
		await msg.member.setNickname(newName)
		msg.channel.send("Your nickname is now: `" + newName + "`")
		var realName = newName.split("(")[newName.split("(").length - 1].split(")")[0]
		if (!userSettings[msg.member.id]) {
			userSettings[msg.member.id] = {}
		}
		userSettings[msg.member.id].name = realName
		fs.writeFileSync("./misc/userconfig.json", JSON.stringify(userSettings))
	},
}