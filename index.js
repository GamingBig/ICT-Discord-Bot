const discord = require("discord.js")
const fs = require("fs")
const process = require("process")
const envFile = require('dotenv').config()
const env = envFile.parsed
const config = require('./config.json');
var Filter = require('bad-words')
const googleTTS = require('google-tts-api')

//nieuwe bullshit van discord js v13
const myIntents = new discord.Intents();
myIntents.add(discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MEMBERS, discord.Intents.FLAGS.GUILD_VOICE_STATES, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS)
var client = new discord.Client({ intents: myIntents })

client.on("ready", () => {
    console.log("Logged in as: " + client.user.tag)
})

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
    console.log("Request Info:\n    " + msg.content + "\n    " + command + "\n    " + curPrefix + "\n    " + args + "\n")
    if (command == "prefix") {
        if (!args[0]) {
            return msg.channel.send("You did not specify a prefix.\nThe prefix for this server is :`" + curPrefix + "`")
        }
        config.prefix[msg.guildId] = args[0]
        fs.writeFileSync("config.json", JSON.stringify(config))
        curPrefix = args[0]
        msg.channel.send("The prefix is now: `" + curPrefix + "`")
    }
    if (command == "say") {
        say(msg, args, command, curPrefix)
    }
})

async function say(msg, args, command, curPrefix) {
    var text = args.join(" ")
    var Connection
    if (msg.guild.me.voice.channel) {
        await msg.guild.me.voice.channel.join().then(connection => {
            Connection = connection
        }).catch(err => console.log(err));
    } else if (msg.member.voice.channel) {
        await msg.member.voice.channel.join().then(connection => {
            Connection = connection
        }).catch(err => console.log(err));
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
    //
    const url = googleTTS.getAudioUrl(text, {
        lang: TextLanguage,
        slow: false,
        host: 'https://translate.google.com',
    })
    var dispatcher = connection.play(url)
    dispatcher.setVolume(volume)
}

client.login(env.discord_token)