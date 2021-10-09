const Discord = require("discord.js")

module.exports = {
    name: "button",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Interaction} interaction 
     * @param {Array} components
     */
    execute(client, interaction, components) {
        /*
            D- = Did you mean
            H- = Help command
        */
        var curId = interaction.customId
        /* START OF DIDYOUMEAN COMMAND HANDLING */if (curId.startsWith("D-")) {
            //get all required vars
            var command = curId.substr(2).split(";")[0]
            var msgId = curId.split(";")[1]
            var channelMsg = interaction.channel.messages.cache.get(msgId)
            var args = channelMsg.content.split(" ").slice(1)
            //get prefix from prefixes.json
            var curPrefix = require("../misc/prefixes.json")[interaction.guildId]
            //get the command that needs to be executed, even if its an alias.
            var curCommand = client.commands.get(command) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command))
            curCommand.execute(client, channelMsg, args, curPrefix)
            //disable all the buttons on the interaction
            interaction.update({ components: setAllDisabled(components) })
            // this took way too long for 8 lines of code.
        } else /* START OF HELP COMMAND HANDLING */if (curId.startsWith("H-")) {
            // get the help file
            var helpJSON = require("../misc/help.json")
            // get current catagory
            var catagory = helpJSON[curId.substr(2)]
            var embed = new Discord.MessageEmbed()
                .setColor("#1ecc18")
            if (interaction.customId == "H-Catagories") {
                embed.setTitle('Please select a catagory.')
            } else {
                embed.setTitle('All commands for catagory: ' + curId.substr(2))
            }
            // get all keys for catagory
            for (var key in catagory) {
                embed.addField(key, catagory[key])
            }
            //make all buttons to switch
            var buttonRow = new Discord.MessageActionRow()
            var embed2 = new Discord.MessageEmbed()
                .setColor("#1ecc18")
                .setTitle('Please select a catagory.')
            for (var key in helpJSON.Catagories) {
                embed2.addField(key, helpJSON.Catagories[key])
                var keyButton = new Discord.MessageButton()
                    .setCustomId("H-" + key)
                    .setLabel(key)
                    .setStyle(1)
                    .setDisabled(false)
                buttonRow.addComponents(keyButton)
            }
            var defButton = new Discord.MessageButton()
                .setLabel("Catagories")
                .setStyle(2)
                .setCustomId("H-Catagories")
            var defButtonRow = new Discord.MessageActionRow().addComponents(defButton)
            interaction.update({ embeds: [embed], components: [buttonRow, defButtonRow] });
        }
    },
};




// Function set all disabled
/**
 * @param {Array} components
 */
function setAllDisabled(components) {
    components.forEach(element => {
        element.components.forEach(element => {
            element.disabled = true
        })
    });
    return components
}