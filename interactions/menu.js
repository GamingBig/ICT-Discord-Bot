const Discord = require("discord.js")
const fs = require("fs")

module.exports = {
	name: "menu",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Interaction} interaction
	 * @param {Array} components
     * @param {Discord.Collection} cooldowns
	 */
	async execute(client, interaction, components, cooldowns) {
		/* 
            1: Accent selection menu
        */
		var curId = interaction.customId
		
		if (curId == "tts-accent-menu") {
			var userSettings = require("../misc/userconfig.json")
			var accent = interaction.values[0].split(";")[0]
			if (!userSettings[interaction.user.id]) {
				userSettings[interaction.user.id] = {}
			}
			userSettings[interaction.user.id].ttsAccent = accent
			fs.writeFileSync("./misc/userconfig.json", JSON.stringify(userSettings))
			var newContent = interaction.message.content.split("\n")[0] + "\n\n<@!" + interaction.user.id + ">'s TTS accent is now: `" + interaction.values[0].split(";")[1] + "`"
			interaction.update({ content: newContent })
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
