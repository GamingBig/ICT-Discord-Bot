const Discord = require("discord.js")
const twig = require('../Twig/');

module.exports = {
	name: "template",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Invite} invite
	 */
	async execute(client, invite) {
		if (invite.expiresTimestamp == null) {
			var expiresAt = "Never"
		} else {
			var expiresAt = twig.msToTime(invite.expiresTimestamp - Date.now())
		}
		if (invite.maxUses == 0) {
			var maxUses = "No limit"
		} else {
			var maxUses = invite.maxUses
		}
		const embed = new Discord.MessageEmbed()
			.setColor("#FF1010")
			.setTitle("Invite Created")
			.addFields([
				{ name: "Creator", value: "<@!" + invite.inviter.id + ">", inline: false },
				{ name: "Expires in", value: expiresAt + "\u200b", inline: false },
				{ name: "Max uses", value: maxUses + "\u200b", inline: false },
				{ name: "Temporary membership", value: invite.temporary + "\u200b", inline: false },
			])

		client.guilds.cache.get(invite.guild.id).systemChannel.send({ embeds: [embed] })
	},
}
