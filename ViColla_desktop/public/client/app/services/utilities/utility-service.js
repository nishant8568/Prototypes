/**
 * Created by Antony on 12/21/2015.
 */

utilityModule.service('utilityService', function () {
    return ({
        formatDuration: formatDuration
    });

    function formatDuration(timeString) {
        var milliSec_num = parseInt(timeString, 10);
        var sec_num = Math.floor(milliSec_num/1000);
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        var timeFormatted = hours + ':' + minutes + ':' + seconds;
        return timeFormatted;
    }
});