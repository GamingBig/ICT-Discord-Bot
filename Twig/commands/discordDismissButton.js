const Discord = require("discord.js")

module.exports = {
    "name": "discordDismissButton",
    
    execute() {
        var dismiss = new Discord.MessageButton()
            .setLabel("Dismiss")
            .setStyle(2)
            .setCustomId("dismiss")
        var dismissButton = new Discord.MessageActionRow().addComponents([dismiss])
        return dismissButton
    }
}