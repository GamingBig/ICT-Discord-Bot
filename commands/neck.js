const Discord = require("discord.js")

module.exports = {
    name: "neck",
    aliases: [],
    description: "",
    category: "",
    guildOnly: false,
    memberpermissions: "",
    adminPermOverride: true,
    cooldown: 0,
    args: [""],
    usage: "&pref;neck length",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args 
     * @param {String} curPrefix 
     */
    async execute(client, msg, args, curPrefix) {
        var amount = Math.round(parseFloat(args[0]))

        if (amount > 20) {
            return msg.channel.send("Too much")
        }

        var text = "<:Tibo_neck_top:935280325083430942>"

        for (let i = 1; i < amount; i++) {
            text += "\n" + "<:Tibo_neck_middle:935280333715288124>"
            if (text.length > 200) {
                msg.channel.send(text)
                text = ""
            }
        }

        text += "\n" + "<:Tibo_neck_bottom:935280342410096641>"
        msg.channel.send(text)
    },
};