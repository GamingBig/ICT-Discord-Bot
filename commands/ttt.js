const Discord = require("discord.js")
const TicTacToe = require('discord-tictactoe');
const tttGame = new TicTacToe({ language: 'en' })

module.exports = {
    name: "ttt",
    aliases: [],
    guildOnly: true,
    memberpermissions: "",
    adminPermOverride: true,
    cooldown: 0,
    args: [],
    usage: "&pref;ttt",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args 
     * @param {String} curPrefix 
     */
    async execute(client, msg, args, curPrefix) {
        // return msg.channel.send("This is currently not available.")
        tttGame.handleMessage(msg)
    },
};  