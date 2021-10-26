const Discord = require("discord.js")
const mathJS = require('mathjs')
const twig = require("../Twig")

module.exports = {
	name: "math",
	aliases: ["calc"],
	description: "",
	category: "Misc",
	guildOnly: false,
	memberpermissions: "",
	adminPermOverride: true,
	cooldown: 0,
	args: [""],
	usage: "&pref;math (equasion)",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 * @param {Array} args
	 * @param {String} curPrefix
	 */
	async execute(client, msg, args, curPrefix) {
		var request = args.join(" ")
		try {
            var math = mathJS.evaluate(request)
            if (request.length > 50) {
                request = request.slice(0, 50) + "..."
            }
			const embed = new Discord.MessageEmbed()
				.setColor("#0099ff")
				.setTitle("Math")
				.addFields([
					{ name: "Request", value: "\u200B" + request, inline: true },
					{ name: "Result", value: "\u200B" + math, inline: true },
				])

			msg.channel.send({ embeds: [embed] })
		} catch (error) {
			console.log(error)
			msg.channel.send({content: "That doesn't math right.", components: [twig.discordDismissButton]})
		}
	},
}
