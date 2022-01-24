const Discord = require("discord.js")

module.exports = {
	name: "button",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Interaction} interaction
	 * @param {Array} components
     * @param {Discord.Collection} cooldowns
	 */
	async execute(client, interaction, components, cooldowns) {
		/*
            D- = Did you mean
            H- = Help command
        */
		var curId = interaction.customId
		/* START OF DIDYOUMEAN COMMAND HANDLING */ if (curId.startsWith("D-")) {
			//get all required vars
			var command = curId.substr(2).split(";")[0]
			var msgId = curId.split(";")[1]
			var channelMsg = interaction.channel.messages.cache.get(msgId)
			var args = channelMsg.content.split(" ").slice(1)
			var curPrefix = require("../misc/prefixes.json")[interaction.guildId]

			//get the command that needs to be executed, even if its an alias.
			var curCommand = client.commands.get(command) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(command))
			// Check if args are required
			if (curCommand.args && curCommand.args.length > 0 && !args.length) {
				let reply = `You didn't provide any arguments.`

				if (curCommand.usage) {
					reply += "\nThe proper usage would be: ``" + curCommand.usage.replace("&pref;", curPrefix) + "``."
				}

                //disable all the buttons on the interaction, respond, and return
			    interaction.update({ components: setAllDisabled(components) })
				channelMsg.channel.send(reply)
                return
			}

			// Check if user is in cooldown
			if (!cooldowns.has(curCommand.name)) {
				cooldowns.set(curCommand.name, new Discord.Collection())
			}

			const now = Date.now()
			const timestamps = cooldowns.get(curCommand.name)
			const cooldownAmount = (curCommand.cooldown || 3) * 1000

			if (timestamps.has(channelMsg.author.id)) {
				const expirationTime = timestamps.get(channelMsg.author.id) + cooldownAmount

				if (now < expirationTime) {
					// If user is in cooldown
					const timeLeft = (expirationTime - now) / 1000

                    //disable all the buttons on the interaction, respond, and return
			        interaction.update({ components: setAllDisabled(components) })
					channelMsg.reply("please wait " + timeLeft.toFixed(1) + " more second(s) before reusing the ``" + curCommand.name + "`` command.")
                    return
				}
			} else {
				timestamps.set(channelMsg.author.id, now)
				setTimeout(() => timestamps.delete(channelMsg.author.id), cooldownAmount)
				// Execute command
				try {
					curCommand.execute(client, channelMsg, args, curPrefix)
				} catch (error) {
					console.error(error)
					channelMsg.reply("there was an error trying to execute that command!")
				}
			}

			//disable all the buttons on the interaction
			interaction.update({ components: setAllDisabled(components) })

		} /* START OF HELP COMMAND HANDLING */ else if (curId.startsWith("H-")) {
			// get the help file and prefix
			var helpJSON = require("../misc/help.json")
			var curPrefix = require("../misc/prefixes.json")[interaction.guildId]
			// get current catagory
			var catagory = helpJSON[curId.substr(2)]
			var embed = new Discord.MessageEmbed().setColor("#1ecc18")
			if (interaction.customId == "H-Catagories") {
				embed.setTitle("Please select a catagory.")
			} else {
				embed.setTitle("All commands for catagory: " + curId.substr(2))
			}
			// get all keys for catagory
			for (var key in catagory) {
				embed.addField(key, catagory[key].replace(/&pref;/g, curPrefix))
			}
			//make all buttons to switch
			var buttonRow = new Discord.MessageActionRow()
			var embed2 = new Discord.MessageEmbed().setColor("#1ecc18").setTitle("Please select a catagory.")
			for (var key in helpJSON.Catagories) {
				embed2.addField(key, helpJSON.Catagories[key])
				var keyButton = new Discord.MessageButton()
					.setCustomId("H-" + key)
					.setLabel(key)
					.setStyle(1)
					.setDisabled(false)
				buttonRow.addComponents(keyButton)
			}
			var defButton = new Discord.MessageButton().setLabel("Catagories").setStyle(2).setCustomId("H-Catagories")
			var defButtonRow = new Discord.MessageActionRow().addComponents(defButton)
			interaction.update({ embeds: [embed], components: [buttonRow, defButtonRow] })
		} /* START OF DISMISS COMMAND HANDLING */ else if (curId.startsWith("dismiss")) {
			interaction.message.delete()
			interaction.deferUpdate()
		}
	},
}

// Function set all disabled
/**
 * @param {Array} components
 */
function setAllDisabled(components) {
	components.forEach((element) => {
		element.components.forEach((element) => {
			element.disabled = true
		})
	})
	return components
}
