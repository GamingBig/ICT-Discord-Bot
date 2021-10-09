const Discord = require("discord.js")
const disVoice = require("@discordjs/voice")

module.exports = {
    name: "leave",
    aliases: [],
    description: "",
    category: "Voice",
    guildOnly: true,
    memberpermissions: "",
    adminPermOverride: true,
    cooldown: 0,
    args: [],
    usage: "&pref;leave",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args 
     * @param {String} curPrefix 
     */
    async execute(client, msg, args, curPrefix) {
        if (!msg.guild.me.voice || !msg.guild.me.voice.channel) {
            return msg.channel.send("I don't seem to be in a voice channel.")
        }
        disVoice.getVoiceConnection(msg.guildId).destroy()
    },
};