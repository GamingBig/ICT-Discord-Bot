const Discord = require("discord.js")
const ud = require('urban-dictionary')

module.exports = {
	name: "dictionary",
	aliases: ["word"],
	description: "",
	category: "Misc",
	guildOnly: false,
	memberpermissions: "",
	adminPermOverride: true,
	cooldown: 10,
	args: [],
	usage: "&pref;dictionary (word)",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 * @param {Array} args
	 * @param {String} curPrefix
	 */
	async execute(client, msg, args, curPrefix) {
		var search = args.join(" ")
		ud.define(search, (err, results) => {
			if (err) {
				if (err.message == "No results found.") {
					msg.channel.send("No results found.")
					return
				}
				return console.log(err)
			}
			try {
				var result = results[0]
				if (result.example.length + result.definition.length > 900) {
					return msg.channel.send("Message too long.\n\nPlease go to the page yourself: " + result.permalink)
				}
				const embed = new Discord.MessageEmbed()
					.setColor("#0099ff")
					.setTitle("Dictionary definition")
					.setDescription("Highly accurate.")
					.addFields([
						{ name: "Word:", value: result.word.charAt(0).toUpperCase() + result.word.substring(1), inline: true },
						{ name: "Author:", value: result.author, inline: true },
						{ name: "Definition", value: result.definition.replace(/[\[\]]/g, ""), inline: false },
						{ name: "Example", value: result.example.replace(/[\[\]]/g, ""), inline: false },
					])
				msg.channel.send({ embeds: [embed] })
			} catch (err) {
				msg.channel.send("An error occured: " + err)
			}
		})
	},
}
