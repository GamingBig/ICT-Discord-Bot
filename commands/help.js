const Discord = require("Discord.js")
const fs = require("fs")

module.exports = {
	name: "help",
	aliases: [],
	description: "Your looking at it.",
	category: "Bot",
	guildOnly: false,
	memberpermissions: "",
	adminPermOverride: true,
	cooldown: 0,
	args: [],
	usage: "&pref;help",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 * @param {Array} args
	 * @param {String} curPrefix
	 */
	async execute(client, msg, args, curPrefix) {
		const helpJSON = require("../misc/help.json")
		var commands = []
		Object.keys(helpJSON).forEach((value, i) => {
			if (value == "Catagories") {
				return
			}
			Object.keys(helpJSON[value]).forEach((value, i) => {
				commands.push(value)
			})
		})
		var arg2 = args[0]
		if (arg2 === "" || arg2 == undefined) {
			var embed = new Discord.MessageEmbed().setColor("#1ecc18").setTitle("Please select a catagory.")
			var defButton = new Discord.MessageButton().setLabel("Catagories").setStyle(2).setCustomId("H-Catagories")
			var defButtonRow = new Discord.MessageActionRow().addComponents(defButton)
			var buttonRow = new Discord.MessageActionRow()
			for (var key in helpJSON.Catagories) {
				embed.addField(key, helpJSON.Catagories[key])
				var keyButton = new Discord.MessageButton()
					.setCustomId("H-" + key)
					.setLabel(key)
					.setStyle(1)
				buttonRow.addComponents(keyButton)
			}
			msg.channel.send({ embeds: [embed], components: [buttonRow, defButtonRow] })
			return
		}
		var arg2C = arg2.charAt(0).toUpperCase() + arg2.substr(1)
		if (!helpJSON[arg2C]) {
			msg.channel.send("Not a valid catagory.")
			return
		}
		var catagory = helpJSON[arg2C]
		var embed = new Discord.MessageEmbed().setColor("#1ecc18").setTitle("All commands for catagory: " + arg2C)
		for (var key in catagory) {
			embed.addField(key, catagory[key])
		}
		msg.channel.send({ embeds: [embed] })
	},
}
