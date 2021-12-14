const Discord = require("discord.js")
const mc = require("minecraft-server-util")
const fs = require("fs")

module.exports = {
	name: "mc",
	aliases: ["fuckmc", "banmc", "removemc"],
	description: "",
	category: "Misc",
	guildOnly: false,
	memberpermissions: "",
	adminPermOverride: true,
	cooldown: 0,
	args: [],
	usage: "&pref;mc (optional: server IP)",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 * @param {Array} args
	 * @param {String} curPrefix
	 */
	async execute(client, msg, args, curPrefix) {
		msg.channel.sendTyping()
		var server = args[0] || "localhost"
		mc.status(server)
			.then((data) => {
				if (data.favicon) {
					var dataUri = data.favicon.replace(/^data:image\/png;base64,/, "")
					fs.writeFileSync("./mcFavicon.png", dataUri, "base64")
					var file = new Discord.MessageAttachment("./mcFavicon.png")
				}
				if (data.description.descriptionText.toLowerCase().includes("offline")) {
					var color = "#ff0000"
				} else {
					var color = "#0099ff"
				}
				if (data.host == "localhost") {
					var title = "Joery's 1.18 server"
				} else {
					var title = data.host
				}
				const embed = new Discord.MessageEmbed()
					.setColor(color)
					.setTitle(title)
					.addFields([
						{ name: "Description", value: "```" + data.description.descriptionText.replace(/(§.)/g, "") + "```", inline: false },
						{ name: "Players", value: `${data.onlinePlayers}/${data.maxPlayers}`, inline: false },
						{ name: "Ping", value: parseFloat(data.roundTripLatency) / 2 + "ms", inline: false },
					])

				if (data.favicon) {
					embed.setThumbnail("attachment://mcFavicon.png")
					msg.channel.send({ embeds: [embed], files: [file] }).then(() => {
						fs.rmSync("./mcFavicon.png")
					})
				} else {
					msg.channel.send({ embeds: [embed] })
				}
			})
			.catch((reason) => {
				if (reason.toString().split("\n")[0].startsWith("Error: getaddrinfo ENOTFOUND ")) {
					return msg.channel.send("I couldn't find that server: `" + server.toLowerCase() + "`")
				}
				console.log(reason)
				msg.channel.send(reason.toString().split("\n")[0])
			})
	},
}
