const Discord = require('discord.js');
const disVoice = require("@discordjs/voice")
var prefixConfig = require("./misc/prefixes.json")
var userConfig = require("./misc/userconfig.json")
const keys = require('dotenv').config().parsed
const stringSimilarity = require("string-similarity")
const fastAverageColor = require("fast-average-color-node")
const fs = require('fs');

//to see if prefixconfig has changed
fs.watchFile("./misc/prefixes.json", (curr, prev) => {
    prefixConfig = require("./misc/prefixes.json")
})

fs.watchFile("./misc/userconfig.json", (curr, prev) => {
    userConfig = require("./misc/userconfig.json")
})

const Intents = Discord.Intents.FLAGS
var myIntents = new Discord.Intents()
myIntents.add([Intents.DIRECT_MESSAGES, Intents.GUILDS, Intents.GUILD_MESSAGES, Intents.GUILD_MEMBERS, Intents.GUILD_VOICE_STATES, Intents.GUILD_INVITES])
const client = new Discord.Client({ intents: myIntents });
client.commands = new Discord.Collection();

// Take commands
const allCommands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/` + file);
    client.commands.set(command.name, command);
    allCommands.push(command.name)
    command.aliases.forEach(elem => {
        allCommands.push(elem)
    });
}

// set all events
client.on("inviteCreate", invite => {
    const inviteCreate = require('./events/inviteCreate');
    inviteCreate.execute(client, invite)
})
client.on("messageCreate", msg => {
    const RoleInitMsg = require('./events/RoleInitMsg');
    RoleInitMsg.execute(client, msg)
})
client.on("guildMemberAdd", guild => {
    const guildMemberAdd = require('./events/guildMemberAdd');
    guildMemberAdd.execute(client, guild)
})

// Cooldowns
const cooldowns = new Discord.Collection();

// On Ready
client.once('ready', () => {
    console.log('Logged in as ' + client.user.username + "#" + client.user.discriminator + '!');
    client.user.setActivity("\"guess the amount of times Rob Wessels will repeat a subject.\"\nNow on steam.", {type: "PLAYING"})
});

// On alone in voice
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
        try {
            disVoice.getVoiceConnection(guild.id).destroy()
        } catch (error) {
        }
    }
});

// On Message
client.on('messageCreate', async msg => {
    if (msg.content.includes("https://media.tenor.co/videos/bda209906a9367bffd4bf4b2d1479ab7/mp4")) {
        try {
            msg.delete()
        } catch (error) {
            console.log(error);
        }
    }

    // Define prefix
    if (!prefixConfig[msg.guildId]) {
        prefixConfig[msg.guildId] = "!"
        fs.writeFileSync("./misc/prefixes.json", JSON.stringify(prefixConfig))
        var curPrefix = "!"
    } else {
        var curPrefix = prefixConfig[msg.guildId]
    }
    
    // See if the message mentions the bot.
    if (msg.content === "<@!" + client.user.id + ">" && msg.author.id !== client.user.id) {
        if (msg.content.split(" ")[1]) {
            if (!msg.member.permissions.has("ADMINISTRATOR")) {
                return msg.channel.send("You need to have Administrator privileges to change the prefix.")
            }
            let prefix = msg.content.split(" ")[1]
            prefixConfig[msg.guildId] = prefix
            fs.writeFileSync("./misc/prefixes.json", JSON.stringify(prefixConfig))
            return msg.channel.send("Prefix is now: `" + prefix + "`\n\nThis will take effect in about 1-3 seconds.")
        }
        // use the bot image as the embed color
        // start with changing .webp to .png since fAC doesnt support it
        let userImg = client.user.displayAvatarURL().split(".")
        userImg[userImg.length-1] = "png"
        userImg = userImg.join(".")
        // get the dominant color
        color = (await fastAverageColor.getAverageColor(userImg, {algorithm: "dominant"})).hex
        // make embed with all the info
        let embed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle('Bot Info')
            .setThumbnail(userImg)
            .setDescription("Hello. I'm a bot made for the **Koning Willem 1 College**, ICT Academy.\n\nMy main purpose has not been decided yet, but it will come.")
            .addFields([
                { name: 'Current Prefix', value: `\`${curPrefix}\``, inline: false },
            ])
            .setFooter("You can only change the prefix if you have the permissions to do so.\n"+
            "You can do so with `"+ curPrefix +"prefix (New Prefix)` or `@"+client.user.username+" (New Prefix)`.")

        return msg.channel.send({embeds: [embed]});
    }

    // see if user needs role
    if (!userConfig[msg.member.id] || !userConfig[msg.member.id].role) {
        if (msg.member.user.bot) {
            return
        }
        var newRole = await msg.guild.roles.create({
            name: msg.member.displayName,
            permissions: []
        })
        if (!userConfig[msg.member.id]) {
            userConfig[msg.member.id] = {}
        }
        userConfig[msg.member.id].role = newRole.id
        msg.member.roles.add(newRole)
        fs.writeFileSync("./misc/userconfig.json", JSON.stringify(userConfig))
    }
    if (!msg.content.startsWith(curPrefix) || msg.author.bot) return;
    const args = msg.content.slice(curPrefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // If command exist
    if (!command) {
        var closestString = stringSimilarity.findBestMatch(commandName, allCommands).bestMatch
        var customId = "D-" + closestString.target + ";" + msg.id
        if (closestString.rating == 0 || customId.length >= 100){
            return msg.channel.send("I didn't recognise that command, Please use " + curPrefix + "help if you don't know what you're looking for.")
        }
        var didYouMeanButton = new Discord.MessageButton()
            .setCustomId(customId)
            .setLabel("Yes")
            .setStyle("SUCCESS")
        var noButton = new Discord.MessageButton()
            .setCustomId("dismiss")
            .setLabel("No")
            .setStyle('DANGER')
        var didYouMeanRow = new Discord.MessageActionRow()
            .addComponents([didYouMeanButton, noButton])
        msg.channel.send({ content: "Did you mean: ``" + closestString.target.charAt(0).toUpperCase() + closestString.target.slice(1) + "``?", components: [didYouMeanRow] })
        return
    };

    // Check if command can be executed in DM
    if (command.guildOnly && msg.channel.type !== 'GUILD_TEXT') {
        return msg.reply('I can\'t execute that command inside DMs!');
    }

    // Check if args are required
    if (command.args && command.args.length > 0 && !args.length) {
        let reply = `You didn't provide any arguments.`;

        if (command.usage) {
            reply += "\nThe proper usage would be: ``" + command.usage.replace("&pref;", curPrefix) + "``.";
        }

        return msg.channel.send(reply);
    }

    // Check if user is in cooldown
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(msg.author.id)) {
        const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

        if (now < expirationTime) {
            // If user is in cooldown
            const timeLeft = (expirationTime - now) / 1000;
            return msg.reply("please wait " + timeLeft.toFixed(1) + " more second(s) before reusing the ``" + command.name + "`` command.");
        }
    } else {
        timestamps.set(msg.author.id, now);
        setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
        // Execute command
        try {
            command.execute(client, msg, args, curPrefix);
        } catch (error) {
            console.error(error);
            msg.reply('there was an error trying to execute that command!');
        }
    }
});

// On Interaction (Buttons, Menus, slash commands)
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        var curInterFile = require("./interactions/button.js")
    } else if (interaction.isCommand()) {
        var curInterFile = require("./interactions/slash.js")
    } else if (interaction.isSelectMenu()) {
        var curInterFile = require("./interactions/menu.js")
    }
    try {
        curInterFile.execute(client, interaction, interaction.message.components, cooldowns)
    } catch (error) {
        console.error(error);
        interaction.channel.send('there was an error trying to execute that command!\n\n' + error);
    }
})

var token = keys.DISCORD_TOKEN ?? keys.TEST_DISCORD_TOKEN
client.login(token);