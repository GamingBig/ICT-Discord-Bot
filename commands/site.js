const Discord = require("discord.js");
const puppeteer = require("puppeteer");
const fs = require('fs');

module.exports = {
    name: "site",
    aliases: ["screeenshot"],
    guildOnly: false,
    memberpermissions: "",
    adminPermOverride: true,
    cooldown: 0,
    args: [""],
    usage: "&pref;site https://example.com/",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args 
     * @param {String} curPrefix 
     */
    async execute (client, msg, args, curPrefix)
    {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(args[0]);
            await page.screenshot({ path: "screenshot.png", fullPage: true});
            await browser.close();

            msg.channel.send({files: ["screenshot.png"]}).then(()=>{
                fs.rmSync("screenshot.png")
            })
        } catch (error) {
            if (error.toString().includes("invalid URL")) {
                error = "Not a valid URL"
            }
            console.log(error);
            const embed = new Discord.MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Error with dat')
            .setDescription(error.toString())
            
            msg.channel.send({embeds: [embed]});
        }
    },
};