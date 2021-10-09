const Discord = require("discord.js")
const fs = require("fs")

module.exports = {
	name: "prefix",
	aliases: [],
	description: "",
	category: "",
	guildOnly: false,
	memberpermissions: "",
	adminPermOverride: true,
	cooldown: 0,
	args: [],
	usage: "Change the prefix for this server.",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 * @param {Array} args
	 * @param {String} curPrefix
	 */
	async execute(client, msg, args, curPrefix) {
		var prefixFile = require("../misc/prefixes.json")
		if (!args[0] || args[0] == "") {
			return msg.channel.send("Please provide a prefix.")
		}
		var prefix = args[0]
		prefixFile[msg.guildId] = prefix
		fs.writeFileSync(__dirname + "/../misc/prefixes.json", JSON.stringify(prefixFile))
		msg.channel.send("Changed the prefix to `" + prefix + "`\n\nThis will take effect in about 1-3 seconds.")
	},
}
