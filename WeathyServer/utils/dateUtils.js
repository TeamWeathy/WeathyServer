const day_of_week = [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일'
];

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
    }
};
