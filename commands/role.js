const Discord = require("discord.js")
const toHex = require("colornames")

module.exports = {
	name: "role",
	aliases: [],
	description: "",
	category: "",
	guildOnly: false,
	memberpermissions: "",
	adminPermOverride: true,
	cooldown: 0,
	args: ["color|name", "color|name"],
	usage: "&pref;role color|name (A color|A role name)",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 * @param {Array} args
	 * @param {String} curPrefix
	 */
	async execute(client, msg, args, curPrefix) {
        var userSettings = require("../misc/userconfig.json")
		/* if (msg.guildId !== "882207507785842738") {
			return
		} */
		var subCommand = args[0]
		if (!subCommand) {
			return msg.channel.send("Please say what you want to change about your role.\nUse `" + curPrefix + "role color` to change the color and `" + curPrefix + "role name` to change the name.")
		}
		try {
			var userRole = userSettings[msg.member.id].role
			userRole = await msg.guild.roles.fetch(userRole)
		} catch (error) {
			return msg.channel.send("Something went wrong trying to get your role.")
		}
		if (subCommand == "color") {
			try {
				if (/^#[0-9A-F]{6}$/i.test(args[1])) {
					var color = args[1]
				} else {
					var color = toHex(args[1])
				}
				if (color == undefined) {
					msg.channel.send("`" + args[1] + "` is not a valid color, if a color name doesnt work please input a hex code.")
					return
				}
				userRole.setColor(color)
				msg.channel.send("The color of your role is now: `"+color+"`");
			} catch(err) {
				console.log(err);
				msg.channel.send("That is not a valid color, if a color name doesnt work please input a hex code.")
			}
		} else if (subCommand == "name") {
			try {
				var name = args.slice(1, args.length).join(" ")
				userRole.setName(name)
				userRole.setHoist(true)
				msg.channel.send("The name of your role is now `"+name+"`")
			} catch (error) {
				console.log(error)
				msg.channel.send("Something went wrong.")
			}
		}
	},
}
