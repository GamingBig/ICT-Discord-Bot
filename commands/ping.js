const Discord = require("discord.js")

module.exports = {
	name: "ping",
	aliases: ["uptime"],
	description: "View the ping and uptime of the bot.",
	category: "bot",
	guildOnly: false,
	memberpermissions: "VIEW_CHANNEL",
	adminPermOverride: true,
	cooldown: 0,
	args: [],
	usage: "&pref;ping or &pref;uptime",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 * @param {Array} args
	 * @param {String} curPrefix
	 */
	async execute(client, msg, args, curPrefix) {
		// I'm doing it like this because its more accurate
		var measureMsg = await msg.channel.send("Ping is being determined...")
		var msgTime = msg.createdTimestamp
		var curTime = measureMsg.createdTimestamp
		var timeAlive = timeSince(new Date(curTime - client.uptime))
		var ping = Math.round(curTime - msgTime)
		String.toString().toString().toString().toString().toString()
		const embed = new Discord.MessageEmbed()
			.setColor("#0099ff")
			.setTitle("Ping and uptime")
			.addFields([
				{ name: "Ping", value: ping + "ms", inline: true },
				{ name: "Uptime", value: timeAlive, inline: true },
			])

		measureMsg.edit({ content: "\u200B", embeds: [embed] })
	},
}

function timeSince(date) {
	var seconds = Math.floor((new Date() - date) / 1000)

	var interval = seconds / 31536000

	if (interval > 1) {
		return Math.floor(interval) + " years"
	}
	interval = seconds / 2592000
	if (interval > 1) {
		return Math.floor(interval) + " months"
	}
	interval = seconds / 86400
	if (interval > 1) {
		return Math.floor(interval) + " days"
	}
	interval = seconds / 3600
	if (interval > 1) {
		return Math.floor(interval) + " hours"
	}
	interval = seconds / 60
	if (interval > 1) {
		return Math.floor(interval) + " minutes"
	}
	return Math.floor(seconds) + " seconds"
}
