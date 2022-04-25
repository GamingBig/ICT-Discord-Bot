const Discord = require("discord.js")
const twig = require("../Twig")
const translate = require('translate');

module.exports = {
    name: "translate",
    aliases: [],
    description: "",
    category: "",
    guildOnly: false,
    memberpermissions: "",
    adminPermOverride: true,
    cooldown: 0,
    args: [""],
    usage: "&pref;translate sentance",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args 
     * @param {String} curPrefix 
     */
    async execute(client, msg, args, curPrefix) {
        var text = args.join(" ")
        translate.engine = "google"
        var translated = await translate(text, "nl")
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Translate')
            .setDescription(twig.capitalizeFirst(translated))
        
        msg.channel.send({embeds: [embed]});
    },
};