const scheduler = require('node-schedule');
const request = require('request-promise');

const openweather = require('../config/apiKeys.json');

function runTask() {
    const rules = new scheduler.RecurrenceRule();

    rules.hour = 0;

    scheduler.scheduleJob(rules, function () {
        console.log('schedule');
    });
}

async function getWeather(lat, lon) {
    //parameters: (위도, 경도)

    const options = {
        uri: openweather.uri,
        qs: {
            lat,
            lon,
            exclude: 'current,minutely,alerts',
            units: 'metric',
            appid: openweather.key,
        },
    };

    const data = await request(options);
    const obj = JSON.parse(data);
    const { hourly, daily } = obj;

    const hourlyList = changeToHourlyFormat(hourly);
    const dailyList = changeToDailyFormat(daily);

    console.log(hourlyList, dailyList);
}

function changeToHourlyFormat(weather) {
    const hourlyData = [];

    for (let h of weather) {
        const { dt, temp: temperature, weather } = h;
        const { id, icon } = weather[0];
        const dateTime = new Date(dt * 1000);
        const date = [
            dateTime.getFullYear(),
            dateTime.getMonth() + 1,
            dateTime.getDate(),
        ].join('-');
        const time = dateTime.getHours();

        //id & icon 변경 로직

        hourlyData.push({
            date,
            time,
            temperature,
            weatherId: id,
        });
    }

    return hourlyData;
}

function changeToDailyFormat(weather) {
    const dailyData = [];

    for (let d of weather) {
        const { dt, temp: temperature, humidity, wind_deg, weather } = d;
        const { min: minTemp, max: maxTemp } = temperature;
        const precipitation = Math.round(d.rain || d.snow || 0);
        const wind_speed = d.wind_speed.toFixed(1);
        const { id, icon } = weather[0];
        const time = new Date(dt * 1000);
        const dateParams = [
            time.getFullYear(),
            time.getMonth() + 1,
            time.getDate(),
        ].join('-');

        //id icon 변경
        dailyData.push({
            dateParams,
            minTemp,
            maxTemp,
            humidity,
            wind_deg,
            wind_speed,
            weatherId: id,
            precipitation, // 반올림?
        });
    }

    return dailyData;
}
