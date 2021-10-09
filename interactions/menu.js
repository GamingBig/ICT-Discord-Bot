const Discord = require("discord.js")

module.exports = {
	name: "menu",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Interaction} interaction
	 * @param {Array} components
	 */
	async execute(client, interaction, components) {
		/* 
            A- = Accent selection menu
        */
		var curId = interaction.customId
		if (condition) {

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
