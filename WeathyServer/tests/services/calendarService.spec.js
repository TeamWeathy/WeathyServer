const assert = require('assert');
const { calendarService } = require('../../services');

describe('calendarService test', function () {
    describe('getValidCalendarOverviewList test', function () {
        it('getValidCalendarOverviewList returns CalendarOverviewList', async function () {
            const validCalendarOverviews = calendarService.getValidCalendarOverviewList(
                1,
                '2021-01-01',
                '2021-01-02'
            );
            assert.ok((await validCalendarOverviews).length, 2);
        });

        it('getValidCalendarOverviewList returns CalendarOverviewList', async function () {
            const validCalendarOverviews = calendarService.getValidCalendarOverviewList(
                1,
                '2021-01-01',
                '2021-01-08'
            );
            assert.ok((await validCalendarOverviews).length, 2);
        });
    });
});
