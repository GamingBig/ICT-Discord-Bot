const discord = require("discord.js")
const fs = require("fs")
const process = require("process")
const envFile = require('dotenv').config()
const env = envFile.parsed
const config = require('./config.json');
var Filter = require('bad-words')
const googleTTS = require('google-tts-api')
const disvoice = require('@discordjs/voice');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const rest = new REST({ version: '9' }).setToken(env.discord_token);

//help command setup
var getClosest = require("get-closest");
const levenshtein = require("levenshtein")
const helpJSON = require("./help.json")
var commands = []
const players = {}

//there are better ways of doing this but i already have it coded out so idc
var didYouMeanVal = null
var buttonBuffer = null

Object.keys(helpJSON).forEach((value, i) => {
    if (value == "Catagories") {
        return
    }
    Object.keys(helpJSON[value]).forEach((value, i) => {
        commands.push(value)
    })
})

//nieuwe bullshit van discord js v13
const myIntents = new discord.Intents();
myIntents.add(discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MEMBERS, discord.Intents.FLAGS.GUILD_VOICE_STATES, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS)
var client = new discord.Client({ intents: myIntents })

client.on("ready", () => {
    console.log("Logged in as: " + client.user.tag)
    client.user.setActivity("how long can I procrastinate for.", {
        type: "PLAYING",
    });
})

//leave when other have left
client.on('voiceStateUpdate', (oldState, newState) => {
    if (!oldState.guild.me.voice || !oldState.guild.me.voice.channel) {
        return
    }
    if (oldState.channel !== null && newState.channel === null) {
        var memberArray = oldState.guild.me.voice.channel.members
        var realMemberArray = []
        memberArray.array().forEach(element => {
            if (element.user.bot == false) {
                realMemberArray.push(element.user)
            }
        })
        if (realMemberArray.length == 0) {
            oldState.guild.voice.channel.leave()
        }
    }
});


client.on('guildMemberAdd', (guildMember) => {
    guildMember.roles.add(guildMember.guild.roles.cache.find(role => role.name === "Standaard rol"));
});

