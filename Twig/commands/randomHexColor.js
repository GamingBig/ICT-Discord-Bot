module.exports = {
	name: "randomHexColor",

    /**
     * 
     * @param {Number} seed Seed
     */
	execute(seed) {
		var randomColor = Math.floor((Math.abs(Math.sin(seed) * 16777215)) % 16777215).toString(16);
        return "#"+randomColor
	},
}
