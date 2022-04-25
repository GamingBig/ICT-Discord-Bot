module.exports = {
    "name": "capitalizeFirst",
    
    /**
     * @param {String} text 
     * @param {Boolean} lowerRest Lowercase the rest of the string?
     * @returns String
     */
    execute(text, lowerRest) {
        let rest = lowerRest ? text.toLowerCase().slice(1) : text.slice(1)
        return text.charAt(0).toUpperCase() + rest
    }
}