client.on("messageCreate", async (msg) => {
    if (msg.member.user == client.user) { return }
    var curPrefix = config.prefix[msg.guildId]
    if (!curPrefix) { config.prefix[msg.guildId] = "!"; fs.writeFileSync("config.json", JSON.stringify(config)); config = require("config.json") }
    if (msg.content.includes("<@!882229344808894484>") || msg.content.includes("@&882229864105672754")) {
        msg.channel.send("Hello. I'm a bot made for the Koning Willem 1 College, ICT Academy.\n\nPrefix for this server is: `" + config.prefix[msg.guildId] + "`.\n\nMy main purpose has not been decided yet, but it will come.")
    }
    if (!msg.content.startsWith(curPrefix)) { return }
    var command = msg.content.split(" ")[0].slice(curPrefix.length).toLowerCase()
    var args = msg.content.slice(command.length + curPrefix.length + 1).split(" ")
    if (config.debug == true) {
        console.log("Request Info:\n    " + msg.content + "\n    " + command + "\n    " + curPrefix + "\n    " + args + "\n")
    }
    /*start of commands,
    Help command*/
    if (command.startsWith("help")) {
        var arg2 = args[0]
        if (arg2 == "" || arg2 == undefined) {
            var embed = new discord.MessageEmbed()
                .setColor("#1ecc18")
                .setTitle('Please select a catagory.')
            var defButton = new discord.MessageButton()
                .setLabel("Catagories")
                .setStyle(2)
                .setCustomId("H-Catagories")
            var defButtonRow = new discord.MessageActionRow().addComponents(defButton)
            var buttonRow = new discord.MessageActionRow()
            for (var key in helpJSON.Catagories) {
                embed.addField(key, helpJSON.Catagories[key])
                var keyButton = new discord.MessageButton()
                    .setCustomId("H-" + key)
                    .setLabel(key)
                    .setStyle(1)
                buttonRow.addComponents(keyButton)
            }
            msg.channel.send({ content: "\u200B", embeds: [embed], components: [buttonRow, defButtonRow] });
            return
        }
        var arg2C = arg2.charAt(0).toUpperCase() + arg2.slice(1);
        if (!helpJSON[arg2C]) {
            msg.channel.send("Not a valid catagory.")
            return
        }
        var catagory = helpJSON[arg2C]
        var embed = new discord.MessageEmbed()
            .setColor("#1ecc18")
            .setTitle('All commands for catagory: ' + arg2C)
        for (var key in catagory) {
            embed.addField(key, catagory[key])
        }
        msg.channel.send(embed);
    } else /*Ping command */ if (command.startsWith("ping")) {
        var curDate = Date.now()
        var msgDate = msg.createdTimestamp
        if (msgDate == 123123) {
            return msg.channel.send("Because you used the DidYouMeanThis feature, the time will not be accurate.\nPlease retry.")
        }
        msg.channel.send("Pong! " + Math.round(Math.abs(curDate - msgDate) / 10) + "ms")
    } else /*Prefix command*/ if (command == "prefix") {
        if (!args[0]) {
            return msg.channel.send("You did not specify a prefix.\nThe prefix for this server is :`" + curPrefix + "`")
        }
        config.prefix[msg.guildId] = args[0]
        fs.writeFileSync("config.json", JSON.stringify(config))
        curPrefix = args[0]
        msg.channel.send("The prefix is now: `" + curPrefix + "`")
    } else /*Nickname command*/ if (command == "nick" || command == "nick") {
        if (!args[0]) {
            return msg.channel.send("You did not specify a nickname.")
        }
        if (!msg.member.nickname) {
            var name = msg.member.displayName
        } else {
            var name = msg.member.nickname
        }
        if (!name.includes("(") && !args.join(" ").includes("(")) {
            if (!name && !args.join(" ").includes("(")) {
                msg.member.setNickname(args.join(" "))
                return msg.channel.send("Your nickname is now: `" + args.join(" ") + "`\n\nPlease add your real name to your nickname like this: `XX_SniperKiller_XX (Karel)`.")
            }
            msg.member.setNickname(args.join(" "))
            msg.channel.send("Your nickname is now: `" + args.join(" ") + "`\n\nPlease add your real name to your nickname like this: `XX_SniperKiller_XX (Karel)`.")
            return
        }
        var newName = args.join(" ")
        newName = newName.replace(/( \(unde)\w+/g, "")
        await msg.member.setNickname(newName)
        msg.channel.send("Your nickname is now: `" + newName + "`")
    } else /*Suggestion command*/ if (command.startsWith("suggestion")) {
        var suggestion = msg.content.substr(13)
        const embed = new discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Suggestion from `' + msg.member.displayName + "#" + msg.author.discriminator + "` in here.")
            .setDescription(suggestion)
            .setURL("https://discord.com/channels/" + msg.guildId + "/" + msg.channelId)

        var joeryUser = client.users.cache.find(({ id }) => id == "255730583655809025")
        joeryUser.send({ embeds: [embed] })
        msg.channel.send("Suggestion sent to " + joeryUser.username + ".")
    } else /*Find command the user meant */ {
        /*Voice commands handled seperatly for readability */
        if (await voiceCommand(msg, command, curPrefix, args) == true) { return }
        var closestMatch = getClosest.custom(command, commands, compareLevenshteinDistance)
        var distance = compareLevenshteinDistance(commands[closestMatch], command)
        if (commands.find(value => value.toLowerCase() == commands[closestMatch])) {

        }
        if (distance >= 4) {
            msg.channel.send("I didn't recognise that command. You can see all commands using ''" + config.prefix + "help''.")
            return
        }
        function compareLevenshteinDistance(compareTo, baseItem) {
            return new levenshtein(compareTo, baseItem).distance;
        }
        /*var button = new discord.MessageButton()
            .setLabel("Yes.")
            .setStyle(3)
            .setCustomId("agree-button")
            .setDisabled(false)
        var buttonNo = new discord.MessageButton()
            .setLabel("No.")
            .setStyle(4)
            .setCustomId("disagree-button")
            .setDisabled(false)
        var row = new discord.MessageActionRow()
        row.addComponents(button)
        row.addComponents(buttonNo)
        didYouMeanVal = [msg, commands[closestMatch], command]*/
        msg.channel.send({ content: "Did you mean: **" + commands[closestMatch] + "**?"/*, components: [row] */ })
    }
})

//Voice commands
async function voiceCommand(msg, command, curPrefix, args) {
    return new Promise(function (resolve, reject) {
        var curPrefix = config.prefix[msg.guildId]
        if (msg.member.user == client.user || !msg.content.startsWith(curPrefix)) { resolve(false) }
        if (!curPrefix) { config.prefix[msg.guildId] = "!"; fs.writeFileSync("config.json", JSON.stringify(config)); config = require("config.json") }
        var command = msg.content.split(" ")[0].slice(curPrefix.length).toLowerCase()
        var args = msg.content.slice(command.length + curPrefix.length + 1).split(" ")
        if /*Join command */ (command.startsWith("join")) {
            if (!msg.member.voice) {
                return msg.channel.send("You need to be in a voice channel for me to join.")
            }
            if (!players[msg.guildId]) { players[msg.guildId] = {} }
            players[msg.guildId].c = disvoice.joinVoiceChannel({
                channelId: msg.member.voice.channelId,
                guildId: msg.guildId,
                adapterCreator: msg.channel.guild.voiceAdapterCreator,
            });
            resolve(true)
        } else /*Leave command */ if (command.startsWith("leave")) {
            if (!disvoice.getVoiceConnection(msg.guildId)) {
                return msg.channel.send("I'm not in a voice channel.")
            }
            disvoice.getVoiceConnection(msg.guildId).destroy()
            resolve(true)
        } else /*Say command */ if (command == "say") {
            say(msg, args, command, curPrefix)
            resolve(true)
        }
        resolve(false)
    })
}

//                  START OF SAY COMMAND
async function say(msg, args, command, curPrefix) {
    // get text
    var text = args.join(" ")
    //join vc
    if (!players[msg.guildId]) { players[msg.guildId] = {} }
    var guildPlayer = players[msg.guildId]
    var connection
    if (guildPlayer.c) {
        connection = guildPlayer.c
    } else if (msg.member.voice.channel) {
        connection = disvoice.joinVoiceChannel({
            channelId: msg.member.voice.channelId,
            guildId: msg.guildId,
            adapterCreator: msg.guild.voiceAdapterCreator,
        });
    } else {
        msg.channel.send("I need to be in a voice channel to say stuff, use !join @user to make me join a channel.")
    }
    // lengte moet meer dan 0 zijn en minder dan 200
    if (text.length == 0) {
        msg.channel.send("You need to add a message for me to say.")
    } else if (text.length >= 200) {
        msg.channel.send("Can`t say message because the length is " + text.length + " while the maximum is 199")
    }
    if (!/[a-z]/.test(text) && /[A-Z]/.test(text)) {
        var volume = 10
    } else {
        var volume = 2.5
    }
    //filter n-word
    var filter = new Filter({ emptyList: true, list: ["nigga", "nig", "neigha", "niega", "niegha", "neiga", "niger", "nigger"], placeHolder: "\u200B" })
    var oldText = text
    text = filter.clean(text.toLowerCase())
    // new discordjs V13 type
    const url = googleTTS.getAudioUrl(text, {
        slow: false,
        host: 'https://translate.google.com',
    })
    guildPlayer.p = disvoice.createAudioPlayer()
    guildPlayer.r = disvoice.createAudioResource(url, { inputType: disvoice.StreamType.Arbitrary, inlineVolume: true })
    guildPlayer.r.volume.setVolume(volume)
    guildPlayer.p.play(guildPlayer.r)
    connection.subscribe(guildPlayer.p)
}
//                  END OF SAY COMMAND

//                  START OF HELP BUTTON HANDLING
client.on('interactionCreate', async interaction => {
    if (!interaction.customId.startsWith("H-")) return;
    var catagory = helpJSON[interaction.customId.substr(2)]
    var embed = new discord.MessageEmbed()
        .setColor("#1ecc18")
    if (interaction.customId == "H-Catagories") {
        embed.setTitle('Please select a catagory.')
    } else {
        embed.setTitle('All commands for catagory: ' + interaction.customId.substr(2))
    }
    for (var key in catagory) {
        embed.addField(key, catagory[key])
    }
    var buttonRow = new discord.MessageActionRow()
    var embed2 = new discord.MessageEmbed()
        .setColor("#1ecc18")
        .setTitle('Please select a catagory.')
    for (var key in helpJSON.Catagories) {
        embed2.addField(key, helpJSON.Catagories[key])
        var keyButton = new discord.MessageButton()
            .setCustomId("H-" + key)
            .setLabel(key)
            .setStyle(1)
            .setDisabled(false)
        buttonRow.addComponents(keyButton)
    }
    var defButton = new discord.MessageButton()
        .setLabel("Catagories")
        .setStyle(2)
        .setCustomId("H-Catagories")
    var defButtonRow = new discord.MessageActionRow().addComponents(defButton)
    await interaction.update({ content: "\u200B", embeds: [embed], components: [buttonRow, defButtonRow] });
});
//                  END OF HELP BUTTON HANDLING

//                  START OF MISC BUTTON HANDLING
client.on("interactionCreate", async interaction => {
    /*if (interaction.customId == "agree-button") {
        var message = didYouMeanVal[0]
        var meantCommand = didYouMeanVal[1]
        var commandName = didYouMeanVal[2]
        message.content = message.content.replace(commandName, meantCommand)
        message.channel = interaction.channel
        message.channelId = interaction.channelId
        message.createdTimestamp = 123123
        client.emit("messageCreate", message)
        var newbutton = new discord.MessageButton()
            .setLabel("Yes.")
            .setStyle(3)
            .setCustomId("agree-button")
            .setDisabled(true)
        var buttonNo = new discord.MessageButton()
            .setLabel("No.")
            .setStyle(4)
            .setCustomId("disagree-button")
            .setDisabled(true)
        var row = new discord.MessageActionRow()
            .addComponents(newbutton, buttonNo)
        interaction.update({ components: [row] })
    } else if (interaction.customId == "disagree-button") {
        var newbutton = new discord.MessageButton()
            .setLabel("Yes.")
            .setStyle(3)
            .setCustomId("agree-button")
            .setDisabled(true)
        var buttonNo = new discord.MessageButton()
            .setLabel("No.")
            .setStyle(4)
            .setCustomId("disagree-button")
            .setDisabled(true)
        var row = new discord.MessageActionRow()
            .addComponents(newbutton, buttonNo)
        await interaction.update({ components: [row] })
    }*/
})
client.login(env.discord_token)