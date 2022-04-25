/* 
    Twig is a custom made module to do simple things like converting amount of milliseconds to a time (840000 > 14 Minutes)
*/

exports.msToTime = require("./commands/msToTime").execute
exports.getRandomInt = require("./commands/getRandomInt").execute
exports.capitalizeFirst = require("./commands/capitalizeFirst").execute
exports.randomHexColor = require("./commands/randomHexColor").execute

exports.Discord = require("./discord")