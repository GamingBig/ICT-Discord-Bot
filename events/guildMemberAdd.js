const Discord = require("discord.js")

module.exports = {
    name: "guildMemberAdd",
    /**
     * @param {Discord.Client} client
     * @param {Discord.GuildMember} guildMember
     */
    async execute(client, guildMember) {
        var prefixConfig = require("../misc/prefixes.json")
        guildMember.roles.add(guildMember.guild.roles.cache.find(role => role.id == 889432612102373416));
        var curPrefix = prefixConfig[guildMember.guild.id]
        guildMember.guild.channels.cache.get("898123345751592970").send("Welcome " + guildMember.displayName + "!\n"
            + "\nPlease provide us with your real firstname so noone gets confused.\n"
            + "\nIf you want you can change your role name or role color use: `" + curPrefix + "role color (either hex color or color name)` and `" + curPrefix + "role name (name)`.\n"
            + "\nHave fun ||and please don't post porn in general, do that in <#882209669043609600>||")
    },
};