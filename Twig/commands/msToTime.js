
module.exports = {
    "name": "msToTime",
    
    execute(ms) {
        let seconds = Math.round(ms / 1000)
        let minutes = Math.round(ms / (1000 * 60))
        let hours = Math.round(ms / (1000 * 60 * 60))
        let days = Math.round(ms / (1000 * 60 * 60 * 24))
        if (seconds < 60){
            if (seconds == 1) {
                return seconds + " Second"
            }
            return seconds + " Seconds"
        }else if (minutes < 60){
            if (minutes == 1) {
                return minutes + " Minute"
            }
            return minutes + " Minutes"
        }else if (hours < 24){
            if (hours == 1) {
                return hours + " Hour"
            }
            return hours + " Hours"
        }
        else{
            if (days == 1) {
                return days + " Day"
            }
            return days + " Days"
        }
    }
}