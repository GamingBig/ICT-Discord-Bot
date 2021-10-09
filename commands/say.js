const Discord = require("discord.js")
const disVoice = require("@discordjs/voice")
const googleTTS = require("google-tts-api")

module.exports = {
	name: "say",
	aliases: [],
	description: "",
	category: "Voice",
	guildOnly: true,
	memberpermissions: "",
	adminPermOverride: true,
	cooldown: 0.01,
	args: ["YOUR_MESSAGE"],
	usage: "&pref;say (Your message)",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 * @param {Array} args
	 * @param {String} curPrefix
	 */
	async execute(client, msg, args, curPrefix) {
		var sayMsg = msg.cleanContent.split(" ").slice(1).join(" ")
		// Replace emojis with their name, side effect: you cant write <: in your message
        while (/<:[\w]*:[\w]*>/.test(sayMsg) == true) {
            sayMsg = sayMsg.replace(/<:([\w]*):([\w]*)>/, sayMsg.split("<:")[1].split(":")[0])
        }
		console.log("ytttess");
		if (disVoice.getVoiceConnection(msg.guildId) == undefined) {
			joinUser(msg)
		} else {
			if (msg.member.voice.channelId !== msg.guild.me.voice.channelId) {
				joinUser(msg)
			}
		}
		if (sayMsg.length >= 200) {
			return msg.channel.send("I'm limited to less than 200 characters, your message consists of `" + sayMsg.length + "` characters.")
		}
		if (!/[a-z]/.test(sayMsg) && /[A-Z]/.test(sayMsg)) {
			var volume = 10
		} else {
			var volume = 2.5
		}
		// replace acronyms with their meaning, this is after the volume control so i dont have to make 2 version (capitalized and non-capital) for each acronym
		var replacements = require("../misc/sayReplacements.json")
		sayMsg.split(" ").forEach(string => {
			if(replacements[string.toLowerCase()]){
				sayMsg = sayMsg.replace(string, replacements[string.toLowerCase()])
			}
		})
		var lang = require("../misc/userconfig.json")[msg.member.id] ?? "en"
		var URL = googleTTS.getAudioUrl(sayMsg, {
			lang: lang,
		})
		var connection = disVoice.getVoiceConnection(msg.guildId)
		var resource = disVoice.createAudioResource(URL, {inlineVolume: true})
        resource.volume.setVolume(volume)
		var player = disVoice.createAudioPlayer()
		player.play(resource)
		connection.subscribe(player)

		player.on("error", (error) => {
			msg.channel.send("An error occured;\n\n```"+error.message+"```")
		})
	},
}

async function joinUser(msg) {
	var vc = msg.member.voice
	if (!vc.channel || !vc.channel.joinable) {
		return msg.channel.send("I can't seem to join you.")
	}
	var connection = disVoice.joinVoiceChannel({
		channelId: vc.channel.id,
		guildId: vc.guild.id,
		adapterCreator: vc.guild.voiceAdapterCreator,
	})
}
