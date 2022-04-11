const Discord = require("discord.js");
const { createCanvas, loadImage, cairoVersion } = require('canvas');

module.exports = {
    name: "no",
    aliases: [],
    guildOnly: false,
    memberpermissions: "",
    adminPermOverride: true,
    cooldown: 0,
    args: [""],
    usage: "&pref;no (your text)",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args 
     * @param {String} curPrefix 
     */
    async execute (client, msg, args, curPrefix)
    {
        const canvas = createCanvas(492, 445);
        const ctx = canvas.getContext("2d");

        args = msg.cleanContent.toUpperCase().split(" ")
        args.shift()
        var text = "NO " + args.join(" ") + "?";

        // Replace emojis, same code as in the !say command
        while (/<:\w.+?:\d+>/.test(text) == true) {
			var currentEmoji = /<:\w.+?:\d+>/.exec(text)[0].substring("2").split(":")[0]
            text = text.replace(/<:[^ ].+?:\d+>/, ":"+currentEmoji+":")
        }

        // Make image
        loadImage('images/no bitches.png').then(async (image) =>
        {
            ctx.drawImage(image, 0, 0);
            ctx.font = 'bold 55px "Arial"';
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = "black";
            var lines = getLines(ctx, text, canvas.width - 10);
            lines.forEach((line, i) =>
            {
                ctx.strokeText(line, canvas.width / 2, 55 * (i + 1));
                ctx.fillText(line, canvas.width / 2, 55 * (i + 1));
            });

            var attach = new Discord.MessageAttachment(canvas.toBuffer(), text + ".png")

            msg.channel.send({files: [attach]})
            msg.delete()
        });
    },
};

/**
 * 
 * @param {RenderingContext} ctx 
 * @param {String} text 
 * @param {number} maxWidth 
 * @returns 
 */
function getLines (ctx, text, maxWidth)
{
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];
    var hadToDoFunkyStuff = false;

    for (var i = 1; i < words.length; i++)
    {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth)
        {
            currentLine += " " + word;
        } else
        {

            // See if single word is too long, and if so, split it into equal chunks
            if (ctx.measureText(word).width >= maxWidth)
            {
                var chunks = divideEqual(word, Math.ceil(ctx.measureText(word).width / maxWidth));
                chunks.forEach((chunk) =>
                {
                    lines.push(chunk);
                });
                hadToDoFunkyStuff = true;
            } else
            {
                lines.push(currentLine);
                currentLine = word;
            }
        }
    }
    if (hadToDoFunkyStuff)
    {
        lines.unshift("NO");
    } else
    {
        lines.push(currentLine);
    }
    return lines;
}

/**
 * 
 * @param {String} str 
 * @param {Number} num 
 * @returns {Array}
 */
function divideEqual (str, num)
{
    const len = str.length / num;
    const creds = str.split("").reduce((acc, val) =>
    {
        let { res, currInd } = acc;
        if (!res[currInd] || res[currInd].length < len)
        {
            res[currInd] = (res[currInd] || "") + val;
        } else
        {
            res[++currInd] = val;
        };
        return { res, currInd };
    }, {
        res: [],
        currInd: 0
    });
    return creds.res;
};