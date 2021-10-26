const Discord = require("discord.js")
const ytdl = require("ytdl-core")
const fs = require("fs")

module.exports = {
	name: "meme",
	aliases: [],
	description: "",
	category: "Misc",
	guildOnly: false,
	memberpermissions: "",
	adminPermOverride: true,
	cooldown: 10,
	args: [],
	usage: "&pref;meme",
	/**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args
     * @param {String} curPrefix
	 */
    async execute(client, msg, args, curPrefix) {
        const memeJSON = require("../misc/memeVideos.json")
		var videoID = memeJSON[/* Math.floor(Math.random() * memeJSON.length) */849]
		var ytdlVideo = ytdl("https://www.youtube.com/watch?v=" + videoID, { quality: 18 })
		var videoURL = "https://www.youtube.com/watch?v=" + videoID
		var videoInfo = (await ytdl.getBasicInfo(videoURL)).videoDetails

        //see if video is unavailable
        if (videoInfo.isPrivate || !videoInfo.isCrawlable || videoInfo.isUnlisted) {
            return msg.channel.send("I accidently stumbled upon a privatised video, please try again.")
        }

        //format likes
		if (videoInfo.likes >= 1000) {
			var likes = Math.round(videoInfo.likes / 1000) + "K"
		} else {
			var likes = videoInfo.likes
		}

        //format dislikes
        if (videoInfo.dislikes >= 1000) {
			var dislikes = Math.round(videoInfo.dislikes / 1000) + "K"
		} else {
			var dislikes = videoInfo.dislikes || 0
		}

        //format views
		if (videoInfo.viewCount >= 1000) {
			var views = Math.round(videoInfo.viewCount / 1000) + "K"
		} else {
			var views = videoInfo.viewCount
		}
		likes = likes.toString()
		dislikes = dislikes.toString()

        msg.channel.sendTyping()
        lastMeme = Date.now()
        var attachment = new Discord.MessageAttachment(ytdlVideo, videoID+".mp4")
        setTimeout(function () {
            const embed = new Discord.MessageEmbed()
                .setColor("#FF0000")
                .setTitle(videoInfo.title)
                .setURL(videoURL)
                .addFields([
                    { name: "Uploader", value: "[" + videoInfo.author.name + "](" + videoInfo.author.channel_url + ")", inline: false },
                    { name: "Likes", value: likes, inline: true },
                    { name: "Dislikes", value: dislikes, inline: true },
                    { name: "Views", value: views, inline: true },
                ])
                .setTimestamp("timestamp")
                .setFooter("\u200B", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/800px-YouTube_full-color_icon_%282017%29.svg.png")
            msg.channel.send({ embeds: [embed], files: [/* "./"+videoID+".mp4" */attachment] }).then(() => {
                // fs.rmSync("./"+videoID+".mp4")
            })
        }, 500)
	},
}
