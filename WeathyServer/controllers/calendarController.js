const createError = require('http-errors');
const statusCode = require('../modules/statusCode');
const dateUtils = require('../utils/dateUtils');
const { calendarService } = require('../services');

module.exports = {
    getCalendarOverviews: async (req, res, next) => {
        const { userId } = req.params;
        const { start, end } = req.query;

        if (!start || !end) {
            return next(createError(400));
        }

        try {
            const validCalendarOverviewList = await calendarService.getValidCalendarOverviewList(
                userId,
                start,
                end
            );
            let calendarOverviewList = [];
            let curDay = new Date(start);
            let endDay = new Date(end);
            let pos = 0;
            while (curDay <= endDay) {
                if (
                    pos < validCalendarOverviewList.length &&
                    validCalendarOverviewList[pos].date ==
                        dateUtils.formatDate(curDay)
                ) {
                    calendarOverviewList.push(validCalendarOverviewList[pos++]);
                } else {
                    calendarOverviewList.push(null);
                }
                curDay.setDate(curDay.getDate() + 1);
            }
            res.status(statusCode.OK).json({
                calendarOverviewList,
                message: '캘린더 월 정보 조회 성공'
            });
            next();
        } catch (error) {
            switch (error.message) {
                default:
                    return next(createError(500));
            }
        }
    }
};
