const Discord = require("discord.js");
const { dismissButton } = require("../Twig/discord");
const games = new Discord.Collection();
const wordFile = require("../misc/wordle.json");
const { Canvas } = require("canvas");

module.exports = {
    name: "wordle",
    aliases: [],
    guildOnly: false,
    memberpermissions: "",
    adminPermOverride: true,
    cooldown: 0,
    args: [],
    usage: "&pref;wordle",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args 
     * @param {String} curPrefix 
     */
    async execute (client, msg, args, curPrefix)
    {
        if (!games.has(msg.channelId))
        {
            var word = wordFile.at(Math.random() * wordFile.length);
            var game = {
                word: word,
                guesses: []
            };
            games.set(msg.channelId, game);
        }

        var game = games.get(msg.channelId);

        if (!args[0] || args[0].length !== 5)
        {
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Invalid input')
                .setDescription('Please fill in valid a 5 letter word');

            msg.channel.send({ embeds: [embed], components: [dismissButton] });
            return;
        }
        if (!wordFile.includes(args[0]))
        {
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Unknown word!')
                .setDescription('Please fill in valid a 5 letter word');

            msg.channel.send({ embeds: [embed], components: [dismissButton] });
            return;
        }

        var guess = args[0];

        var Gresult = [" N", " N", " N", " N", " N"];
        var hasHadLetter = "";
        for (let i = 0; i < guess.length; i++)
        {
            const Gletter = guess[i];

            let letterPosition = game.word.indexOf(Gletter);

            if (letterPosition === -1)
            {
                Gresult[i] = Gletter + "N";
            } else
            {
                //? Check if there is another spot in the word with a green letter of the same
                var correctLetters = []
                for (let j = 0; j < game.word.length; j++) {
                    const wLetter = game.word[j];
                    const G2Letter = guess[j];
                    if (G2Letter == wLetter) {
                        correctLetters.push(wLetter)
                    }
                }
                if (Gletter === game.word.charAt(i))
                {
                    Gresult[i] = Gletter + "G";
                } else if(!correctLetters.includes(Gletter) && !hasHadLetter.includes(Gletter))
                {
                    Gresult[i] = Gletter + "Y";
                    hasHadLetter += Gletter
                }else {
                    Gresult[i] = Gletter + "N";
                }
            }
        }

        game.guesses.push(Gresult);

        //? Make image

        const canvas = new Canvas(350, 415);
        const ctx = canvas.getContext("2d");

        ctx.font = 'bold 48px Arial';
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';

        var hasWon = null;

        for (let y = 0; y < 6; y++)
        {
            const row = game.guesses[y] || [" N", " N", " N", " N", " N"];

            row.forEach((letter, x) =>
            {
                switch (letter.split("")[1])
                {
                    case "N":
                        var color = "#3a3a3c";
                        break;
                    case "Y":
                        var color = "#aea04b";
                        break;
                    case "G":
                        var color = "#678c55";
                        break;

                    default:
                        var color = "#121213";
                        break;
                }

                ctx.fillStyle = color;
                var square = ctx.fillRect((62 * x) + (5 * (x + 1)), (62 * y) + (5 * (y + 1)), 62, 62);

                if (letter !== " N")
                {
                    ctx.fillStyle = "White";
                    ctx.fillText(letter.split("")[0].toUpperCase(), (62 * (x + 0.5)) + (5 * (x + 1)), (62 * (y + 0.5)) + (5 * (y + 1)));
                }
            });

            var amCorrect = 0;
            row.forEach((letter) =>
            {
                if (letter.split("")[1] == "G")
                {
                    amCorrect++;
                }
            });
            if (amCorrect == 5)
            {
                hasWon = true;
            }
        }

        const img = canvas.toBuffer("image/png");
        const attach = new Discord.MessageAttachment(img, "wordle.png");

        if (game.guesses.length == 6 && !hasWon)
        {
            const embed = new Discord.MessageEmbed()
                .setColor('#3a3a3c')
                .setTitle('Too bad!')
                .setDescription('Better luck next time!\nThe word was: `' + game.word + "`")
                .setImage("attachment://wordle.png");

            msg.channel.send({ embeds: [embed], files: [attach] });
            games.delete(msg.channelId);
        } else if (hasWon == true)
        {
            const embed = new Discord.MessageEmbed()
                .setColor('#728b5b')
                .setTitle('Congratulations!')
                .setImage("attachment://wordle.png");

            msg.channel.send({ embeds: [embed], files: [attach] });

            games.delete(msg.channelId);
        } else
        {
            msg.channel.send({ files: [attach] });
        }
    },
};