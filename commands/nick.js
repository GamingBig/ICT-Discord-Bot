const Discord = require("discord.js")

module.exports = {
    name: "nick",
    aliases: [],
    description: "",
    category: "User",
    guildOnly: true,
    memberpermissions: "",
    adminPermOverride: true,
    cooldown: 0,
    args: [""],
    usage: "&pref;nick (Nickname).",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args 
     * @param {String} curPrefix 
     */
    async execute(client, msg, args, curPrefix) {

    },
};