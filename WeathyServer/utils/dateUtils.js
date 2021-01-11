const day_of_week = [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일'
];

const formatDate = (d) => {
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
};

module.exports = {
    getYear: (date) => {
        return parseInt(date.split('-')[0]);
    },
    getMonth: (date) => {
        return parseInt(date.split('-')[1]);
    },
    getDay: (date) => {
        return parseInt(date.split('-')[2]);
    },
    getYoil: (date) => {
        const today = new Date(date).getDay();
        return day_of_week[today];
    },
    format24: (hour) => {
        return hour + '시';
    },
    format12: (hour) => {
        if (hour == 0) {
            return '오전 12시';
        } else if (hour == 12) {
            return '오후 12시';
        } else if (hour > 12) {
            return '오후 ' + (hour - 12) + '시';
        } else {
            return '오전 ' + hour + '시';
        }
    },
    formatDate,
    getNextHour: (date, time) => {
        let day = new Date(date);
        ++time;
        if (time == 24) {
            day.setDate(day.getDate() + 1);
            time = 0;
        }
        return { next_date: formatDate(day), next_time: time };
    },
    getNextDay: (date) => {
        let day = new Date(date);
        day.setDate(day.getDate() + 1);
        return formatDate(day);
    }
};
