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
var userSettings = require("./UserSettings.json")
var toHex = require('colornames')
const ytdl = require("ytdl-core")
var lastMeme = 0

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

//
client.on("ready", () => {
    console.log("Logged in as: " + client.user.tag)
    client.user.setActivity("to bits changing from 0 to 1.", {
        type: "LISTENING",
        url: "https://github.com/GamingBig/ICT-Discord-Bot"
    });
})

//leave when other have left
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!oldState.guild.me.voice || !oldState.guild.me.voice.channel) { return }
    var guild = client.guilds.cache.get(newState.guild.id)
    var channel = guild.channels.cache.get(oldState.channelId)
    if (!oldState.channel) { return }
    if (oldState.channel.members.size > channel.members.size) {

    }
    var memberArray = channel.members
    var realMemberArray = []
    memberArray.map(user => user.user.bot).forEach(element => {
        if (element == false) {
            realMemberArray.push(element.user)
        }
    })
    if (realMemberArray.length == 0) {
        disvoice.getVoiceConnection(guild.id).destroy()
    }
});

//give role on join
client.on('guildMemberAdd', (guildMember) => {
    guildMember.roles.add(guildMember.guild.roles.cache.find(role => role.name === "Standaard rol"));
});

//start message handling
client.on("messageCreate", async (msg) => {
    var user = msg.member
    if (msg.guildId == "882207507785842738") {
        if (!userSettings[user.id]) {
            userSettings[user.id] = {}
        }
        if (!userSettings[user.id].role) {
            var userRole = await msg.guild.roles.create({ name: user.displayName, position: 0 })
            user.roles.add(userRole)
            var curUserSettings = userSettings[user.id]
            curUserSettings.role = userRole.id
            fs.writeFileSync("./UserSettings.json", JSON.stringify(userSettings))
            userSettings = require("./UserSettings.json")
        }
    }
    var curPrefix = config.prefix[msg.guildId]
    if (msg.member.user == client.user && msg.content !== "AUTOMATEDmeme") { return }
    if (!curPrefix) { config.prefix[msg.guildId] = "!"; fs.writeFileSync("config.json", JSON.stringify(config)); config = require("config.json") }
    if (msg.content == "AUTOMATEDmeme") { curPrefix = "AUTOMATED"; msg.delete() }
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
        if (msg.member.permissions.has(discord.Permissions.FLAGS.ADMINISTRATOR)) {
            return msg.channel.send("You don't have permission to change the prefix.")
        }
        if (!args[0]) {
            return msg.channel.send("You did not specify a prefix.\nThe prefix for this server is :`" + curPrefix + "`")
        }
        config.prefix[msg.guildId] = args[0]
        fs.writeFileSync("config.json", JSON.stringify(config))
        curPrefix = args[0]
        msg.channel.send("The prefix is now: `" + curPrefix + "`")
    } else /*Nickname command*/ if (command == "nick") {
        if (msg.member.id == "255730583655809025") {
            return msg.channel.send("I cant change the nick of an admin.")
        }
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
    } else /*Role commands */ if (command == "role") {
        if (msg.guildId !== "882207507785842738") {
            return
        }
        var subCommand = args[0]
        if (!subCommand) {
            return msg.channel.send("Please say what you want to change about your role.\nUse `" + curPrefix + "role color` to change the color and `" + curPrefix + "role name` to change the name.")
        }
        try {
            var userRole = userSettings[msg.member.id].role
            userRole = await msg.guild.roles.fetch(userRole)
        } catch (error) { return msg.channel.send("Something went wrong trying to get your role.") }
        if (subCommand == "color") {
            try {
                if (/^#[0-9A-F]{6}$/i.test(args[1])) {
                    var color = args[1]
                } else {
                    var color = toHex(args[1])
                }
                userRole.setColor(color)
            } catch {
                msg.channel.send("That is not a valid color, if a color name doesnt work please input a [hex](https://www.google.com/search?q=color+picker) code.")
            }
        } else if (subCommand == "name") {
            try {
                var name = args.slice(1, args.length).join(" ")
                userRole.setName(name)
                userRole.setHoist(true)
            } catch (error) {
                console.log(error)
                msg.channel.send("Something went wrong.")
            }
        }
    } else /*Say accent command */ if (command == "accent") {
        var accentMenu = new discord.MessageSelectMenu()
            .setCustomId("tts-accent-menu")
            .setMaxValues(1)
            .addOptions([{ label: 'Dutch', value: 'nl-NL', emoji: "🇳🇱" }, { label: "English", value: 'en-GB', emoji: "🇬🇧" }, { label: 'de-DE', value: 'de-DE', emoji: '🇩🇪' }, { label: 'French', value: 'fr-FR', emoji: "🇫🇷" }, { label: 'Turkish', value: 'tr-TR', emoji: "🇹🇷" }])
        var row = new discord.MessageActionRow()
            .addComponents(accentMenu)
        msg.channel.send({ content: "Please choose a language to be your TTS accent.", components: [row] })
    } else /*Meme command*/ if (command == "meme") {
        const memeJSON = require('./memeVideos.json')
        var videoID = memeJSON[Math.floor(Math.random() * (9575))]
        var ytdlVideo = ytdl("https://www.youtube.com/watch?v=" + videoID, { quality: 18 })
        var videoURL = "https://www.youtube.com/watch?v=" + videoID
        var videoInfo = (await ytdl.getBasicInfo(videoURL)).videoDetails
        currentMemeTime = Date.now()
        //format likes
        if (videoInfo.likes >= 1000) {
            var likes = Math.round(videoInfo.likes / 1000) + 'K'
        } else {
            var likes = videoInfo.likes
        }
        //format dislikes
        if (videoInfo.dislikes == NaN) {
            var dislikes = "0"
        } else if (videoInfo.dislikes >= 1000) {
            var dislikes = Math.round(videoInfo.dislikes / 1000) + 'K'
        } else {
            var dislikes = videoInfo.dislikes
        }
        //format views
        if (videoInfo.viewCount >= 1000) {
            var views = Math.round(videoInfo.viewCount / 1000) + 'K'
        } else {
            var views = videoInfo.viewCount
        }
        //see if video is unavailable
        if (videoInfo.isPrivate || !videoInfo.isCrawlable || videoInfo.isUnlisted) {
            return msg.channel.send('I accidently stumbled upon a privatised video, please try again.')
        }
        likes = likes.toString()
        dislikes = dislikes.toString()
        if ((currentMemeTime - lastMeme) >= 10000) {
            msg.channel.sendTyping()
            lastMeme = Date.now()
            ytdlVideo.pipe(fs.createWriteStream('memeVideo.mp4')).on('finish', function () {
                setTimeout(function () {
                    const embed = new discord.MessageEmbed()
                        .setColor('#FF0000')
                        .setTitle(videoInfo.title)
                        .setURL(videoURL)
                        .addFields(
                            [
                                { name: 'Uploader', value: '[' + videoInfo.author.name + '](' + videoInfo.author.channel_url + ')', inline: false },
                                { name: 'Likes', value: likes, inline: true },
                                { name: 'Dislikes', value: dislikes, inline: true },
                                { name: 'Views', value: views, inline: true }
                            ]
                        )
                        .setTimestamp('timestamp')
                        .setFooter('\u200B', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/800px-YouTube_full-color_icon_%282017%29.svg.png')
                    msg.channel.send({ embeds: [embed], files: ["./memeVideo.mp4"] }).then(() => {
                        fs.rmSync("./memeVideo.mp4")
                    })
                }, 100)
            })
        } else {
            msg.channel.send("Please wait " + (10 - (Math.round((currentMemeTime - lastMeme) / 100) / 10)) + " more seconds")
        }
        client.on('error', (error) => {
            console.log(error);
            msg.channel.send(error.message.split('\n')[0])
            return
        });
    } else /*Find command the user meant */ {
        /*Voice commands handled seperatly for readability */
        if (await voiceCommand(msg, command, curPrefix, args) == true) { return }
        var closestMatch = getClosest.custom(command, commands, compareLevenshteinDistance)
        var distance = compareLevenshteinDistance(commands[closestMatch], command)
        if (commands.find(value => value.toLowerCase() == commands[closestMatch])) {

        }
        if (distance >= 4) {
            msg.channel.send("I didn't recognise that command. You can see all commands using `" + curPrefix + "help`.")
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

//                  START OF VC COMMANDS
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
//                  END OF VC COMMANDS

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
    if (!userSettings[msg.member.id] || !userSettings[msg.member.id].ttsAccent) {
        var lang = "en-GB"
    } else {
        var lang = userSettings[msg.member.id].ttsAccent
    }
    const url = googleTTS.getAudioUrl(text, {
        slow: false,
        host: 'https://translate.google.com',
        lang: lang
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
    if (interaction.customId == "tts-accent-menu") {
        var accent = interaction.values[0]
        if (!userSettings[interaction.user.id]) {
            userSettings[interaction.user.id] = {}
        }
        userSettings[interaction.user.id].ttsAccent = accent
        interaction.channel.send("Your TTS accent is now `" + accent + "`")
        await fs.writeFileSync("./UserSettings.json", JSON.stringify(userSettings))
        userSettings = require("./UserSettings.json")
        var newList = interaction.message.components[0]
        newList.components[0].disabled = true
        interaction.update({ components: [newList] })
    }
})
client.login(env.discord_token)