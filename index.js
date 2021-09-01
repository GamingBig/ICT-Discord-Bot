const discord = require("discord.js")
const fs = require("fs")
const process = require("process")
const envFile = require('dotenv').config()
const env = envFile.parsed
const config = require('./config.json');
var Filter = require('bad-words')
const googleTTS = require('google-tts-api')
const disbut = require("discord-buttons");
const disvoice = require('@discordjs/voice');

//help command setup
var getClosest = require("get-closest");
const levenshtein = require("levenshtein")
const helpJSON = require("./help.json")
var commands = []
const players = {}

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
    if (!oldState.guild.voice || !oldState.guild.voice.channel) {
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
            var embed = new Discord.MessageEmbed()
                .setColor("#1ecc18")
                .setTitle('Please select a catagory.')
            var defButton = new disbut.MessageButton()
                .setLabel("Catagories")
                .setStyle('grey')
                .setID("H-Catagories")
            var defButtonRow = new disbut.MessageActionRow().addComponent(defButton)
            var buttonRow = new disbut.MessageActionRow()
            for (var key in helpJSON.Catagories) {
                embed.addField(key, helpJSON.Catagories[key])
                var keyButton = new disbut.MessageButton()
                    .setID("H-" + key)
                    .setLabel(key)
                    .setStyle('blurple')
                buttonRow.addComponent(keyButton)
            }
            msg.channel.send({ embed: embed, components: [buttonRow, defButtonRow] });
            return
        }
        var arg2C = arg2.charAt(0).toUpperCase() + arg2.slice(1);
        if (!helpJSON[arg2C]) {
            message.channel.send("Not a valid catagory.")
            return
        }
        var catagory = helpJSON[arg2C]
        var embed = new Discord.MessageEmbed()
            .setColor("#1ecc18")
            .setTitle('All commands for catagory: ' + arg2C)
        for (var key in catagory) {
            embed.addField(key, catagory[key])
        }
        message.channel.send(embed);
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
        var oldName = name
        var newName = args.join(" ")
        newName = newName.replace(/( \(unde)\w+/g, "")
        await msg.member.setNickname(newName)
        msg.channel.send("Your nickname is now: `" + newName + "`")
    }
})

//Voice commands
client.on("messageCreate", async (msg) => {
    if (msg.member.user == client.user || !msg.content.startsWith(curPrefix)) { return }
    var curPrefix = config.prefix[msg.guildId]
    if (!curPrefix) { config.prefix[msg.guildId] = "!"; fs.writeFileSync("config.json", JSON.stringify(config)); config = require("config.json") }
    var command = msg.content.split(" ")[0].slice(curPrefix.length).toLowerCase()
    var args = msg.content.slice(command.length + curPrefix.length + 1).split(" ")
    if (command.startsWith("join")) {
        if (!msg.member.voice) {
            return msg.channel.send("You need to be in a voice channel for me to join.")
        }
        msg.member.voice.channel.join().then(connection => {
            connection.voice.setSelfDeaf(true)
            connection.voice.setSelfMute(true)
        })
    } else if (command.startsWith("leave")) {
        if (msg.guild.voice == undefined) {
            return msg.channel.send("I'm not in a voice channel.")
        }
        msg.guild.voice.channel.leave()
    } else /*Say command*/ if (command == "say") {
        say(msg, args, command, curPrefix)
    }
})


async function say(msg, args, command, curPrefix) {
    // get text
    var text = args.join(" ")
    //join vc
    if (msg.guild.me.voice.channel) {
        var connection = disvoice.joinVoiceChannel({
            channelId: msg.guild.me.voice.channelId,
            guildId: msg.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
    } else if (msg.member.voice.channel) {
        var connection = disvoice.joinVoiceChannel({
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
    if (oldText !== text) {
        msg.delete()
    }
    // new discordjs V13 type
    const url = googleTTS.getAudioUrl(text, {
        lang: TextLanguage,
        slow: false,
        host: 'https://translate.google.com',
    })
    var curPlayer = players[msg.guildId]
    if (!curPlayer || !curPlayer.player || !curPlayer.res) {
        curPlayer.player = disvoice.createAudioPlayer()
        curPlayer.res = disvoice.createAudioResource(url)
    }
    curPlayer.player
    dispatcher.setVolume(volume)
}
//                  end of say command


client.login(env.discord_token)