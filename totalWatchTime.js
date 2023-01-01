let timestamp = [];
function calculate(list) {
    for (let i = 0; i < list.length; ++i) {
        let obj = list[i];
        let duration = obj.finalDuration;
        timestamp.push(duration);
    }

    let totalHour = 0;
    let totalMinutes = 0;
    let totalSeconds = 0;
    for (let i = 0; i < timestamp.length; ++i) {
        let time = timestamp[i].split(':');
        if (time.length == 3) {
            totalHour += parseInt(time[0]);
            totalMinutes += parseInt(time[1]);
            totalSeconds += parseInt(time[2]);
        } else if (time.length == 2) {
            totalMinutes += parseInt(time[0]);
            totalSeconds += parseInt(time[1]);
        }
    }

    // console.log(totalHour + " - " + totalMinutes + " - " + totalSeconds);
    let sec = totalSeconds % 60;
    let min = (totalMinutes + parseInt((totalSeconds / 60 + "").split(".")[0])) % 60;
    let hour = totalHour + parseInt((totalMinutes + parseInt((totalSeconds / 60 + "").split(".")[0])) / 60 + "");
    let timeStr = hour + ":" + min + ":" + sec;
    return timeStr;
}

module.exports = {
    calculate: calculate
};