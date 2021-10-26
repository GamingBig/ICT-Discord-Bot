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
		var server = args[0] || "Vizuhfy2.minehut.gg"
		mc.status(server)
			.then((data) => {
				var dataUri = data.favicon.replace(/^data:image\/png;base64,/, "")
				fs.writeFileSync("./mcFavicon.png", dataUri, "base64")
				var file = new Discord.MessageAttachment("./mcFavicon.png")
				if (data.description.descriptionText.toLowerCase().includes("offline")) {
					var color = "#ff0000"
				} else {
					var color = "#0099ff"
				}
				const embed = new Discord.MessageEmbed()
					.setColor(color)
					.setTitle(data.host)
					.setThumbnail("attachment://mcFavicon.png")
					.addFields([
						{ name: "Description", value: "```" + data.description.descriptionText.replace(/(§.)/g, "") + "```", inline: false },
						{ name: "Players", value: `${data.onlinePlayers}/${data.maxPlayers}`, inline: false },
						{ name: "Ping", value: parseFloat(data.roundTripLatency)/2 + 'ms', inline: false },
					])
				msg.channel.send({ embeds: [embed], files: [file] }).then(() => {
					fs.rmSync("./mcFavicon.png")
				})
			})
			.catch((reason) => {
				if (reason.toString().split("\n")[0].startsWith("Error: getaddrinfo ENOTFOUND ")) {
					return msg.channel.send("I couldn't find that server: `" + server.toLowerCase() + "`")
				}
				msg.channel.send(reason.toString().split("\n")[0])
			})
	},
}
