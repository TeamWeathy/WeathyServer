const createError = require('http-errors');
const exception = require('../modules/exception');
const statusCode = require('../modules/statusCode');
const dateUtils = require('../utils/dateUtils');
const { tokenService, calendarService } = require('../services');

module.exports = {
    getCalendarOverviews: async (req, res, next) => {
        const { userId } = req.params;
        const { token } = req.body;
        const { start, end } = req.query;

        if (!token || !start || !end) {
            return next(createError(400));
        }

        try {
            tokenService.validateTokenWithUserId(userId, token);
            const validCalendarOverviewList = await calendarService.getValidCalendarOverviewList(
                userId,
                start,
                end
            );
            let calendarOverviewList = [];
            let curDay = Date(start);
            let endDay = Date(end);
            let pos = 0;
            while (curDay.getDate() <= endDay.getDate()) {
                if (
                    pos < validCalendarOverviewList.length &&
                    validCalendarOverviewList[pos].date ==
                        dateUtils.formatDate(curDay)
                ) {
                    calendarOverviewList.push(validCalendarOverviewList[pos]);
                } else {
                    calendarOverviewList.push(null);
                }
                curDay.setDate(curDay.getDate() + 1);
            }
            return res.status(statusCode.OK).json({
                calendarOverviewList,
                message: '캘린더 월 정보 조회 성공'
            });
        } catch (error) {
            switch (error.message) {
                case exception.INVALID_TOKEN:
                case exception.MISMATCH_TOKEN:
                    return next(createError(401));
                default:
                    return next(createError(500));
            }
        }
    }
};
