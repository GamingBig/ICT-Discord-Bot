const Discord = require("discord.js")

module.exports = {
	name: "RoleInitMsg",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 */
	async execute(client, msg) {
        var userSettings = require("../misc/userconfig.json")
		if (msg.member.id == client.user.id) {
			return
		}
		// check if channel is correct and if the user has the correct role.
		if (msg.channelId !== "898123345751592970" && !msg.member.roles.cache.has("889432612102373416")) return
		userSettings[msg.member.id] = {}
		var user = userSettings[msg.member.id]
		user.name = msg.content
		fs.writeFileSync("./misc/userconfig.json", JSON.stringify(userSettings))
		userSettings = require("../misc/userconfig.json")
		var curName = msg.member.nickname ?? msg.member.displayName
		msg.member.setNickname(curName + " (" + user.name + ")")
		msg.member.roles.remove(msg.guild.roles.cache.get("889432612102373416"))
		msg.member.roles.add(msg.guild.roles.cache.get("882355430108561418"))
	},
}
