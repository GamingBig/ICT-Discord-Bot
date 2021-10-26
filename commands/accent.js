const Discord = require("discord.js")

module.exports = {
	name: "accent",
	aliases: ["voice"],
	description: "",
	category: "Voice",
	guildOnly: true,
	memberpermissions: "",
	adminPermOverride: true,
	cooldown: 0,
	args: [],
	usage: "&pref;accent",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 * @param {Array} args
	 * @param {String} curPrefix
	 */
	async execute(client, msg, args, curPrefix) {
		var accentMenu = new Discord.MessageSelectMenu()
			.setCustomId("tts-accent-menu")
			.setMaxValues(1)
			.addOptions([
				{ label: "Dutch", value: "nl-NL;Dutch", emoji: "🇳🇱" },
				{ label: "English", value: "en-GB;English", emoji: "🇬🇧" },
				{ label: "German", value: "de-DE;German", emoji: "🇩🇪" },
				{ label: "French", value: "fr-FR;French", emoji: "🇫🇷" },
				{ label: "Turkish", value: "tr-TR;Turkish", emoji: "🇹🇷" },
			])
		var row = new Discord.MessageActionRow().addComponents(accentMenu)
		msg.channel.send({ content: "Please choose a language to be your TTS accent.", components: [row] })
	},
}
