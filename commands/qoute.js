const { createCanvas, loadImage, registerFont } = require("canvas");
const Discord = require("discord.js");

module.exports = {
    name: "qoute",
    aliases: ["quote"],
    guildOnly: false,
    memberpermissions: "",
    adminPermOverride: true,
    cooldown: 0,
    args: [],
    usage: "use &pref; to insert a prefix.",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args
     * @param {String} curPrefix
     */
    async execute(client, msg, args, curPrefix) {
        msg.channel.sendTyping()
        var usrPfp;
        var usrName;
        var text;
        if (msg.reference?.messageId) {
            var selectedMsg = await msg.channel.messages.fetch(
                msg.reference.messageId
            );
            text = selectedMsg.cleanContent;
            usrPfp = selectedMsg.member.displayAvatarURL({ format: "png", size: 2048 });
            usrName = selectedMsg.member.displayName;
        } else {
            var usr = msg.member;

            text = args.join(" ");
            text = text.replace(/\<\@[A-z0-9]*\>( )*/g, "");
            usrPfp = usr.displayAvatarURL({ format: "png", size: 2048 });
            usrName = usr.displayName;
        }

        if (text == "") {
            return msg.channel.send("No text found.")
        }

        const img = await this.generateImage(
            usrPfp,
            "https://source.unsplash.com/random/1920x1200/?nature",
            text,
            usrName
        );
        const attach = new Discord.MessageAttachment(img);
        attach.setName("qoute.png");

        msg.channel.send({ files: [attach] });
    },

    async generateImage(pfpUrl, bgUrl, text, username) {
        const canvas = createCanvas(1920, 1200);
        const ctx = canvas.getContext("2d");

        registerFont("./fonts/Lucida Handwriting Italic.ttf", {
            family: "Lucida Handwriting",
        });

        const pfp = await loadImage(pfpUrl);
        const bg = await loadImage(bgUrl);

        ctx.drawImage(bg, 0, 0, 1920, 1200);

        ctx.fillStyle = "black"
        ctx.globalAlpha = 0.5
        ctx.fillRect(0, 0, 1920, 1200)
        ctx.globalAlpha = 1


        ctx.drawImage(drawPfp(pfp), 0, 0, 1920, 1200);

        ctx.font = "64px 'Lucida Handwriting'";
        ctx.fillStyle = "white";

        var metrics = ctx.measureText(text.split("\n")[0]);
        var fontHeight = metrics.emHeightAscent + metrics.emHeightDescent;

        const lines = getLines(ctx, `"${text}"`, 1200);
        lines.forEach((line, i) => {
            ctx.fillText(line, 125, 800 + fontHeight * i);
        });

        ctx.textAlign = "right";

        const curDate = new Date(Date.now())
        ctx.fillText(`- ${username}, ${curDate.getFullYear()}`, 1800, 1100);

        return canvas.toBuffer("image/png");
    },
};

function drawPfp(pfp) {
    const canvas = createCanvas(1920, 1200);
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(1900, 0, 0, 1900, 0, 1200);
    gradient.addColorStop(0.5, "#ffffff80");
    gradient.addColorStop(1, "#ffffff00");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1920, 1200);

    ctx.globalCompositeOperation = "source-in";

    ctx.drawImage(pfp, 1920 - 1200, 0, 1200, 1200);
    return canvas;
}

function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}
