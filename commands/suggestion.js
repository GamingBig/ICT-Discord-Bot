const Discord = require("discord.js")

module.exports = {
	name: "suggestion",
	aliases: ["bug"],
	description: "",
	category: "Bot",
	guildOnly: false,
	memberpermissions: "",
	adminPermOverride: true,
	cooldown: 0,
	args: [""],
	usage: "&pref;suggestion (Your suggestion)",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 * @param {Array} args
	 * @param {String} curPrefix
	 */
	async execute(client, msg, args, curPrefix) {
		var suggestion = args.join(" ")
		const embed = new Discord.MessageEmbed()
			.setColor("#0099ff")
			.setTitle("Suggestion from `" + msg.member.displayName + "#" + msg.author.discriminator)
			.setDescription(suggestion)

		var joeryUser = client.users.cache.find(({ id }) => id == "255730583655809025")
		joeryUser.send({ embeds: [embed] })
		msg.channel.send("Suggestion sent to " + joeryUser.username + ".")
	},
}
